'use client'

import { useState } from 'react'
import { Plus, Archive, MessageSquare, File, User } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ChatProps } from '@/lib/types/chat'
import { type AgentProps } from '@/lib/types/agent'
import type { DocumentProps } from '@/lib/types/document'
import ChatConversation from './chat-conversation'
import Agent from './agent'
import DocumentDialog from './document-dialog'
import DocumentFile from './document-file'
import AgentDialog from './agent-dialog'
import { SubmitButton } from 'src/app/actions/submit-button'
import { createChat } from 'src/app/actions/chat'

type TabsView = 'chat' | 'document' | 'agent'

type Props = {
  chats: ChatProps[]
  agents: AgentProps[]
  documents: DocumentProps[]
  userSettings?: any
}

function Sidebar ({
  chats,
  agents,
  documents,
  userSettings
}: Props) {
  const [view, setView] = useState<TabsView>('chat')

  const handleNewChat = async () => {
    const newChat: ChatProps = {
      id: crypto.randomUUID(),
      name: 'New Chat',
      messages: [],
      folderId: null,
      temperature: 0.2,
      maxTokens: 2000
    }

    await createChat(newChat)
  }

  return (
    <aside className="flex flex-col h-full border-r w-full max-w-sm px-4">
      <div className="flex items-center h-fit w-full gap-x-2">
        <Tabs
          className="flex-1"
          defaultValue={view}
          onValueChange={(v) => setView(v as TabsView)}
        >
          <div className="flex py-2">
            <TabsList className="w-full h-full">
              <TabsTrigger className="w-full py-2" title="Chats" value="chat">
                <span className="sr-only">Chat</span>
                <MessageSquare />
              </TabsTrigger>
              <TabsTrigger className="w-full py-2" title="Agents" value="agent">
                <span className="sr-only">Agents</span>
                <User />
              </TabsTrigger>
              <TabsTrigger className="w-full py-2" title="Documents" value="document">
                <span className="sr-only">Documents</span>
                <File />
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
        {/* <Button variant='ghost'>
          <ViewVerticalIcon className="h-5 w-5" />
        </Button> */}
      </div>

      {/* Create Chat or Folder */}
      <div className="flex gap-x-2.5">
        {view === 'chat' && (
          <form className='flex w-full'>
            <SubmitButton className="gap-x-2 w-full font-semibold" formAction={handleNewChat}>
              <Plus className="h-5 w-5" />
              <span>New Chat</span>
            </SubmitButton>
          </form>
        )}
        {view === 'agent' && (
          <AgentDialog
            type='create'
            agent={{
              id: crypto.randomUUID(),
              name: 'New Agent',
              folderId: null,
              docsId: []
            }}
            documents={documents}
          >
            <Button className="gap-x-2 w-full font-semibold">
              <Plus className="h-5 w-5" />
              <span>New Agent</span>
            </Button>
          </AgentDialog>
        )}
        {view === 'document' && (
          <DocumentDialog>
            <Button className="gap-x-2 w-full font-semibold">
              <Plus className="h-5 w-5" />
              <span>Upload File</span>
            </Button>
          </DocumentDialog>
        )}
        <Button>
          <Archive />
        </Button>
      </div>

      {/* Search Chats Input */}
      <div className="py-2">
        <Input placeholder="Search chats..." type="text" />
      </div>

      {/* Chats List */}
      <div className="h-full rounded-md border mb-2">
        {view === 'chat' && chats.map((chat) => (
          <ChatConversation
            id={chat.id}
            key={chat.id}
            name={chat.name}
            isAgent={Boolean(chat?.isAgent)}
          />
        ))}

        {view === 'agent' && agents.map((agent) => (
          <Agent
            agent={agent}
            documents={documents.filter(doc => Boolean(doc.isTrained))}
            key={agent.id}
          />
        ))}

        {view === 'document' && documents.map((document) => (
          <DocumentFile
            userSettings={userSettings}
            document={document}
            key={document.id}
          />
        ))}
      </div>
    </aside>
  )
}

export default Sidebar
