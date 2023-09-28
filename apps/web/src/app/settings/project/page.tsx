import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Separator } from "@/components/ui/separator";
import type { Database } from "@/lib/types/database";
import { ProjectForm } from "./project-form";

export default async function ProjectSettings() {
  const supabase = createServerComponentClient<Database>({ cookies })

  const { data: user } = await supabase
    .from('users')
    .select('openaiKey:openai_key, openaiOrg:openai_org, pineconeApiKey:pinecone_key, pineconeEnvironment:pinecone_env, pineconeIndex:pinecone_index, supabaseSecretKey:supabase_secret_key, supabaseUrl:supabase_url, vectorDBSelected:vector_db_selected')

  // on this page, user data can not be null
  // anyway this is handled in src > app > settings > layout.tsx
  if (!user) throw new Error('User not found')

  return (
    <main className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Project Settings</h3>
        <p className="text-sm text-muted-foreground">
          Data base settings, API keys, and other project-specific settings.
        </p>
      </div>
      <Separator />
      <ProjectForm defaultValues={user[0]} />
    </main>
  );
}
