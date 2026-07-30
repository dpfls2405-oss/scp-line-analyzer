const https=require('https');
// ① 방어: 유효 문자만 남기고 전부 제거 (제로폭 공백·제어문자·비ASCII 등 헤더 ERR_INVALID_CHAR 유발 문자 차단)
//   host = 호스트명(https://·슬래시 제거 후 도메인 문자만), key = JWT/base64url 문자만
const SUPA_HOST=(process.env.SUPABASE_HOST||'').replace(/^https?:\/\//i,'').replace(/[^a-zA-Z0-9.-]/g,'');
const SUPA_KEY=(process.env.SUPABASE_ANON_KEY||'').replace(/[^A-Za-z0-9._-]/g,'');

function supaReq(method,path,body){
  return new Promise((resolve,reject)=>{
    const opts={hostname:SUPA_HOST,port:443,path:`/rest/v1/${path}`,method,
      headers:{'apikey':SUPA_KEY,'Authorization':`Bearer ${SUPA_KEY}`,'Content-Type':'application/json','Prefer':'return=representation'}};
    const req=https.request(opts,res=>{
      // 청크(Buffer)를 그대로 모은 뒤 마지막에 한 번만 UTF-8 디코딩.
      // (개별 청크를 data+=c 로 이어붙이면 한글 등 멀티바이트 문자가
      //  청크 경계에서 잘려 �(U+FFFD)로 손상됨)
      const chunks=[];
      res.on('data',c=>chunks.push(c));
      res.on('end',()=>{const data=Buffer.concat(chunks).toString('utf8');try{resolve({status:res.statusCode,data:JSON.parse(data)});}catch(e){resolve({status:res.statusCode,data});}});
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
  // ② 진단: 환경변수 설정 여부를 화면에 노출
  if(!SUPA_HOST||!SUPA_KEY){
    return res.status(500).json({error:`ENV미설정 host=${SUPA_HOST?'OK':'없음'} key=${SUPA_KEY?'OK':'없음'}`});
  }
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
  }catch(e){
    // ② 진단: 실제 연결 오류와 host 값을 화면에 노출
    return res.status(500).json({error:`연결실패 host=${SUPA_HOST} err=${(e&&(e.code||e.message))||String(e)}`});
  }
};
