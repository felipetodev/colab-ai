import { useState } from "react"
import { InfoCircledIcon } from "@radix-ui/react-icons"
import type { SliderProps } from "@radix-ui/react-slider"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card"
import { Slider } from "./ui/slider"

interface TemperatureSelectorProps {
  defaultValue: SliderProps["defaultValue"]
  onChange: (value: { key: string, value: any }) => void
}

function TemperatureSelector({ defaultValue, onChange }: TemperatureSelectorProps) {
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
              Controls randomness: lowering results in less random completions. As the temperature approaches zero, the model will become deterministic and repetitive.
            </HoverCardContent>
          </HoverCard>
          <div className="flex font-semibold space-x-1.5">
            <h2>
              Temperature:
            </h2>
            <span>
              {value}
            </span>
          </div>
        </div>
        <Slider
          aria-label="Temperature"
          className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
          defaultValue={value}
          id="temperature"
          max={1}
          onValueChange={(e) => {
            const [temperature] = e as [number]
            setValue(e)
            onChange({ key: 'temperature', value: temperature })
          }}
          step={0.1}
        />
      </div>
    </div>
  )
}

export default TemperatureSelector
