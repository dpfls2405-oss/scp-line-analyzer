const https=require('https');
const SUPA_HOST='vjkpinqzfqcmaqrsyobo.supabase.co';
const SUPA_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqa3BpbnF6ZnFjbWFxcnN5b2JvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5NzYwNjAsImV4cCI6MjA1ODU1MjA2MH0.gFDTjPlOBfBMNzkDNwkyz9Ri3EhWpHFpvfOmCMOkIVA';

function supaReq(method,path,body){
  return new Promise((resolve,reject)=>{
    const opts={hostname:SUPA_HOST,port:443,path:`/rest/v1/${path}`,method,
      headers:{'apikey':SUPA_KEY,'Content-Type':'application/json','Prefer':'return=representation'}};
    const req=https.request(opts,res=>{
      let data='';
      res.on('data',c=>data+=c);
      res.on('end',()=>{try{resolve({status:res.statusCode,data:JSON.parse(data)});}catch(e){resolve({status:res.statusCode,data});}});
    });
    req.on('error',reject);
    if(body)req.write(JSON.stringify(body));
    req.end();
  });
}

module.exports=async function(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS')return res.status(200).end();
  try{
    if(req.method==='POST'){
      const r=await supaReq('POST','scp_shares',req.body);
      return res.status(r.status).json(r.data);
    }
    if(req.method==='GET'){
      const id=req.query.id;
      if(!id)return res.status(400).json({error:'id required'});
      const r=await supaReq('GET',`scp_shares?id=eq.${id}&select=data,created_at,expires_at`);
      return res.status(r.status).json(r.data);
    }
    return res.status(405).json({error:'method not allowed'});
  }catch(e){return res.status(500).json({error:e.message});}
};
