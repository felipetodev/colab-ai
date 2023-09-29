/* eslint-disable @typescript-eslint/naming-convention */
import { type AgentProps } from '@/lib/types/agent'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function PUT (req: Request) {
  const {
    id,
    folderId: folder_id,
    docsId: docs_id,
    maxTokens: max_tokens,
    ...restOfProps
  } = await req.json() as AgentProps
  const supabase = createRouteHandlerClient({ cookies })

  await supabase
    .from('agents')
    .update({
      folder_id,
      docs_id,
      max_tokens,
      ...restOfProps
    })
    .eq('id', id)

  return NextResponse.json({ success: true })
}
