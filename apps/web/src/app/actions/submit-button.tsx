'use client'

import { Button, type ButtonProps } from '@/components/ui/button'
import { Spinner } from '@/components/ui/icons'
import { experimental_useFormStatus as useFormStatus } from 'react-dom'

type Props = {
  variant?: ButtonProps['variant']
  size?: ButtonProps['size']
  className?: string
  children: React.ReactNode
}

export function SubmitButton ({ variant, size, className, children }: Props) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      aria-disabled={pending}
      className={className}
    >
      {pending ? <Spinner className='animate-spin w-5 h-5' /> : children}
    </Button>
  )
}
