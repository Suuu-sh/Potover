import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {afterEach,describe,expect,it,vi} from 'vitest';
import worker from '../worker/src/index.ts';

const databases=[];
const now='2026-10-03T03:00:00.000Z';
const old='2023-01-01T00:00:00.000Z';
function fixture(){
  const sqlite=new DatabaseSync(':memory:');
  databases.push(sqlite);
  const migrations=readdirSync('worker/migrations').filter(file=>file.endsWith('.sql')).sort();
  for(const file of migrations.filter(file=>file<'0007_'))sqlite.exec(readFileSync(`worker/migrations/${file}`,'utf8'));
  sqlite.prepare('INSERT INTO users(id,email,password_hash,password_salt,created_at,last_activity_at) VALUES(?,?,?,?,?,?)')
    .run('legacy','legacy@example.test','unused','unused',old,old);
  for(const file of migrations.filter(file=>file>='0007_'))sqlite.exec(readFileSync(`worker/migrations/${file}`,'utf8'));
  const DB={
    prepare(query){
      let values=[];
      const statement={
        bind(...args){values=args;return statement},
        async first(){return sqlite.prepare(query).get(...values)??null},
        async run(){return sqlite.prepare(query).run(...values)},
      };
      return statement;
    },
    async batch(statements){
      sqlite.exec('BEGIN');
      try{for(const statement of statements)await statement.run();sqlite.exec('COMMIT')}
      catch(error){sqlite.exec('ROLLBACK');throw error}
      return [];
    },
  };
  return {sqlite,DB};
}
function account(sqlite,id,activity,verified=1){
  sqlite.prepare('INSERT INTO users(id,email,password_hash,password_salt,created_at,last_activity_at,last_activity_verified) VALUES(?,?,?,?,?,?,?)')
    .run(id,`${id}@example.test`,'unused','unused',old,activity,verified);
  sqlite.prepare('INSERT INTO bookmarks(user_id,article_slug) VALUES(?,?)').run(id,'test-article');
  sqlite.prepare('INSERT INTO learning_history(user_id,article_slug,opened_date,opened_at) VALUES(?,?,?,?)').run(id,'test-article','2023-01-01',old);
  sqlite.prepare('INSERT INTO source_follows(user_id,source_slug) VALUES(?,?)').run(id,'test-source');
  sqlite.prepare('INSERT INTO user_preferences(user_id) VALUES(?)').run(id);
}
afterEach(()=>{vi.useRealTimers();for(const db of databases.splice(0))db.close()});

describe('account retention approval and verified activity',()=>{
  it('does not turn legacy migration timestamps into verified activity',()=>{
    const {sqlite}=fixture();
    expect({...sqlite.prepare('SELECT last_activity_at,last_activity_verified FROM users WHERE id=?').get('legacy')})
      .toEqual({last_activity_at:old,last_activity_verified:0});
  });
  it.each([undefined,'','false','TRUE','1',' true'])('keeps accounts and saved data unless the flag is exactly true: %j',async flag=>{
    vi.useFakeTimers();vi.setSystemTime(new Date(now));
    const {sqlite,DB}=fixture();
    account(sqlite,'verified-stale',old);
    sqlite.prepare('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,?)').run('expired','verified-stale',old);
    sqlite.prepare('INSERT INTO auth_rate_limits VALUES(?,?,?,?)').run('login','test-client',0,1);
    await worker.scheduled({}, {DB,POTOVER_ACCOUNT_RETENTION_ENABLED:flag});
    expect(sqlite.prepare('SELECT COUNT(*) AS count FROM users').get().count).toBe(2);
    for(const table of ['bookmarks','learning_history','source_follows','user_preferences']){
      expect(sqlite.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get().count).toBe(1);
    }
    for(const table of ['sessions','auth_rate_limits']){
      expect(sqlite.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get().count).toBe(0);
    }
  });
  it('deletes only verified stale accounts, preserving unknown, recent, invalid and boundary dates',async()=>{
    vi.useFakeTimers();vi.setSystemTime(new Date(now));
    const {sqlite,DB}=fixture();
    account(sqlite,'verified-stale',old);
    account(sqlite,'recent',now);
    account(sqlite,'boundary','2024-10-03T03:00:00.000Z');
    account(sqlite,'missing',null);
    account(sqlite,'invalid','unknown');
    await worker.scheduled({}, {DB,POTOVER_ACCOUNT_RETENTION_ENABLED:'true'});
    expect(sqlite.prepare('SELECT id FROM users ORDER BY id').all().map(row=>row.id))
      .toEqual(['boundary','invalid','legacy','missing','recent']);
    for(const table of ['bookmarks','learning_history','source_follows','user_preferences']){
      expect(sqlite.prepare(`SELECT COUNT(*) AS count FROM ${table} WHERE user_id=?`).get('verified-stale').count).toBe(0);
      expect(sqlite.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get().count).toBe(4);
    }
  });
  it.each([true,false])('marks only a valid authenticated session as observed activity: %j',async valid=>{
    vi.useFakeTimers();vi.setSystemTime(new Date(now));
    const {sqlite,DB}=fixture();
    const token='local-test-session';
    const hash=Buffer.from(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token))).toString('hex');
    sqlite.prepare('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,?)').run(hash,'legacy',valid?'2026-11-01T00:00:00.000Z':old);
    const response=await worker.fetch(new Request('https://api.example.test/api/auth/me',{headers:{Authorization:`Bearer ${token}`}}),{DB});
    expect(response.status).toBe(valid?200:401);
    expect({...sqlite.prepare('SELECT last_activity_at,last_activity_verified FROM users WHERE id=?').get('legacy')})
      .toEqual({last_activity_at:valid?now:old,last_activity_verified:valid?1:0});
  });
});
