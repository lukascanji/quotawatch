import crypto from 'node:crypto';
const secret=()=>process.env.NEWSLETTER_SECRET||process.env.RESEND_API_KEY||'';
const b64=s=>Buffer.from(s).toString('base64url');
export function sign(email,ttlH=48){const p=b64(JSON.stringify({e:email,x:Date.now()+ttlH*3600e3}));return p+'.'+crypto.createHmac('sha256',secret()).update(p).digest('base64url')}
export function verify(t){const [p,s]=String(t||'').split('.');if(!p||!s||!secret())return null;const ok=crypto.createHmac('sha256',secret()).update(p).digest('base64url');
 if(ok.length!==s.length||!crypto.timingSafeEqual(Buffer.from(ok),Buffer.from(s)))return null;const d=JSON.parse(Buffer.from(p,'base64url'));return d.x>Date.now()?d.e:null}
export const enabled=()=>Boolean(process.env.RESEND_API_KEY&&process.env.RESEND_AUDIENCE_ID&&process.env.NEWSLETTER_FROM);
export async function resend(path,method,body){const r=await fetch('https://api.resend.com'+path,{method,headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify(body)});return {ok:r.ok,status:r.status,data:await r.json().catch(()=>({}))}}
