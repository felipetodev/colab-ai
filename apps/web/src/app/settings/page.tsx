import { ProfileForm } from "src/app/settings/components/profile-form";
import { Separator } from "@/components/ui/separator";


export default function Settings() {
  return (
    <main className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">
          Update your profile details.
        </p>
      </div>
      <Separator />
      <ProfileForm />
    </main>
  );
}
