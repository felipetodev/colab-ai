import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { type ChatProps } from '@/lib/types/chat'
import { Settings } from 'lucide-react'
import { useState } from 'react'
import { type AgentProps } from '@/lib/types/agent'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'

import TalkToAgent from './talk-to-agent'
import TalkToChat from './talk-to-chat'

type Props = {
  agents: AgentProps[]
  selectedChat: ChatProps
  isBeta?: boolean
}

function ChatSettingsDialog ({ selectedChat, agents, isBeta }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-8 h-8" size='icon' variant='ghost'>
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{selectedChat.name}</DialogTitle>
          <DialogDescription>
            Make changes to your chat settings.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue={selectedChat.isAgent ? 'agent' : 'chat'}>
          <TabsList className='relative'>
            <TabsTrigger value="chat">
              Chat
            </TabsTrigger>
            <TabsTrigger disabled={agents.length === 0} value="agent" className='data-[state=active]:bg-green-700/50'>
              Custom Agent
            </TabsTrigger>
            <span className="animate-ping absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-400/80" />
            <span className="absolute -top-1 -right-1 rounded-full h-3 w-3 bg-green-700/80" />
          </TabsList>

          <TabsContent value="chat" className='mt-6'>
            <TalkToChat
              isBeta={isBeta}
              selectedChat={selectedChat}
              handleModalClose={() => setIsOpen(false)}
            />
          </TabsContent>

          <TabsContent value="agent">
            <TalkToAgent
              agents={agents}
              selectedChat={selectedChat}
              handleModalClose={() => setIsOpen(false)}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default ChatSettingsDialog
