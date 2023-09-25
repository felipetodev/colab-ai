import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Chat from "@/components/chat";
import { type Database } from "@/lib/types/database";

export default async function Home() {
  const supabase = createServerComponentClient<Database>({ cookies })
  const { data: chats } = await supabase
    .from('chats')
    .select('id, name, messages, folderId:folder_id')

  return (
    <main className="flex-col flex h-[calc(100vh-57px)] min-w-[1280px] overflow-hidden">
      <Chat
        chats={chats ?? []}
        id={crypto.randomUUID()}
      />
    </main>
  );
}
