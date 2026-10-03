import {afterEach,expect,it,vi} from 'vitest';

const io=vi.hoisted(()=>({readFile:vi.fn(),writeFile:vi.fn()}));
vi.mock('node:fs/promises',()=>io);
afterEach(()=>{vi.unstubAllGlobals();vi.resetModules();vi.clearAllMocks()});

it('uses the WordPress excerpt rather than copying opening text from the article body',async()=>{
  io.readFile.mockResolvedValue(JSON.stringify({sources:[],articles:[]}));
  vi.stubGlobal('fetch',vi.fn(async(url)=>{
    if(String(url).includes('japan.gtowizard.com/wp-json'))return Response.json([{
      title:{rendered:'Sample article'},excerpt:{rendered:'<p>Published excerpt</p>'},
      content:{rendered:'<p>Full article body that must not be copied.</p>'},
      link:'https://example.test/article',date:'2026-10-01T00:00:00Z',
    }],{headers:{'x-wp-totalpages':'1'}});
    if(String(url).includes('pokercoaching.com/blog/wp-json'))return Response.json([]);
    return new Response('');
  }));
  await import('./collect-public-sources.mjs');
  const snapshot=JSON.parse(io.writeFile.mock.calls[0][1]);
  expect(snapshot.articles).toHaveLength(1);
  expect(snapshot.articles[0].summary).toBe('Published excerpt');
  expect(JSON.stringify(snapshot)).not.toContain('Full article body');
});

it('collects YouTube feed metadata without fetching watch HTML and preserves existing durations',async()=>{
  io.readFile.mockResolvedValue(JSON.stringify({sources:[],articles:[{
    originalUrl:'https://www.youtube.com/watch?v=sample-video',slug:'existing-video',durationSeconds:42,
  }]}));
  const fetch=vi.fn(async(url)=>{
    expect(String(url)).toContain('/feeds/videos.xml?channel_id=');
    return new Response('<feed><entry><yt:videoId>sample-video</yt:videoId><title>Sample video</title><media:description>Feed description</media:description><published>2026-10-01T00:00:00Z</published></entry></feed>');
  });
  vi.stubGlobal('fetch',fetch);
  await import('./collect-youtube.mjs');
  const snapshot=JSON.parse(io.writeFile.mock.calls[0][1]);
  expect(fetch).toHaveBeenCalledTimes(2);
  expect(snapshot.articles).toHaveLength(1);
  expect(snapshot.articles[0].durationSeconds).toBe(42);
  expect(snapshot.articles[0].slug).toBe('existing-video');
  expect(snapshot.articles[0].summary).toBe('Feed description');
});
