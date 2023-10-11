import { MessageCircleIcon, Trash2Icon, FileEditIcon } from 'lucide-react'
import type { Chat } from '@/lib/types/chat'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import ChatConversationDialog from './chat-conversation-dialog'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type Props = {
  id: Chat['id']
  name: Chat['name']
}

function ChatConversation ({ id, name }: Props) {
  const pathname = usePathname()
  const chatPath = `/chat/${id}`
  return (
    <Link
      href={chatPath}
      aria-pressed={pathname === chatPath}
      className={cn(
        'flex items-center p-1 m-2 rounded-md hover:bg-secondary/40',
        pathname === chatPath && 'bg-secondary'
      )}
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
          id={id}
          type="edit"
        >
          <Button className="w-7 h-7" size='icon' variant="ghost">
            <FileEditIcon className="w-4 h-4" />
          </Button>
        </ChatConversationDialog>

        <ChatConversationDialog
          id={id}
          type="delete"
        >
          <Button className="w-7 h-7" size='icon' variant="ghost">
            <Trash2Icon className="w-4 h-4" />
          </Button>
        </ChatConversationDialog>
      </div>
    </Link>
  )
}

export default ChatConversation
