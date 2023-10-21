'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

type ActionResponse = {
  message?: string
  status?: 'success' | 'destructive'
  error?: string
}

export const updateSettings = async (formData: FormData): Promise<ActionResponse> => {
  const openaiKey = formData.get('openaiKey') as string
  const openaiOrg = formData.get('openaiOrg') as string
  const pineconeApiKey = formData.get('pineconeApiKey') as string
  const pineconeEnvironment = formData.get('pineconeEnvironment') as string
  const pineconeIndex = formData.get('pineconeIndex') as string
  const supabaseSecretKey = formData.get('supabaseSecretKey') as string
  const supabaseUrl = formData.get('supabaseUrl') as string
  const vectorDBSelected = formData.get('vectorDBSelected') as string
  const dbStatus = formData.get('dbStatus') as string
  // appearance form settings
  const theme = formData.get('theme') as string
  const font = formData.get('font') as string

  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (user === null) return { error: 'User not found' }

  const { status } = await supabase
    .from('users')
    .update({
      ...openaiKey && { openai_key: openaiKey },
      ...openaiOrg && { openai_org: openaiOrg },
      ...pineconeApiKey && { pinecone_key: pineconeApiKey },
      ...pineconeEnvironment && { pinecone_env: pineconeEnvironment },
      ...pineconeIndex && { pinecone_index: pineconeIndex },
      ...supabaseSecretKey && { supabase_secret_key: supabaseSecretKey },
      ...supabaseUrl && { supabase_url: supabaseUrl },
      ...vectorDBSelected && { vector_db_selected: vectorDBSelected },
      ...dbStatus && { db_status: dbStatus },
      ...theme && { theme },
      ...font && { font }
    })
    .eq('id', user?.id)

  revalidatePath('/settings')
  return {
    message: status >= 400 ? 'Error updating settings' : 'Settings updated',
    status: status >= 400 ? 'destructive' : 'success'
  }
}
