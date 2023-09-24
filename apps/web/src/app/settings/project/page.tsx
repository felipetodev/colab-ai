'use client'

import { Separator } from "@/components/ui/separator";
import { ProjectForm } from "./project-form";

export default function ProjectSettings() {
  return (
    <main className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Project Settings</h3>
        <p className="text-sm text-muted-foreground">
          Data base settings, API keys, and other project-specific settings.
        </p>
      </div>
      <Separator />
      <ProjectForm />
    </main>
  );
}
