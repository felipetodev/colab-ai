import { BellIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'

function NotificationPopover () {
  return (
    <Popover>
      <PopoverTrigger className={cn(buttonVariants({ variant: 'outline' }), 'h-9 px-2 aspect-square rounded-full')}>
        <BellIcon className='w-4 h-4' />
      </PopoverTrigger>
      <PopoverContent side='bottom' align='end'>
        <p className='text-xs'>
          (0) notifications
        </p>
      </PopoverContent>
    </Popover>
  )
}

export default NotificationPopover
