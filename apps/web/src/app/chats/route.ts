/* eslint-disable camelcase */
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { Chat } from "@/lib/types/chat";

export async function POST(request: Request) {
  const {
    folderId: folder_id,
    maxTokens: max_tokens,
    ...restOfProps
  } = await request.json() as Chat

  const supabase = createRouteHandlerClient({ cookies });

  const { data: { user } } = await supabase.auth.getUser()
  if (user === null) return

  const { data: chat } = await supabase
    .from("chats")
    .insert({ user_id: user.id, folder_id, max_tokens, ...restOfProps }) // send user_id: user.id from auth

  return NextResponse.json(chat);
}

export async function PUT(request: Request) {
  const { id, folderId: _, maxTokens: max_tokens, ...restOfProps } = await request.json();
  const supabase = createRouteHandlerClient({ cookies });

  const { data: chat } = await supabase
    .from("chats")
    .update({ ...max_tokens, ...restOfProps })
    .eq('id', id);

  return NextResponse.json(chat);
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  const supabase = createRouteHandlerClient({ cookies });

  const { data: chat } = await supabase
    .from("chats")
    .delete()
    .eq('id', id)

  return NextResponse.json(chat);
}
