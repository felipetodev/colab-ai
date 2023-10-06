'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export const createAgent = async (type: 'create' | 'update', formData: FormData) => {
  const agentName = formData?.get('agentName')
  // const avatar = formData.get('avatar')
  const prompt = formData.get('prompt')
  const temperature = formData.get('temperature')
  const maxTokens = formData.get('maxTokens')
  const model = formData.get('modelTest')
  const docsId = formData.get('docsId')
  const agentId = formData.get('agentId')

  const docsIdArray = docsId ? (docsId as string).split(',') : []

  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (user === null) return { error: 'User not found' }

  if (type === 'create') {
    await supabase
      .from('agents')
      .insert({
        user_id: user.id,
        model,
        folder_id: null,
        docs_id: docsIdArray,
        temperature,
        max_tokens: maxTokens,
        // avatar,
        name: agentName,
        prompt
      })

    return revalidatePath('/')
  }

  if (type === 'update') {
    await supabase
      .from('agents')
      .update({
        name: agentName,
        model,
        prompt,
        docs_id: docsIdArray,
        ...(temperature && { temperature }),
        ...(maxTokens && { max_tokens: maxTokens })
      })
      .eq('id', agentId)

    return revalidatePath('/')
  }
}
