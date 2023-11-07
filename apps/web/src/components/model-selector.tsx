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
  name: string
  active: boolean
}

const parsedValues = (value: string) => {
  if (value === 'gpt-4-1106-preview') {
    return 'GPT-4-turbo'
  }
  return value
}

export const models: Preset[] = [
  {
    icon: <span className='grid place-content-center rounded bg-[#1fb88a] h-8 px-1 mr-2'>
      <IconGPT className='w-6 h-6' />
    </span>,
    name: 'GPT-3.5-turbo',
    active: true
  },
  {
    icon: <span className='grid place-content-center rounded bg-[#1fb88a] h-8 px-1 mr-2'>
      <IconGPT className='w-6 h-6' />
    </span>,
    name: 'GPT-3.5-turbo-16k',
    active: true
  },
  {
    icon: <span className='grid place-content-center rounded bg-[#ab68ff] h-8 px-1 mr-2'>
      <IconGPT className='w-6 h-6' />
    </span>,
    name: 'GPT-4',
    active: true
  },
  {
    icon: <span className='grid place-content-center rounded bg-[#ab68ff] h-8 px-1 mr-2'>
      <IconGPT className='w-6 h-6' />
    </span>,
    name: 'GPT-4-turbo',
    active: true
  }
]

export const betaModels: Preset[] = [
  {
    icon: <span className='grid place-content-center rounded bg-[#1fb88a] h-8 px-1 mr-2'>
      <IconGPT className='w-6 h-6' />
    </span>,
    name: 'GPT-3.5-turbo',
    active: true
  },
  {
    icon: <span className='grid place-content-center rounded bg-[#1fb88a] h-8 px-1 mr-2'>
      <IconGPT className='w-6 h-6' />
    </span>,
    name: 'GPT-3.5-turbo-16k',
    active: false
  },
  {
    icon: <span className='grid place-content-center rounded bg-[#ab68ff] h-8 px-1 mr-2'>
      <IconGPT className='w-6 h-6' />
    </span>,
    name: 'GPT-4',
    active: false
  },
  {
    icon: <span className='grid place-content-center rounded bg-[#ab68ff] h-8 px-1 mr-2'>
      <IconGPT className='w-6 h-6' />
    </span>,
    name: 'GPT-4-turbo',
    active: false
  }
]

export const metaModels: Preset[] = [
  {
    icon: <span className='grid place-content-center rounded bg-[#ab68ff] h-8 px-1 mr-2'>
      <IconGPT className='w-6 h-6' />
    </span>,
    name: 'Llama 2 (7b)',
    active: false
  }
]

interface Props extends PopoverProps {
  value: string
  isBeta?: boolean
  onChange?: (model: any) => void
}

function ModelSelector ({ isBeta, value, onChange, ...props }: Props) {
  const [open, setOpen] = React.useState(false)
  const [selectedPreset, setSelectedPreset] = React.useState<Preset>(
    isBeta
      ? betaModels.find((m) => m.name.toLowerCase() === value.toLowerCase()) ?? betaModels[0]
      : models.find((m) => m.name.toLowerCase() === parsedValues(value).toLowerCase()) ?? models[0]
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
      <input type="hidden" name="llmModel" value={selectedPreset.name?.toLowerCase()} />
      <PopoverContent className="w-[620px] p-0">
        <Command>
          <CommandInput placeholder="Search models..." />
          <CommandEmpty>No presets found.</CommandEmpty>
          <CommandGroup heading="OpenAI models">
            {llms.map((model) => (
              <CommandItem
                key={model.name}
                disabled={!model.active}
                onSelect={() => {
                  if (model.name === 'GPT-4-turbo') {
                    onChange && onChange({ key: 'model', value: 'gpt-4-1106-preview' })
                  } else {
                    onChange && onChange({ key: 'model', value: model.name.toLowerCase() })
                  }
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
                {model.name === 'GPT-4-turbo' && (
                  <span
                    className="ml-2 inline-flex items-center justify-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-emerald-700 dark:bg-emerald-700 dark:text-emerald-100"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="-ms-1 me-1.5 h-4 w-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>

                    <p className="whitespace-nowrap text-xs">new</p>
                  </span>)}
                <CheckIcon
                  className={cn(
                    'ml-auto h-4 w-4',
                    selectedPreset?.name === model.name
                      ? 'opacity-100'
                      : 'opacity-0'
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Meta models">
            {metaModels.map((model) => (
              <CommandItem
                key={model.name}
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
                    selectedPreset?.name === model.name
                      ? 'opacity-100'
                      : 'opacity-0'
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default ModelSelector
