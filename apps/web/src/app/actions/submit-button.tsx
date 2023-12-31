'use client'

import { Button, type ButtonProps } from '@/components/ui/button'
import { Spinner } from '@/components/ui/icons'
import { useFormStatus } from 'react-dom'

export function SubmitButton ({ variant, size, children, ...props }: ButtonProps) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      variant={variant}
      size={size}
      aria-disabled={pending}
      {...props}
    >
      {pending ? <Spinner className='animate-spin w-5 h-5' /> : children}
    </Button>
  )
}
