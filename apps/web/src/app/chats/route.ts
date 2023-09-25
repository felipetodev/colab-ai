import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { id, name, messages } = await request.json();
  const supabase = createRouteHandlerClient({ cookies });

  const { data: { user } } = await supabase.auth.getUser()
  if (user === null) return

  const { data: chat } = await supabase
    .from("chats")
    .insert({ id, name, messages, user_id: user.id })

  return NextResponse.json(chat);
}

export async function PUT(request: Request) {
  const { messages, id } = await request.json();
  const supabase = createRouteHandlerClient({ cookies });

  const { data: chat } = await supabase
    .from("chats")
    .update({ messages })
    .eq('id', id);

  return NextResponse.json(chat);
}
