import * as React from 'react'
import { ChevronsUpDown } from 'lucide-react'
import type { DocumentProps } from '@/lib/types/document'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from './ui/command'
import { Button } from './ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from './ui/popover'
import { type AgentProps } from '@/lib/types/agent'

type Props = {
  documents: DocumentProps[]
  agentState: AgentProps
  onChange: ({ key, value }: { key: 'docsId', value: any }) => void
}

function DocumentSelector ({ documents, agentState, onChange, ...props }: Props) {
  const [open, setOpen] = React.useState(false)
  const unselectedDocuments = documents.filter((doc) => !agentState.docsId.includes(doc.id))

  return (
    <Popover onOpenChange={setOpen} open={open} {...props}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          className="w-full justify-between"
          role="combobox"
          variant="outline"
        >
          Select document...
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[620px] p-0">
        <Command>
          <CommandInput placeholder="Search files..." />
          <CommandEmpty>No more trained documents available.</CommandEmpty>
          <CommandGroup>
            {unselectedDocuments.map((doc) => (
              <CommandItem
                key={doc.id}
                onSelect={() => {
                  onChange({ key: 'docsId', value: [...agentState.docsId, doc.id] })
                  setOpen(false)
                }}
              >
                {doc.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default DocumentSelector
