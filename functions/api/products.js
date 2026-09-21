import {json,auth} from '../_shared.js';
export async function onRequestGet({request,env}){if(!(await auth(request,env)))return json({error:'ログインが必要です'},401);const {results}=await env.DB.prepare('SELECT id,category,name,price,pd_ems_half,max_qty,sort_order FROM products WHERE active=1 ORDER BY sort_order,id').all();return json({products:results})}
