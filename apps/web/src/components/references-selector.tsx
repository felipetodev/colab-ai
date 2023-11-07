import { useState } from 'react'
import { InfoCircledIcon } from '@radix-ui/react-icons'
import type { SliderProps } from '@radix-ui/react-slider'
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card'
import { Slider } from './ui/slider'

type Props = {
  defaultValue: SliderProps['defaultValue']
  onChange?: (value: { key: 'references', value: any }) => void
}

function ReferencesSelector ({ defaultValue, onChange }: Props) {
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
              side="right"
            >
              Number of files to use as references for the completion.
            </HoverCardContent>
          </HoverCard>
          <div className="flex font-semibold space-x-1.5">
            <h2>
              References:
            </h2>
            <span>
              {value}
            </span>
          </div>
        </div>
        <Slider
          name='references'
          aria-label="References"
          className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
          defaultValue={value}
          id="references"
          max={10}
          onValueChange={(e) => {
            const [references] = e as [number]
            setValue(e)
            onChange && onChange({ key: 'references', value: references })
          }}
          step={1}
        />
      </div>
    </div>
  )
}

export default ReferencesSelector
