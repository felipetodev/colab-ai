import { DialogClose } from "@radix-ui/react-dialog"
import { useState } from "react"
import { ChevronRightIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type { Chat } from "@/lib/types/chat"
import { Button, buttonVariants } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import ModelSelector from "./model-selector"
import TemperatureSelector from "./temperature-selector"
import MaxTokensSelector from "./max-tokens-selector"
import { Label } from "./ui/label"

type Props = {
  agent: Chat // refact this
  children: React.ReactNode
}

function AgentDialog({ agent, children }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const onUpdateSelectedChat = () => { }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            [Agent]: {agent.name}
          </DialogTitle>
          <DialogDescription>
            Create your agent assistant.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-y-3">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Agent Name" readOnly value={agent.name} />
          </div>
          <div>
            <Label htmlFor="upload">Choose document</Label>
            <div className="text-destructive font-semibold">
              HERE GOES THE FILE UPLOAD TO TRAIN THE AGENT
            </div>
          </div>
          <div>
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea className="h-40" id="prompt" placeholder="Write your instructions here..." readOnly value={agent.prompt} />
          </div>

          <div>
            <Label htmlFor="model">Model</Label>
            <ModelSelector onChange={onUpdateSelectedChat} />
          </div>

          <div className="w-full">
            <Button
              className="flex items-center justify-start mb-4"
              onClick={() => setIsOpen(!isOpen)}
              variant='secondary'
            >
              <span>Show Advanced Settings</span>
              <ChevronRightIcon
                className={cn('w-4 h-4 ml-1', {
                  'transform rotate-90': isOpen,
                })} />
            </Button>
            {isOpen ? (
              <div className="flex flex-col gap-6">
                <TemperatureSelector
                  defaultValue={[0.2]}
                  onChange={onUpdateSelectedChat}
                />
                <MaxTokensSelector
                  defaultValue={[2000]}
                  onChange={onUpdateSelectedChat}
                />
              </div>
            ) : null}
          </div>
        </div>
        <DialogFooter>
          <DialogClose className={cn(buttonVariants({ variant: "secondary" }))}>
            Cancel
          </DialogClose>
          <Button className="text-white bg-green-700 hover:bg-green-700/90">
            Save Agent
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog >
  )
}

export default AgentDialog
