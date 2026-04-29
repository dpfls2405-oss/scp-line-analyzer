const SUPA_URL='https://vjkpinqzfqcmaqrsyobo.supabase.co';
const SUPA_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqa3BpbnF6ZnFjbWFxcnN5b2JvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5NzYwNjAsImV4cCI6MjA1ODU1MjA2MH0.gFDTjPlOBfBMNzkDNwkyz9Ri3EhWpHFpvfOmCMOkIVA';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS')return res.status(200).end();

  try{
    if(req.method==='POST'){
      const r=await fetch(`${SUPA_URL}/rest/v1/scp_shares`,{
        method:'POST',
        headers:{'apikey':SUPA_KEY,'Content-Type':'application/json','Prefer':'return=representation'},
        body:JSON.stringify(req.body)
      });
      const data=await r.json();
      return res.status(r.status).json(data);
    }
    if(req.method==='GET'){
      const id=req.query.id;
      if(!id)return res.status(400).json({error:'id required'});
      const r=await fetch(`${SUPA_URL}/rest/v1/scp_shares?id=eq.${id}&select=data,created_at,expires_at`,{
        headers:{'apikey':SUPA_KEY}
      });
      const data=await r.json();
      return res.status(r.status).json(data);
    }
    return res.status(405).json({error:'method not allowed'});
  }catch(e){
    return res.status(500).json({error:e.message});
  }
};
