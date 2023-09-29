'use client'

import * as React from 'react'
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons'
import type { PopoverProps } from '@radix-ui/react-popover'
import { cn } from '@/lib/utils'
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

export interface Preset {
  id: string
  name: string
}

export const models: Preset[] = [
  {
    id: '9cb0e66a-9937-465d-a188-2c4c4ae2401f',
    name: 'GPT-3.5-turbo'
  },
  {
    id: '61eb0e32-2391-4cd3-adc3-66efe09bc0b7',
    name: 'GPT-3.5-turbo-16k'
  },
  {
    id: 'a4e1fa51-f4ce-4e45-892c-224030a00bdd',
    name: 'GPT-4'
  }
]

interface Props extends PopoverProps {
  value: string
  onChange: (model: { key: 'model' | 'temperature' | 'maxTokens' | 'prompt', value: any }) => void
}

function ModelSelector ({ value, onChange, ...props }: Props) {
  const [open, setOpen] = React.useState(false)
  const [selectedPreset, setSelectedPreset] = React.useState<Preset>(
    models.find((m) => m.name.toLowerCase() === value.toLowerCase()) ?? models[0]
  )

  return (
    <Popover onOpenChange={setOpen} open={open} {...props}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          aria-label="Load a preset..."
          className="flex-1 justify-between w-full max-w-[620px] mb-4"
          role="combobox"
          variant="outline"
        >
          {selectedPreset ? selectedPreset.name : 'Select a model...'}
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[620px] p-0">
        <Command>
          <CommandInput placeholder="Search models..." />
          <CommandEmpty>No presets found.</CommandEmpty>
          <CommandGroup heading="OpenAI Models">
            {models.map((model) => (
              <CommandItem
                key={model.id}
                onSelect={() => {
                  onChange({ key: 'model', value: model.name.toLowerCase() })
                  setSelectedPreset(model)
                  setOpen(false)
                }}
              >
                {model.name}
                <CheckIcon
                  className={cn(
                    'ml-auto h-4 w-4',
                    selectedPreset?.id === model.id
                      ? 'opacity-100'
                      : 'opacity-0'
                  )}
                />
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

export default ModelSelector
