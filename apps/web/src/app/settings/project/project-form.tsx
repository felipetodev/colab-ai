"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { IconOpenAI } from "@/components/ui/icons"

const profileFormSchema = z.object({
  openaiKey: z.string(),
  openaiOrg: z.string(),
  pineconeApiKey: z.string(),
  pineconeEnvironment: z.string(),
  pineconeIndex: z.string(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProjectForm({ defaultValues }: { defaultValues: ProfileFormValues }) {
  const router = useRouter()
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  })

  async function onSubmit(data: ProfileFormValues) {
    await fetch(`http://localhost:3000/api/settings`, {
      method: "PUT",
      body: JSON.stringify(data)
    });

    router.refresh()
  }

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

        <Button type="submit">Update settings</Button>
      </form>
    </Form>
  )
}
