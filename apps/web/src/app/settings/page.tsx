import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Separator } from '@/components/ui/separator'
import { ProfileForm } from './components/profile-form'
import type { Database } from '@/lib/types/database'
import { z } from 'zod'

const metadataSchema = z.object({
  username: z.string(),
  email: z.string()
})

type UserMetadata = z.infer<typeof metadataSchema>

export default async function Settings () {
  const cookieStore = cookies()
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })
  const { data: { user } } = await supabase.auth.getUser()

  if (user == null) return

  const userMetadata: UserMetadata = {
    username: user.user_metadata.user_name,
    email: user.email ?? ''
  }

  return (
    <main className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">
          Update your profile details.
        </p>
      </div>
      <Separator />
      <ProfileForm user={userMetadata} />
    </main>
  )
}
