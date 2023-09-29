'use client'

import type { Session } from '@supabase/auth-helpers-nextjs'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Button } from './ui/button'
import UserNav from './user-nav'

export function AuthButtonClient ({ session }: { session: Session | null }) {
  const supabase = createClientComponentClient()
  const router = useRouter()

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback'
      }
    })
  }

  const handleSignOut = async (): Promise<void> => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return <>
    {session !== null
      ? (
      <UserNav
        avatarUrl={session.user.user_metadata.avatar_url}
        email={session.user.email}
        handleSignOut={handleSignOut}
        username={session.user.user_metadata.user_name}
      />
        )
      : (
      <Button onClick={handleSignIn} size='sm'>
        Sign in
      </Button>
        )}
  </>
}
