import * as React from "react"
import { ChevronsUpDown } from "lucide-react"
import type { DocumentProps } from "@/lib/types/document"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./ui/command"
import { Button } from "./ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover"

type Props = {
  documents: DocumentProps[]
}

function DocumentSelector({ documents, ...props }: Props) {
  const [open, setOpen] = React.useState(false)
  const [selectedPreset, setSelectedPreset] = React.useState({ id: '', name: '' })

  return (
    <Popover onOpenChange={setOpen} open={open} {...props}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          className="w-full justify-between"
          role="combobox"
          variant="outline"
        >
          {selectedPreset.name
            ? selectedPreset.name
            : "Select document..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[620px] p-0">
        <Command>
          <CommandInput placeholder="Search models..." />
          <CommandEmpty>No presets found.</CommandEmpty>
          <CommandGroup heading="Document trained">
            {documents.map((doc) => (
              <CommandItem
                key={doc.id}
                onSelect={() => {
                  // onChange({ key: "model", value: model.name.toLowerCase() })
                  setSelectedPreset({ id: doc.id, name: doc.name })
                  setOpen(false)
                }}
              >
                {doc.name}
              </CommandItem>
            ))}
          </CommandGroup>
          {/* <CommandGroup className="pt-0">
            <CommandItem>
              More examples
            </CommandItem>
          </CommandGroup> */}
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default DocumentSelector
