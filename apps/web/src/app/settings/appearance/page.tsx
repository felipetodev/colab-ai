import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Separator } from '@/components/ui/separator'
import { AppearanceForm } from './appearance-form'
import { type Database } from '@/lib/types/database'

export default async function SettingsAppearancePage () {
  const cookieStore = cookies()
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })
  const { data: appearance } = await supabase
    .from('users')
    .select('theme, font')
    .maybeSingle()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Appearance</h3>
        <p className="text-sm text-muted-foreground">
          Customize the appearance of the app. Automatically switch between day
          and night themes.
        </p>
      </div>
      <Separator />
      <AppearanceForm appearance={appearance} />
    </div>
  )
}
