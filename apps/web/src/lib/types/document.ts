import type { Document as LDocument } from 'langchain/dist/document'
import type { Database } from './database'

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']

export type Document = {
  id: Tables<'documents'>['id']
  name: Tables<'documents'>['name']
  type: Tables<'documents'>['type']
  content: Tables<'documents'>['content']
  isTrained: Tables<'documents'>['is_trained']
  folderId: Tables<'documents'>['folder_id']
  supaEmbeddedIds: Tables<'documents'>['supabase_embeddings_ids']
}

export type DocumentProps = Omit<Document, 'content'> & {
  content: LDocument[]
}
