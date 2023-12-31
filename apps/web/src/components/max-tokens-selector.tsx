import { useState } from 'react'
import { InfoCircledIcon } from '@radix-ui/react-icons'
import type { SliderProps } from '@radix-ui/react-slider'
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card'
import { Slider } from './ui/slider'

interface MaxLengthSelectorProps {
  defaultValue: SliderProps['defaultValue']
  onChange?: (value: { key: 'maxTokens', value: any }) => void
}

function MaxTokensSelector ({ defaultValue, onChange }: MaxLengthSelectorProps) {
  const [value, setValue] = useState(defaultValue)
  return (
    <div className="w-full">
      <div className="flex flex-col w-full">
        <div className="flex items-center mb-2">
          <HoverCard openDelay={200}>
            <HoverCardTrigger asChild>
              <InfoCircledIcon className="w-4 h-4 mr-1" />
            </HoverCardTrigger>
            <HoverCardContent
              align="start"
              className="w-[260px] text-sm"
              side="left"
            >
              The maximum number of tokens to generate. Requests can use up to 2,048 or 4,000 tokens, shared between prompt and completion. The exact limit varies by model.
            </HoverCardContent>
          </HoverCard>
          <div className="flex font-semibold space-x-1.5">
            <h2>
              Max Tokens:
            </h2>
            <span>
              {value}
            </span>
          </div>
        </div>
        <Slider
          aria-label="Max Tokens"
          className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
          defaultValue={value}
          name="maxTokens"
          id="maxlength"
          max={4000}
          onValueChange={(e) => {
            const [maxTokens] = e as [number]
            setValue(e)
            onChange && onChange({ key: 'maxTokens', value: maxTokens })
          }}
          step={50}
        />
      </div>
    </div>
  )
}

export default MaxTokensSelector
