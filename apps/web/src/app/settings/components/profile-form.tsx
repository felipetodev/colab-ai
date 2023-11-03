'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'

const profileFormSchema = z.object({
  username: z
    .string()
    .min(2, {
      message: 'Username must be at least 2 characters.'
    })
    .max(30, {
      message: 'Username must not be longer than 30 characters.'
    }),
  email: z
    .string({
      required_error: 'Please select an email to display.'
    })
    .email()
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProfileForm ({ user }: { user: ProfileFormValues }) {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user.username,
      email: user.email
    },
    mode: 'onChange'
  })

  function onSubmit (data: ProfileFormValues) {
    // console.log({ data })
  }

  return (
    <Form {...form}>
      <div className='mt-8'>
        <h3 className='text-sm font-semibold'>Subscription</h3>
        <Badge variant='secondary' className='mt-2'>Free</Badge>
      </div>
      <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          disabled
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="@colab-ai" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          disabled
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="colab-ai@org.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled type="submit">Update profile</Button>
      </form>
    </Form>
  )
}
