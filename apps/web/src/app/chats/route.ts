/* eslint-disable @typescript-eslint/naming-convention */
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { ChatProps } from '@/lib/types/chat'

export async function POST (request: Request) {
  const {
    model = 'gpt-3.5-turbo',
    folderId: folder_id,
    maxTokens: max_tokens,
    ...restOfProps
  } = await request.json() as ChatProps

  const supabase = createRouteHandlerClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (user === null) return NextResponse.json({ error: 'Something went wrong creating new chat' })

  const { data: chat, error } = await supabase
    .from('chats')
    .insert({
      user_id: user.id,
      folder_id,
      max_tokens,
      model,
      ...restOfProps
    }) // send user_id: user.id from auth

  return NextResponse.json({ chat, error })
}

export async function PUT (request: Request) {
  const {
    id,
    user: _user,
    folderId: _folderId,
    agent: _agent,
    isAgent: is_agent = false,
    agentId: agent_id = null,
    maxTokens: _maxTokens,
    ...restOfProps
  } = await request.json()
  const supabase = createRouteHandlerClient({ cookies })

  const { data: chat, error } = await supabase
    .from('chats')
    .update({ is_agent, agent_id, ...restOfProps })
    .eq('id', id)

  return NextResponse.json({ chat, error })
}

export async function DELETE (request: Request) {
  const { id } = await request.json()
  const supabase = createRouteHandlerClient({ cookies })

  const { data: chat } = await supabase
    .from('chats')
    .delete()
    .eq('id', id)

  return NextResponse.json(chat)
}
