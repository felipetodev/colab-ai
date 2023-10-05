'use client'

import type { Session } from '@supabase/auth-helpers-nextjs'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import UserNav from './user-nav'
import LoginDialog from './login-dialog'

export function AuthButtonClient ({ session }: { session: Session | null }) {
  const supabase = createClientComponentClient()
  const router = useRouter()

  const handleSignIn = async (provider: 'github' | 'google') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: process.env.NODE_ENV === 'production'
          ? `${process.env.APP_HOST}/auth/callback`
          : 'http://localhost:3000/auth/callback'
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
      : <LoginDialog
        session={session}
        handleSignIn={handleSignIn}
      />
    }
  </>
}
