import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Sidebar from '@/components/sidebar'
import Chat from '@/components/chat'

export default async function Home () {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  const { data: { user } } = await supabase.auth.getUser()

  const userMetadata = {
    name: user?.user_metadata?.full_name,
    avatarUrl: user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture,
    username: user?.user_metadata?.user_name
  }

  const [
    { data: chats },
    { data: agents },
    { data: documents }
  ] = await Promise.all([
    supabase
      .from('chats')
      .select('user:user_id(vectorProvider:vector_db_selected, dbStatus:db_status), id, name, messages, folderId:folder_id, model, temperature, maxTokens:max_tokens, prompt, isAgent:is_agent, agent:agent_id(id, name, prompt, docsId:docs_id, model, references, temperature, maxTokens:max_tokens)')
      .order('updated_at', { ascending: false }),
    supabase
      .from('agents')
      .select('id, folderId:folder_id, name, model, temperature, maxTokens:max_tokens, prompt, avatarUrl:avatar_url, docsId:docs_id')
      .order('updated_at', { ascending: false }),
    supabase
      .from('documents')
      .select('id, folderId:folder_id, name, content, type, isTrained:is_trained, createdAt:created_at, embeddedIds:embeddings_ids, database')
  ])

  const isBeta = Boolean(cookieStore.get('invitedId'))

  return (
    <main className="flex-col flex h-[calc(100vh-57px)] min-w-[1280px] overflow-hidden">
      <div className="relative flex h-full overflow-hidden">
        <Sidebar
          agents={agents ?? []}
          chats={chats ?? []}
          documents={documents ?? []}
          userSettings={chats?.[0]?.user}
        />
        <Chat
          isNewChat
          isBeta={isBeta}
          id={crypto.randomUUID()}
          user={userMetadata}
          agents={agents ?? []}
          selectedChat={{
            id: crypto.randomUUID(),
            name: 'New Chat',
            prompt: '',
            folderId: null,
            messages: []
          }}
        />
      </div>
    </main>
  )
}
