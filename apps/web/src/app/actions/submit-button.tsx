'use client'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/icons'
import { experimental_useFormStatus as useFormStatus } from 'react-dom'

export function SubmitButton ({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" aria-disabled={pending} className="text-white bg-green-700 hover:bg-green-700/90">
      {pending ? <Spinner className='animate-spin w-5 h-5' /> : children}
    </Button>
  )
}
