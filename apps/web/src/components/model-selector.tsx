'use client'

import * as React from 'react'
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons'
import { Lock } from 'lucide-react'
import { IconGPT } from './ui/icons'
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
import type { PopoverProps } from '@radix-ui/react-popover'

export interface Preset {
  icon: React.ReactNode
  id: string
  name: string
  active: boolean
}

export const models: Preset[] = [
  {
    icon: <span className='grid place-content-center rounded bg-[#1fb88a] h-8 px-1 mr-2'>
      <IconGPT className='w-6 h-6' />
    </span>,
    id: '9cb0e66a-9937-465d-a188-2c4c4ae2401f',
    name: 'GPT-3.5-turbo',
    active: true
  },
  {
    icon: <span className='grid place-content-center rounded bg-[#1fb88a] h-8 px-1 mr-2'>
      <IconGPT className='w-6 h-6' />
    </span>,
    id: '61eb0e32-2391-4cd3-adc3-66efe09bc0b7',
    name: 'GPT-3.5-turbo-16k',
    active: true
  },
  {
    icon: <span className='grid place-content-center rounded bg-[#ab68ff] h-8 px-1 mr-2'>
      <IconGPT className='w-6 h-6' />
    </span>,
    id: 'a4e1fa51-f4ce-4e45-892c-224030a00bdd',
    name: 'GPT-4',
    active: true
  }
]

export const betaModels: Preset[] = [
  {
    icon: <span className='grid place-content-center rounded bg-[#1fb88a] h-8 px-1 mr-2'>
      <IconGPT className='w-6 h-6' />
    </span>,
    id: '9cb0e66a-9937-465d-a188-2c4c4ae2401f',
    name: 'GPT-3.5-turbo',
    active: true
  },
  {
    icon: <span className='grid place-content-center rounded bg-[#1fb88a] h-8 px-1 mr-2'>
      <IconGPT className='w-6 h-6' />
    </span>,
    id: '61eb0e32-2391-4cd3-adc3-66efe09bc0b7',
    name: 'GPT-3.5-turbo-16k',
    active: false
  },
  {
    icon: <span className='grid place-content-center rounded bg-[#ab68ff] h-8 px-1 mr-2'>
      <IconGPT className='w-6 h-6' />
    </span>,
    id: 'a4e1fa51-f4ce-4e45-892c-224030a00bdd',
    name: 'GPT-4',
    active: false
  }
]

interface Props extends PopoverProps {
  value: string
  isBeta?: boolean
  onChange?: (model: { key: 'model' | 'temperature' | 'maxTokens' | 'prompt', value: any }) => void
}

function ModelSelector ({ isBeta, value, onChange, ...props }: Props) {
  const [open, setOpen] = React.useState(false)
  const [selectedPreset, setSelectedPreset] = React.useState<Preset>(
    isBeta
      ? betaModels.find((m) => m.name.toLowerCase() === value.toLowerCase()) ?? betaModels[0]
      : models.find((m) => m.name.toLowerCase() === value.toLowerCase()) ?? models[0]
  )

  const llms = isBeta ? betaModels : models

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
      <input type="hidden" name="llmModel" value={selectedPreset.name} />
      <PopoverContent className="w-[620px] p-0">
        <Command>
          <CommandInput placeholder="Search models..." />
          <CommandEmpty>No presets found.</CommandEmpty>
          <CommandGroup heading="OpenAI Models">
            {llms.map((model) => (
              <CommandItem
                key={model.id}
                disabled={!model.active}
                onSelect={() => {
                  onChange && onChange({ key: 'model', value: model.name.toLowerCase() })
                  setSelectedPreset(model)
                  setOpen(false)
                }}
              >
                {model.active
                  ? model.icon
                  : (
                    <span className='relative'>
                      {model.icon}
                      <span className='grid items-center h-8 px-1 mr-2 absolute inset-0 w-full bg-background/70'>
                        <Lock className="h-6 w-6" />
                      </span>
                    </span>
                    )}
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
