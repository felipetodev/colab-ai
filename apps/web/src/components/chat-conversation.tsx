import { MessageCircleIcon, Trash2Icon, FileEditIcon } from "lucide-react"
import { Button } from "./ui/button"

function ChatConversation() {
  return (
    <div className="flex items-center p-1 m-2 bg-secondary rounded-md">
      <span className="mr-2 p-2 rounded-md">
        <MessageCircleIcon />
      </span>
      <span className="text-sm">
        New Chat
      </span>
      <div className="ml-auto flex">
        <Button className="w-7 h-7" size='icon' variant="ghost">
          <FileEditIcon className="w-4 h-4" />
        </Button>
        <Button className="w-7 h-7" size='icon' variant="ghost">
          <Trash2Icon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

export default ChatConversation
