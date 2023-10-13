'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

type ActionResponse = {
  message?: string
  status?: 'success' | 'destructive'
  error?: string
}

export const newAgent = async (formData: FormData): Promise<ActionResponse> => {
  const agentName = formData?.get('agentName')
  // const avatar = formData.get('avatar')
  const prompt = formData.get('prompt')
  const temperature = formData.get('temperature')
  const maxTokens = formData.get('maxTokens')
  const model = formData.get('llmModel')
  const docsId = formData.get('docsId')

  const docsIdArray = docsId ? (docsId as string).split(',') : []

  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (user === null) return { error: 'User not found' }

  const { status } = await supabase
    .from('agents')
    .insert({
      user_id: user.id,
      model,
      folder_id: null, // refact this
      docs_id: docsIdArray,
      temperature: temperature ?? 0.2,
      max_tokens: maxTokens ?? 4000,
      // avatar,
      name: agentName,
      prompt
    })

  revalidatePath('/')
  return {
    message: status >= 400 ? 'Error creating agent' : `Agent ${agentName as string} created successfully`,
    status: status >= 400 ? 'destructive' : 'success'
  }
}

export const updateAgent = async (formData: FormData): Promise<ActionResponse> => {
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

  const { status } = await supabase
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

  revalidatePath('/')
  return {
    message: status >= 400 ? 'Error updating agent' : `Agent ${agentName as string} updated successfully`,
    status: status >= 400 ? 'destructive' : 'success'
  }
}

export const removeAgent = async (agentId: string): Promise<ActionResponse> => {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (user === null) return { error: 'User not found' }

  const { status } = await supabase
    .from('agents')
    .delete()
    .eq('id', agentId)

  revalidatePath('/')
  return {
    message: status >= 400 ? 'Error deleting agent' : 'Agent deleted successfully',
    status: status >= 400 ? 'destructive' : 'success'
  }
}
