'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export async function createBetaAccess () {
  cookies().set('invitedId', crypto.randomUUID())
  // redirect('/')
}

export async function removeBetaAccess () {
  cookies().delete('invitedId')
  redirect('/')
}
