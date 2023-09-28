'use client'

import { Settings } from "lucide-react"
import type { Message } from "ai/react";
import { useChat } from "ai/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation";
import { type ChatProps } from "@/lib/types/chat";
import type { Agent } from "@/lib/types/agent";
import type { DocumentProps } from "@/lib/types/document";
import ChatInput from "./chat-input"
import ChatMessages from "./chat-messages"
import { Button } from "./ui/button"
import ChatSettings from "./chat-settings"
import ChatScrollAnchor from "./chat-scroll-anchor"
import Sidebar from "./sidebar";

type Props = {
  id: string
  chats: ChatProps[] | null
  documents: DocumentProps[] | null
  agents: Agent[] | null
}

function Chat({ chats, agents, documents }: Props) {
  const [gotMessages, setGotMessages] = useState(false);
  const [selectedChat, setSelectedChat] = useState<ChatProps>(chats?.[0] ?? {
    name: 'New Chat',
    folderId: null,
    id: crypto.randomUUID(),
    messages: []
  })
  const router = useRouter()

  const { messages, input, stop, setInput, append, isLoading, setMessages } = useChat({
    body: {
      chatId: selectedChat?.id,
    },
    onFinish: () => setGotMessages(true),
  })

  useEffect(() => {
    if (selectedChat?.messages.length === 0) return
    setMessages(selectedChat.messages )
  }, [selectedChat.id])

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
          messages,
        }),
      })
    }
    void sendMessages()
  }, [gotMessages])

  const handleNewChat = async () => {
    const newChat: ChatProps = {
      id: crypto.randomUUID(),
      name: 'New Chat',
      messages: [],
      folderId: null,
      temperature: 0.2,
      maxTokens: 2000,
    }
    await fetch('/chats', {
      method: 'POST',
      body: JSON.stringify(newChat),
    })

    setSelectedChat(newChat)

    router.refresh()
  }

  const handleSelectChat = (chat: ChatProps) => {
    setSelectedChat(chat)
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
        handleSelectChat={handleSelectChat}
        selectedChat={selectedChat}
      />
      <div className="relative flex flex-col justify-between bg-zinc-400 dark:bg-zinc-900 w-full h-full">
        <div className="relative min-h-full w-full overflow-y-auto">
          <div className="relative flex min-h-[calc(100vh-90px-60px)] w-full flex-col pb-8">

            {selectedChat.messages.length === 0 ? (
              <ChatSettings
                onUpdateSelectedChat={onUpdateSelectedChat}
                selectedChat={selectedChat}
              />
            ) : (
              <header className="z-40 sticky top-0 flex h-[50px] justify-center items-center border-b px-4 py-3 bg-background/70">
                <div className="flex items-center space-x-2">
                  <h1>{selectedChat.name}</h1>
                  <Button className="w-8 h-8" size='icon' variant='ghost'>
                    <Settings className="h-5 w-5" />
                  </Button>
                </div>
              </header>
            )}

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
