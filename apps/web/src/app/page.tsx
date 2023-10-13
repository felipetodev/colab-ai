import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Sidebar from '@/components/sidebar'
import Chat from '@/components/chat'
// import { redirect } from 'next/navigation'

export default async function Home () {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  // const { data: user } = await supabase.from('users')
  //   .select('name, username:user_name')
  //   .single()

  const { data: chats } = await supabase
    .from('chats')
    .select('user:user_id(vectorProvider:vector_db_selected, dbStatus:db_status), id, name, messages, folderId:folder_id, model, temperature, maxTokens:max_tokens, prompt, isAgent:is_agent, agent:agent_id(id, name, prompt, docsId:docs_id, model, temperature, maxTokens:max_tokens)')
    .order('updated_at', { ascending: false })

  const { data: agents } = await supabase
    .from('agents')
    .select('id, folderId:folder_id, name, model, temperature, maxTokens:max_tokens, prompt, docsId:docs_id')
    .order('updated_at', { ascending: false })

  const { data: documents } = await supabase
    .from('documents')
    .select('id, folderId:folder_id, name, content, type, isTrained:is_trained, createdAt:created_at, embeddedIds:embeddings_ids, database')

  // if (chats?.[0]?.messages) {
  //   redirect(`/chat/${chats?.[0].id}`)
  // }

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
          id={crypto.randomUUID()}
          user={null}
          agents={agents ?? []}
          selectedChat={{
            id: crypto.randomUUID(),
            name: 'New Chat',
            folderId: null,
            messages: []
          }}
        />
      </div>
    </main>
  )
}
