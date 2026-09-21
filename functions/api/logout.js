import {json,cookieToken,sha256} from '../_shared.js';
export async function onRequestPost({request,env}){const t=cookieToken(request);if(t)await env.DB.prepare('DELETE FROM sessions WHERE token_hash=?').bind(await sha256(t)).run();return json({ok:true},{headers:{'set-cookie':'rl_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0'}})}
