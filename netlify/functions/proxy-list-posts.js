export async function handler(event) {
  const target = 'https://cleaning-collages.netlify.app/.netlify/functions/list-posts';
  try{
    const r = await fetch(target, { headers: { 'accept': 'application/json' } });
    const text = await r.text();
    const statusCode = r.status || 200;
    return {
      statusCode,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'access-control-allow-origin': '*',
        'cache-control': 'no-store'
      },
      body: text
    };
  }catch(e){
    return {
      statusCode: 502,
      headers: { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*' },
      body: JSON.stringify({ error: String(e && (e.message || e)) })
    };
  }
}
