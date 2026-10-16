import {verify,enabled,resend} from '../lib/token.js';
export default async function handler(req,res){
 if(!enabled())return res.redirect(302,'/subscribe/confirm/?status=closed');
 const email=verify(req.query.t);
 if(!email)return res.redirect(302,'/subscribe/confirm/?status=invalid');
 const A=process.env.RESEND_AUDIENCE_ID;
 const r=await resend(`/audiences/${A}/contacts/${encodeURIComponent(email)}`,'PATCH',{unsubscribed:false});
 if(!r.ok){const c=await resend(`/audiences/${A}/contacts`,'POST',{email,unsubscribed:false});if(!c.ok)return res.redirect(302,'/subscribe/confirm/?status=error')}
 return res.redirect(302,'/subscribe/thanks/');
}
