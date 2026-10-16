import {sign,enabled,resend} from '../lib/token.js';
const SITE=(process.env.SITE_URL||'https://quotawatch.vercel.app').replace(/\/$/,'');
export default async function handler(req,res){
 if(req.method!=='POST')return res.status(405).json({error:'POST only'});
 if(!enabled())return res.status(503).json({error:'Newsletter not open yet'});
 const email=String((req.body&&req.body.email)||'').trim().toLowerCase();
 if(!/^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,}$/.test(email)||(req.body&&req.body.website))return res.status(400).json({error:'Invalid email'});
 const A=process.env.RESEND_AUDIENCE_ID;
 // pending = stored unsubscribed until confirmed
 await resend(`/audiences/${A}/contacts`,'POST',{email,unsubscribed:true});
 const link=`${SITE}/api/confirm/?t=${encodeURIComponent(sign(email))}`;
 const r=await resend('/emails','POST',{from:process.env.NEWSLETTER_FROM,to:[email],subject:'Confirm your QuotaWatch alerts',
  text:`Confirm you want QuotaWatch emails when AI coding plan limits change:\n\n${link}\n\nThis link expires in 48 hours. If you didn't sign up, ignore this email and nothing happens.`,
  html:`<p>Confirm you want QuotaWatch emails when AI coding plan limits change:</p><p><a href="${link}">Confirm subscription</a></p><p>This link expires in 48 hours. If you didn't sign up, ignore this email and nothing happens.</p>`});
 if(!r.ok)return res.status(502).json({error:'Could not send confirmation'});
 return res.status(200).json({ok:true});
}
