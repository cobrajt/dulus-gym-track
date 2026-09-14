// Private server job. Never accepts bucket names, paths or ages from a caller.
// Storage API removes file bytes; SQL only selects candidates. Comments stay intact.
import { createClient } from "npm:@supabase/supabase-js@2.116.0";
export async function handleCleanup(req, db) {
 const reply=(body,status=200)=>Response.json(body,{status});
 if(req.method!=="POST")return reply({error:"Method not allowed"},405);
 const token=req.headers.get("x-cleanup-token");
 if(!token||!/^[a-f0-9]{64}$/.test(token))return reply({error:"Unauthorized"},401);
 const {data:context,error}=await db.rpc("dulus_video_cleanup_context",{p_token:token});
 if(error||!context)return reply({error:"Unauthorized"},403);
 let input;try{input=await req.json();}catch{return reply({error:"Invalid JSON"},400);}
 if(input?.dry_run===true)return reply({dry_run:true,candidates:context.paths.length,enabled:context.enabled});
 if(context.enabled!==true)return reply({enabled:false,deleted:0});
 if(!Array.isArray(context.paths)||context.paths.length>100||context.paths.some(p=>typeof p!=="string"||!p))return reply({error:"Invalid candidates"},500);
 if(!context.paths.length)return reply({deleted:0});
 const {error:removeError}=await db.storage.from("dulus-technique").remove(context.paths);
 if(removeError){console.error("Technique retention: Storage removal failed");return reply({error:"Storage deletion failed; will retry"},502);}
 return reply({deleted:context.paths.length});
}
Deno.serve(async(req)=>{
 try{
  const db=createClient(Deno.env.get("SUPABASE_URL"),Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),{auth:{persistSession:false,autoRefreshToken:false}});
  return await handleCleanup(req,db);
 }catch{console.error("Technique retention: job failed");return Response.json({error:"Cleanup failed; will retry"},{status:500});}
});
