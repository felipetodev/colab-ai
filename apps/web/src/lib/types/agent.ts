import type { Database } from './database'
import { type DocumentProps } from './document'

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']

export type Agent = {
  id: Tables<'agents'>['id']
  name: Tables<'agents'>['name']
  folderId: Tables<'agents'>['folder_id']
  model?: Tables<'agents'>['model']
  temperature?: Tables<'agents'>['temperature']
  maxTokens?: Tables<'agents'>['max_tokens']
  prompt?: Tables<'agents'>['prompt']
  docsId: Tables<'agents'>['docs_id']
}

export type AgentProps = Omit<Agent, 'docsId'> & {
  docsId: Array<DocumentProps['id']>
}
