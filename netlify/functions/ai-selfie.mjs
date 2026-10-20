const headers={'content-type':'application/json','cache-control':'no-store'};
export default async req=>{
 if(req.method!=='POST')return new Response('',{status:405,headers});
 if(!process.env.OPENAI_API_KEY)return new Response(JSON.stringify({error:'AI-selfies zijn nog niet geactiveerd. Stel OPENAI_API_KEY in op Netlify.'}),{status:503,headers});
 try{
  const {image,teamName}=await req.json();if(!image?.startsWith('data:image/'))throw new Error('Geen geldige foto');
  const blob=await (await fetch(image)).blob(),form=new FormData();form.append('model',process.env.OPENAI_IMAGE_MODEL||'gpt-image-1');form.append('image',blob,'selfie.jpg');form.append('prompt',`Turn this team selfie into a joyful premium 3D Christmas portrait for team ${String(teamName||'').slice(0,30)}. Dark forest green backdrop, warm cinematic light, tasteful Santa hats and festive details. Preserve every person's recognizable face, age, skin tone and expression. No text, logos or extra people.`);form.append('size','1024x1024');
  const api=await fetch('https://api.openai.com/v1/images/edits',{method:'POST',headers:{authorization:`Bearer ${process.env.OPENAI_API_KEY}`},body:form});const data=await api.json();if(!api.ok)throw new Error(data.error?.message||'AI-verwerking mislukt');const out=data.data?.[0];const result=out?.b64_json?`data:image/png;base64,${out.b64_json}`:out?.url;if(!result)throw new Error('Geen afbeelding ontvangen');return new Response(JSON.stringify({image:result}),{headers});
 }catch(error){console.error(error);return new Response(JSON.stringify({error:error.message||'AI-selfie mislukt'}),{status:500,headers})}
};
