import type { Metadata } from "next"
import Image from "next/image"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation";
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { SidebarNav } from "./components/sidebar-nav"

export const metadata: Metadata = {
  title: "Colab-AI | Settings",
}

const sidebarNavItems = [
  {
    title: "Profile",
    href: "/settings",
  },
  {
    title: "Project Settings",
    href: "/settings/project",
  },
  {
    title: "Appearance",
    href: "/settings/appearance",
  }
]

interface SettingsLayoutProps {
  children: React.ReactNode
}

export default async function SettingsLayout({ children }: SettingsLayoutProps) {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/')
  }

  return (
    <>
      <div className="md:hidden">
        <Image
          alt="Forms"
          className="block dark:hidden"
          height={791}
          src="/examples/forms-light.png"
          width={1280}
        />
        <Image
          alt="Forms"
          className="hidden dark:block"
          height={791}
          src="/examples/forms-dark.png"
          width={1280}
        />
      </div>
      <div className="hidden space-y-6 p-10 pb-16 md:block">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your account settings and set e-mail preferences.
          </p>
        </div>
        <Separator className="my-6" />
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="-mx-4 lg:w-1/5">
            <SidebarNav items={sidebarNavItems} />
            <Button className="mt-3" variant='destructive'>
              Delete project
            </Button>
          </aside>
          <div className="flex-1 lg:max-w-2xl">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}
