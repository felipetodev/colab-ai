import { User2, Settings } from "lucide-react"
import type { Chat } from "@/lib/types/chat"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import AgentDialog from "./agent-dialog"

type Props = {
  agent: Chat
  isSelected: boolean
  documents: any
}

function Agent({ agent, documents, isSelected }: Props) {
  const onOpenAgent = () => {
    // eslint-disable-next-line no-console
    console.log("HEY")
  }

  return (
    <AgentDialog
      agent={agent}
      documents={documents}
    >
      <div
        className={cn(
          'flex items-center p-1 m-2 rounded-md hover:bg-secondary/40',
          isSelected && 'bg-secondary'
        )}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onOpenAgent();
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
