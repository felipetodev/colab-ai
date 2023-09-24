import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Separator } from "@/components/ui/separator";
import { ProfileForm } from "src/app/settings/components/profile-form";

export default async function Settings() {
  const supabase = createServerComponentClient({ cookies });
  const { data: user } = await supabase
    .from('users')
    .select('username:user_name')

  return (
    <main className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">
          Update your profile details.
        </p>
      </div>
      <Separator />
      <ProfileForm username={user?.[0].username} />
    </main>
  );
}
