import { type Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Chat from '@/components/chat'

export interface ChatPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata ({ params }: ChatPageProps): Promise<Metadata> {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return {}
  }

  const { data: chat } = await supabase
    .from('chats')
    .select('name')
    .eq('id', params.id)
    .maybeSingle()

  return {
    title: `Colab-AI | ${chat?.name?.toString().slice(0, 40)}` ?? 'Colab-AI | Chat'
  }
}

export default async function ChatPage ({ params }: ChatPageProps) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  const { data: { user } } = await supabase.auth.getUser()

  const userMetadata = {
    name: user?.user_metadata?.full_name,
    avatarUrl: user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture,
    username: user?.user_metadata?.user_name
  }

  if (user === null) {
    redirect('/')
  }

  const { data: chat } = await supabase
    .from('chats')
    .select('user:user_id(vectorProvider:vector_db_selected, dbStatus:db_status), id, name, messages, folderId:folder_id, model, temperature, maxTokens:max_tokens, prompt, isAgent:is_agent, agent:agent_id(id, name, prompt, docsId:docs_id, model, temperature, maxTokens:max_tokens, avatarUrl:avatar_url)')
    .eq('id', params.id)
    .maybeSingle()

  const { data: agents } = await supabase
    .from('agents')
    .select('id, folderId:folder_id, name, model, temperature, maxTokens:max_tokens, prompt, avatarUrl:avatar_url, docsId:docs_id')
    .order('updated_at', { ascending: false })

  if (!chat || chat == null) {
    notFound()
  }

  return <Chat
    id={crypto.randomUUID()}
    selectedChat={chat}
    user={userMetadata}
    agents={agents}
  />
}
