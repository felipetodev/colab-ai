import { MessageCircleIcon, Trash2Icon, FileEditIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Chat } from "@/lib/types/chat"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import ChatConversationDialog from "./chat-conversation-dialog"

type Props = {
  id: Chat['id']
  name: Chat['name']
  isSelected: boolean
  onClick: () => void
}

function ChatConversation({ id, name, isSelected, onClick }: Props) {
  const router = useRouter()
  return (
    <div
      aria-pressed={isSelected}
      className={cn(
        'flex items-center p-1 m-2 rounded-md hover:bg-secondary/40',
        isSelected && 'bg-secondary'
      )}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <span className="mr-2 p-2 rounded-md">
        <MessageCircleIcon />
      </span>
      <span className="text-sm truncate w-full mr-2">
        {name}
      </span>
      <div className="ml-auto flex">
        <ChatConversationDialog
          activeName={name}
          onClick={async (newName) => {
            if (!newName) return
            await fetch('/chats', {
              method: 'PUT',
              body: JSON.stringify({
                id,
                name: newName
              }),
            })
            router.refresh()
          }}
          type="edit"
        >
          <Button className="w-7 h-7" size='icon' variant="ghost">
            <FileEditIcon className="w-4 h-4" />
          </Button>
        </ChatConversationDialog>

        <ChatConversationDialog
          onClick={async () => {
            await fetch('/chats', {
              method: 'DELETE',
              body: JSON.stringify({
                id
              }),
            })
            router.refresh()
          }}
          type="delete"
        >
          <Button className="w-7 h-7" size='icon' variant="ghost">
            <Trash2Icon className="w-4 h-4" />
          </Button>
        </ChatConversationDialog>
      </div>
    </div>
  )
}

export default ChatConversation
