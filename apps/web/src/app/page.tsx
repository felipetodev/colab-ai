'use client'
import { useChat } from 'ai/react';
import Sidebar from "@/components/sidebar";
import MainNav from "@/components/main-nav";
import Chat from "@/components/chat";

export default function Home(): JSX.Element {
  const { messages, input, stop, setInput, append, isLoading } = useChat({
    onResponse(response) {
      if (response.status === 401) {
        // eslint-disable-next-line no-alert
        alert(response.statusText)
      }
    }
  });
  return (
    <main className="flex-col flex h-screen min-w-[1280px] overflow-hidden">
      <MainNav className="mx-6" />
      <div className="relative flex h-full overflow-hidden">
        <Sidebar />
        <Chat
          append={append}
          id={crypto.randomUUID()}
          input={input}
          isLoading={isLoading}
          messages={messages}
          setInput={setInput}
          stop={stop}
        />
      </div>
    </main>
  );
}
