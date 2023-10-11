/* eslint-disable @typescript-eslint/naming-convention */
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function PUT (request: Request) {
  const {
    id,
    user: _user,
    folderId: folder_id,
    agent,
    isAgent: is_agent,
    maxTokens: max_tokens,
    ...restOfProps
  } = await request.json()
  const supabase = createRouteHandlerClient({ cookies })

  const { data: chat, error } = await supabase
    .from('chats')
    .update({
      ...(folder_id && { folder_id }),
      ...(is_agent && { is_agent: is_agent ?? false }),
      ...(agent?.id && { agent_id: agent.id }),
      ...(max_tokens && { max_tokens }),
      ...restOfProps
    })
    .eq('id', id)

  return NextResponse.json({ chat, error })
}
