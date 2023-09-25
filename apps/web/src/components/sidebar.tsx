'use client'
import { ViewVerticalIcon } from "@radix-ui/react-icons"
import { Plus, Archive, MessageSquare, Pencil, User } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Chat } from "@/lib/types/chat"
import ChatConversation from "./chat-conversation"

type Props = {
  chats: Chat[]
  selectedChat: Chat
  handleSelectChat: (chat: Chat) => void
  handleNewChat: () => void
}

function Sidebar({
  chats,
  selectedChat,
  handleSelectChat,
  handleNewChat
}: Props) {
  return (
    <aside className="flex flex-col h-full border-r w-full max-w-sm px-4">
      {/* Chat Type */}
      <div className="flex items-center h-fit w-full gap-x-2">
        <Tabs className="flex-1" defaultValue="complete">
          <div className="flex py-2">
            <TabsList className="w-full h-full">
              <TabsTrigger className="w-full py-2.5" value="complete">
                <span className="sr-only">Messages</span>
                <MessageSquare />
              </TabsTrigger>
              <TabsTrigger className="w-full py-2.5" value="insert">
                <span className="sr-only">Edit</span>
                <Pencil />
              </TabsTrigger>
              <TabsTrigger className="w-full py-2.5" value="edit">
                <span className="sr-only">Agents</span>
                <User />
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
        <Button variant='ghost'>
          <ViewVerticalIcon className="h-5 w-5" />
        </Button>
      </div>

      {/* Create Chat or Folder */}
      <div className="flex gap-x-2.5">
        <Button className="gap-x-2 w-full font-semibold" onClick={handleNewChat}>
          <Plus className="h-5 w-5" />
          <span>New Chat</span>
        </Button>
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
        {chats.map((chat) => (
          <ChatConversation
            id={chat.id}
            isSelected={selectedChat.id === chat.id}
            key={chat.id}
            name={chat.name}
            onClick={() => handleSelectChat(chat)}
          />
        ))}

      </div>
    </aside>
  )
}

export default Sidebar
