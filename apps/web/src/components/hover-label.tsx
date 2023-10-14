import { InfoCircledIcon } from '@radix-ui/react-icons'
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card'

function HoverLabel ({ children }: { children: React.ReactNode }) {
  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>
        <InfoCircledIcon className="w-4 h-4 mr-1" />
      </HoverCardTrigger>
      <HoverCardContent
        align="start"
        className="w-[260px] text-sm"
        side="left"
      >
        {children}
      </HoverCardContent>
    </HoverCard>
  )
}

export default HoverLabel
