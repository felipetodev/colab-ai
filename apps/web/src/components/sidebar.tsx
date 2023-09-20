'use client'
import { ChatBubbleIcon, Pencil1Icon, PersonIcon, ViewVerticalIcon, PlusIcon, ArchiveIcon } from "@radix-ui/react-icons"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ChatConversation from "./chat-conversation"

function Sidebar() {
  return (
    <aside className="flex flex-col h-full border-r w-full max-w-sm px-4">
      {/* Chat Type */}
      <div className="flex items-center h-fit w-full gap-x-2">
        <Tabs className="flex-1" defaultValue="complete">
          <div className="flex py-2">
            <TabsList className="w-full h-full">
              <TabsTrigger className="w-full py-2.5" value="complete">
                <span className="sr-only">Complete</span>
                <ChatBubbleIcon className="h-5 w-5" />
              </TabsTrigger>
              <TabsTrigger className="w-full py-2.5" value="insert">
                <span className="sr-only">Insert</span>
                <Pencil1Icon className="h-5 w-5" />
              </TabsTrigger>
              <TabsTrigger className="w-full py-2.5" value="edit">
                <span className="sr-only">Edit</span>
                <PersonIcon className="h-5 w-5" />
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
        <Button className="gap-x-2 w-full">
          <PlusIcon className="h-5 w-5" />
          <span>New Chat</span>
        </Button>
        <Button>
          <ArchiveIcon className="h-5 w-5" />
        </Button>
      </div>
      {/* Search Chats Input */}
      <div className="py-2">
        <Input placeholder="Search chats..." type="text" />
      </div>
      {/* Chats List */}
      <div className="h-full rounded-md border mb-2">
        <ChatConversation />
      </div>
    </aside>
  )
}

export default Sidebar
