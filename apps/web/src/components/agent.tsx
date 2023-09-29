import { User2, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { AgentProps } from '@/lib/types/agent'
import type { DocumentProps } from '@/lib/types/document'
import AgentDialog from './agent-dialog'

type Props = {
  agent: AgentProps
  documents: DocumentProps[]
}

function Agent ({ agent, documents }: Props) {
  const onOpenAgent = () => {
    console.log('open modal with keyboard 4 a11y')
  }

  return (
    <AgentDialog
      type='update'
      agent={agent}
      documents={documents}
    >
      <div
        className='flex items-center p-1 m-2 rounded-md hover:bg-secondary/40 focus:bg-secondary'
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onOpenAgent()
          }
        }}
        role="button"
        tabIndex={0}
      >
        <span className="mr-2 p-2 rounded-md">
          <User2 />
        </span>
        <span className="text-sm truncate w-full mr-2">
          {agent.name}
        </span>
        <div className="ml-auto flex">
          <Button className="w-7 h-7" size='icon' variant="ghost">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </AgentDialog>
  )
}

export default Agent
