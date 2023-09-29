'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'
import { IconOpenAI } from '@/components/ui/icons'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const profileFormSchema = z.object({
  openaiKey: z.string(),
  openaiOrg: z.string(),
  pineconeApiKey: z.string(),
  pineconeEnvironment: z.string(),
  pineconeIndex: z.string(),
  supabaseSecretKey: z.string(),
  supabaseUrl: z.string(),
  vectorDBSelected: z.string(),
  dbStatus: z.boolean()
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProjectForm ({ defaultValues }: { defaultValues: ProfileFormValues }) {
  const router = useRouter()
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: 'onChange'
  })

  async function onSubmit (data: ProfileFormValues) {
    await fetch('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    })

    router.refresh()
  }

  const activeUserDatabase = form.watch('dbStatus')

  return (
    <Form {...form}>
      <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="openaiKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                <IconOpenAI className="mr-1.5" />
                OpenAI key
              </FormLabel>
              <FormControl>
                <Input placeholder="sk-am1RLw7XUWGXGUBaSgsNT3Blb..." type="password" {...field} />
              </FormControl>
              <FormDescription>
                Do not share your API key with others.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="openaiOrg"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                <IconOpenAI className="mr-1.5" />
                OpenAI Organization (optional)
              </FormLabel>
              <FormControl>
                <Input placeholder="org-gQlunsXZKd2S7OWidtLzf..." type="password" {...field} />
              </FormControl>
              <FormDescription>
                Identifier for this organization sometimes used in API requests
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />
        <div className="flex items-center space-x-2">
          <Switch defaultChecked={activeUserDatabase} id="database-toggle" name="dbStatus" onCheckedChange={(isChecked) => form.setValue('dbStatus', isChecked)} />
          <Label htmlFor="database-toggle">Use vector database</Label>
        </div>
        <Tabs className="relative" defaultValue={form.watch('vectorDBSelected')} onValueChange={(db) => form.setValue('vectorDBSelected', db as 'pinecone' | 'supabase')}>
          <TabsList className="h-full mb-4">
            <TabsTrigger value="pinecone">
              <img alt="pinecone-db" className="h-8" src="/pinecone-logo.svg" />
            </TabsTrigger>
            <TabsTrigger value="supabase">
              <img alt="supabase-vectorpg" className="h-8" src="/supabase-logo.svg" />
            </TabsTrigger>
          </TabsList>
          <TabsContent value="pinecone">
            <FormField
              control={form.control}
              name="pineconeApiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pinecone API key</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormDescription>
                    Pinecone vector API key to use for similarity search
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pineconeEnvironment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pinecone Environment</FormLabel>
                  <FormControl>
                    <Input placeholder="eg: us-east-1-aws" {...field} />
                  </FormControl>
                  <FormDescription>
                    Pinecone environment DB
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pineconeIndex"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pinecone Index name</FormLabel>
                  <FormControl>
                    <Input placeholder="general" {...field} />
                  </FormControl>
                  <FormDescription>
                    Pinecone index name of DB
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          <TabsContent value="supabase">
            <FormField
              control={form.control}
              name="supabaseSecretKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supabase Secret key</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} placeholder="eyJhfNciOiJIUzF1NiIsInR5c..." />
                  </FormControl>
                  <FormDescription>
                    This key has the ability to bypass Row Level Security. Never share it publicly.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="supabaseUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supabase Project URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://<your_project>.supabase.co" {...field} />
                  </FormControl>
                  <FormDescription>
                    A RESTful endpoint for querying and managing your database.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          {!activeUserDatabase && (
            <div className="absolute top-0 left-0 h-full w-full bg-background/60 select-none" />
          )}
        </Tabs>

        <Button type="submit">Update settings</Button>
      </form>
    </Form>
  )
}
