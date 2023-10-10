'use client'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Textarea } from './ui/textarea'
import { SubmitButton } from 'src/app/actions/submit-button'
import { sendFeedback } from 'src/app/actions/send-feedback'
import { useToast } from '@/components/ui/use-toast'

function FeedbackPopover () {
  const { toast } = useToast()
  return (
    <Popover>
      <PopoverTrigger className={cn(buttonVariants({ variant: 'outline' }), 'h-7 px-2')}>
        Feedback
      </PopoverTrigger>
      <PopoverContent side='bottom' className='relative'>
        <form action={async (formData: FormData) => {
          await sendFeedback(formData)
          toast({
            variant: 'success',
            description: 'Thanks for your feedback!'
          })
        }}>
          <Textarea
            required
            name="feedback"
            placeholder='Ideas on how to improve this app.'
            className='h-28 resize-none'
          />
          <footer className='flex mt-4'>
            <SubmitButton size='sm' className='ml-auto'>
              Send Feedback
            </SubmitButton>
          </footer>
        </form>
      </PopoverContent>
    </Popover>
  )
}

export default FeedbackPopover
