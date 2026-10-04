import {describe,expect,it} from 'vitest';
import {handleLocalGuestRequest,isLocalGuestRequest,LOCAL_GUEST_TOKEN,LOCAL_GUEST_USER} from './local-guest';

function memoryStorage(){
  const items=new Map<string,string>();
  return {getItem:(key:string)=>items.get(key)??null,setItem:(key:string,value:string)=>{items.set(key,value)},removeItem:(key:string)=>{items.delete(key)}};
}
const api='https://api.example.test';
const post=(body:unknown)=>({method:'POST',body:JSON.stringify(body)});

describe('local guest API',()=>{
  it('is disabled outside the development server',()=>{
    expect(isLocalGuestRequest({headers:{Authorization:`Bearer ${LOCAL_GUEST_TOKEN}`}})).toBe(false);
  });

  it('returns the guest user for the session check',()=>{
    expect(handleLocalGuestRequest(`${api}/api/auth/me`,{},memoryStorage())).toEqual({status:200,body:{user:LOCAL_GUEST_USER}});
  });

  it('persists bookmarks, follows and preferences in the given storage',()=>{
    const storage=memoryStorage();
    handleLocalGuestRequest(`${api}/api/bookmarks`,post({slug:'a',saved:true}),storage);
    handleLocalGuestRequest(`${api}/api/bookmarks`,post({slug:'b',saved:true}),storage);
    handleLocalGuestRequest(`${api}/api/bookmarks`,post({slug:'a',saved:false}),storage);
    expect(handleLocalGuestRequest(`${api}/api/bookmarks`,{},storage).body).toEqual({slugs:['b']});

    handleLocalGuestRequest(`${api}/api/source-follows`,post({sourceSlug:'gto-wizard',followed:true}),storage);
    expect(handleLocalGuestRequest(`${api}/api/source-follows`,{method:'GET'},storage).body).toEqual({sourceSlugs:['gto-wizard']});

    handleLocalGuestRequest(`${api}/api/preferences`,post({theme:'dark'}),storage);
    expect(handleLocalGuestRequest(`${api}/api/preferences`,{},storage).body).toMatchObject({theme:'dark',language:'Japanese'});
  });

  it('records one learning event per article per day',()=>{
    const storage=memoryStorage();
    handleLocalGuestRequest(`${api}/api/learning-history`,post({slug:'a',openedAt:'2026-10-04T01:00:00.000Z'}),storage);
    handleLocalGuestRequest(`${api}/api/learning-history`,post({slug:'a',openedAt:'2026-10-04T05:00:00.000Z'}),storage);
    expect(handleLocalGuestRequest(`${api}/api/learning-history`,{},storage).body).toEqual({events:[{slug:'a',openedAt:'2026-10-04T01:00:00.000Z'}]});
  });

  it('rejects password changes and clears data on account deletion',()=>{
    const storage=memoryStorage();
    expect(handleLocalGuestRequest(`${api}/api/auth/password`,post({}),storage).status).toBe(400);
    handleLocalGuestRequest(`${api}/api/bookmarks`,post({slug:'a',saved:true}),storage);
    handleLocalGuestRequest(`${api}/api/auth/account`,{method:'DELETE'},storage);
    expect(handleLocalGuestRequest(`${api}/api/bookmarks`,{},storage).body).toEqual({slugs:[]});
  });
});
