'use client'

import type { Message } from 'ai/react'
import { useChat } from 'ai/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { type ChatProps } from '@/lib/types/chat'
import type { AgentProps } from '@/lib/types/agent'
import type { DocumentProps } from '@/lib/types/document'
import ChatInput from './chat-input'
import ChatMessages from './chat-messages'
import ChatSettings from './chat-settings'
import ChatScrollAnchor from './chat-scroll-anchor'
import Sidebar from './sidebar'
import ChatSettingsDialog from './chat-settings-dialog'

type Props = {
  id: string
  chats: ChatProps[] | null
  documents: DocumentProps[] | null
  agents: AgentProps[] | null
}

function Chat ({ chats, agents, documents }: Props) {
  const [gotMessages, setGotMessages] = useState(false)
  const [selectedChat, setSelectedChat] = useState<ChatProps>(chats?.[0] ?? {
    user: {
      id: '',
      vectorProvider: null
    },
    name: 'New Chat',
    folderId: null,
    id: crypto.randomUUID(),
    messages: []
  })
  const router = useRouter()

  const { messages, input, stop, setInput, append, isLoading, setMessages } = useChat({
    api: selectedChat.isAgent && selectedChat.user?.vectorProvider
      ? `/api/completions/${selectedChat.user?.vectorProvider}`
      : '/api/chat',
    body: selectedChat.isAgent && selectedChat.user?.vectorProvider
      ? {
          userId: selectedChat.user?.id,
          docsId: selectedChat.agent?.docsId,
          prompt: selectedChat.agent?.prompt
        }
      : { chatId: selectedChat?.id },
    onFinish: () => { setGotMessages(true) }
  })

  useEffect(() => {
    if (selectedChat?.messages.length === 0) return
    setMessages(selectedChat.messages)
  }, [selectedChat.id])

  useEffect(() => {
    // update revalidation changes in chats due server actions
    if (!chats || chats.length === 0) return
    setSelectedChat(chats[0])
  }, [chats])

  const handleSend = async (value: string) => {
    const newMessage: Message = {
      id: crypto.randomUUID(), // use nanoId
      content: value,
      role: 'user'
    }
    const updatedChat = {
      ...selectedChat,
      messages: [...selectedChat.messages, newMessage]
    }

    setSelectedChat(updatedChat)
    setGotMessages(false)
    await append(newMessage)
  }

  useEffect(() => {
    if (!gotMessages) return

    const sendMessages = async () => {
      await fetch('/chats', {
        method: 'PUT',
        body: JSON.stringify({
          ...selectedChat,
          ...(selectedChat.isAgent && {
            agentId: selectedChat.agent.id
          }),
          messages
        })
      })
    }
    void sendMessages()
  }, [gotMessages])

  const handleNewChat = async () => {
    // clean useChat state
    setMessages([])
    const newChat: ChatProps = {
      id: crypto.randomUUID(),
      name: 'New Chat',
      messages: [],
      folderId: null,
      temperature: 0.2,
      maxTokens: 2000
    }
    await fetch('/chats', {
      method: 'POST',
      body: JSON.stringify(newChat)
    })

    setSelectedChat(newChat)

    router.refresh()
  }

  const onUpdateSelectedChat = (e: { key: 'model' | 'temperature' | 'maxTokens' | 'prompt', value: any }) => {
    setSelectedChat({
      ...selectedChat,
      [e.key]: e.value
    })
  }

  return (
    <div className="relative flex h-full overflow-hidden">
      <Sidebar
        agents={agents ?? []}
        chats={chats ?? []}
        documents={documents ?? []}
        handleNewChat={handleNewChat}
        handleSelectChat={setSelectedChat}
        selectedChat={selectedChat}
      />
      <div className="relative flex flex-col justify-between bg-zinc-400 dark:bg-zinc-900 w-full h-full">
        <div className="relative min-h-full w-full overflow-y-auto">
          <div className="relative flex min-h-[calc(100vh-90px-60px)] w-full flex-col pb-8">

            {selectedChat.messages.length === 0
              ? (
                <ChatSettings
                  onUpdateSelectedChat={onUpdateSelectedChat}
                  selectedChat={selectedChat}
                />
                )
              : (
                <>
                  <header className="z-40 sticky top-0 flex h-[50px] justify-center items-center border-b px-4 py-3 bg-background/70">
                    <div className="flex items-center space-x-2">
                      <h1>{selectedChat.name}</h1>
                      <ChatSettingsDialog
                        agents={agents ?? []}
                        selectedChat={selectedChat}
                      />
                    </div>
                  </header>
                  <div className='flex flex-col pb-[60px]'>
                    {messages?.map((message) => (
                      <ChatMessages
                        content={message.content}
                        id={message.id}
                        key={message.id}
                        role={message.role}
                      />
                    ))}
                    <ChatScrollAnchor trackVisibility={isLoading} />
                  </div>
                </>
                )}

          </div>
          <ChatInput
            input={input}
            isLoading={isLoading}
            onSubmit={handleSend}
            setInput={setInput}
            stop={stop}
          />
        </div>
      </div>
    </div>
  )
}

export default Chat
