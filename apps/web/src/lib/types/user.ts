import type { Database } from './database'

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']

export type User = Tables<'users'>

export type UserProps = {
  id: Tables<'users'>['id']
  name: Tables<'users'>['name']
  avatarUrl: Tables<'users'>['avatar_url']
  username: Tables<'users'>['user_name']
  pineconeApiKey: Tables<'users'>['pinecone_key']
  pineconeEnvironment: Tables<'users'>['pinecone_env']
  pineconeIndex: Tables<'users'>['pinecone_index']
  openaiKey: Tables<'users'>['openai_key']
  openaiOrg: Tables<'users'>['openai_org']
  supabaseSecretKey: Tables<'users'>['supabase_secret_key']
  supabaseUrl: Tables<'users'>['supabase_url']
  vectorDBSelected: Tables<'users'>['vector_db_selected']
  dbStatus: Tables<'users'>['db_status']
}
