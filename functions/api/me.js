import {json,auth} from '../_shared.js';
export async function onRequestGet({request,env}){const u=await auth(request,env);if(!u)return json({authenticated:false},401);return json({authenticated:true,user:{username:u.username,display_name:u.display_name,role:u.role}})}
