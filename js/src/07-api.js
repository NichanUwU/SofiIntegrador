/* ============================================================
   SOFI · API CLIENT (scaffolding)
   Provee funciones simples para llamar al backend desde el frontend.
   Edita `api.setBaseUrl(...)` con la URL de tu servidor antes de usar.
   ============================================================ */

window.api = (function(){
  let baseUrl = '';

  function setBaseUrl(url){ baseUrl = url.replace(/\/+$/,''); }

  async function request(path, opts){
    const url = path.startsWith('http') ? path : (baseUrl + '/' + path.replace(/^\/+/,''));
    const cfg = Object.assign({ headers: { 'Content-Type': 'application/json' } }, opts || {});
    if (cfg.body && typeof cfg.body === 'object' && !(cfg.body instanceof FormData)) cfg.body = JSON.stringify(cfg.body);
    const res = await fetch(url, cfg);
    const ct = res.headers.get('content-type') || '';
    const isJson = ct.includes('application/json');
    const body = isJson ? await res.json() : await res.text();
    if (!res.ok) throw { status: res.status, body };
    return body;
  }

  function get(path){ return request(path, { method: 'GET' }); }
  function post(path, data){ return request(path, { method: 'POST', body: data }); }
  function put(path, data){ return request(path, { method: 'PUT', body: data }); }
  function del(path){ return request(path, { method: 'DELETE' }); }

  // Convenience: login example — adapt backend endpoint
  async function login(email){
    if (!email) throw new Error('email required');
    return post('/auth/login', { email });
  }

  return { setBaseUrl, get, post, put, del, login };
})();
