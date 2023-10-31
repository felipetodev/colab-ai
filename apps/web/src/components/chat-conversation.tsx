import { MessageCircleIcon } from 'lucide-react'
import type { Chat } from '@/lib/types/chat'
import { cn } from '@/lib/utils'
import ChatConversationDialog from './chat-conversation-dialog'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type Props = {
  id: Chat['id']
  name: Chat['name']
  isAgent: boolean
}

function ChatConversation ({ id, name, isAgent }: Props) {
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
      <div className={cn('ml-auto hidden', {
        flex: pathname === chatPath
      })}>
        <ChatConversationDialog
          activeName={name}
          isAgent={isAgent}
          id={id}
          type="edit"
        />

        <ChatConversationDialog
          id={id}
          type="delete"
        />
      </div>
    </Link>
  )
}

export default ChatConversation
