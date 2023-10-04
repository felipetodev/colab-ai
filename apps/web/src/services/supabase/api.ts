import { type UserProps } from '@/lib/types/user'

const {
  SUPABASE_SECRET_KEY,
  SUPABASE_PROJECT_URL,
  SUPABASE_ANON_KEY
} = process.env

if (!SUPABASE_SECRET_KEY || !SUPABASE_PROJECT_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase credentials')
}

const selectOptions = {
  username: 'username:user_name',
  avatarUrl: 'avatarUrl:avatar_url',
  pineconeApiKey: 'pineconeApiKey:pinecone_key',
  pineconeEnvironment: 'pineconeEnvironment:pinecone_env',
  pineconeIndex: 'pineconeIndex:pinecone_index',
  openaiKey: 'openaiKey:openai_key',
  openaiOrg: 'openaiOrg:openai_org',
  supabaseSecretKey: 'supabaseSecretKey:supabase_secret_key',
  supabaseUrl: 'supabaseUrl:supabase_url',
  vectorDBSelected: 'vectorDBSelected:vector_db_selected',
  dbStatus: 'dbStatus:db_status'
}

type SelectProps = keyof typeof selectOptions

type GetDataProps = {
  table: string
  method: string
  body?: BodyInit
  select?: string
  id: string
}

export const supabase = {
  getUri: (q: string) => {
    return q.split(', ').map((key) => selectOptions[key as SelectProps] ?? key).join(',')
  },

  getData: async ({
    table,
    method = 'GET',
    body,
    select = '',
    id = ''
  }: GetDataProps) => {
    return await fetch(
      `${SUPABASE_PROJECT_URL}/rest/v1/${table}${id ? `?id=eq.${id}` : id}${select ? `&select=${supabase.getUri(select)}` : select}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_SECRET_KEY}`
        },
        ...(body && {
          body: JSON.stringify(body)
        })
      }
    )
  },

  getUser: async ({ id, select }: { id: string, select: string }): Promise<{ data: UserProps[] | null, error?: string }> => {
    const data = await supabase.getData({
      table: 'users',
      method: 'GET',
      id,
      select
    })

    if (!data.ok) {
      const json = await data.json()
      console.error(json)
      return { error: 'An unexpected error occurred', data: null }
    }

    const json = await data.json()

    return { data: json }
  },

  updateDocuments: async ({ id, update }: { id: string, update: any }): Promise<{ data: null, error?: string }> => {
    const data = await supabase.getData({
      table: 'documents',
      method: 'PATCH',
      id,
      body: update
    })
    if (!data.ok) {
      const json = await data.json()
      console.error(json)
      return { error: 'An unexpected error occurred', data: null }
    }

    const json = await data.json()
    console.info(json)
    return { data: null }
  }
}
