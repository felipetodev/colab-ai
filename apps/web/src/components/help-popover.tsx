import { HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { IconDiscord } from './ui/icons'

function HelpPopover () {
  return (
    <Popover>
      <PopoverTrigger className={cn(buttonVariants({ variant: 'ghost' }), 'h-7 px-2')}>
        <HelpCircle className='w-4 h-4 mr-1.5' />
        Help
      </PopoverTrigger>
      <PopoverContent side='bottom' align='end' className='relative'>
        <h5 className='font-semibold'>Need help with your project?</h5>
        <p className='text-xs my-4'>For issues with your project, or other inquiries about our services.</p>
        <div className='relative overflow-hidden h-20 bg-[#404eed] rounded'>
          <a
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'absolute left-2 top-2 z-10 cursor-pointer text-xs')}
            href="/discord"
            target='_blank'
          >
            <IconDiscord className='w-5 h-5 mr-1' /> Join Discord server
          </a>
          <img className='block absolute h-full z-10 -right-10 top-0 object-contain' src="/discord-pj.svg" alt="" />
          <img className='block absolute h-full inset-0 object-cover' src="/discord-bg.svg" alt="" />
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default HelpPopover
