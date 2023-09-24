import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  const {
    openaiKey,
    openaiOrg,
    pineconeApiKey,
    pineconeEnvironment,
    pineconeIndex,
  } = await request.json();
  const supabase = createRouteHandlerClient({ cookies });
  // get userId to update the user settings
  const { data: { user } } = await supabase.auth.getUser()


  const { data } = await supabase
    .from("users")
    .update({
      openai_key: openaiKey,
      openai_org: openaiOrg,
      pinecone_key: pineconeApiKey,
      pinecone_env: pineconeEnvironment,
      pinecone_index: pineconeIndex,
    })
    .eq('id', user?.id);

  return NextResponse.json(data);
}
