'use client'
import { useChat } from 'ai/react';
import Sidebar from "@/components/sidebar";
import MainNav from "@/components/main-nav";
import UserNav from "@/components/user-nav";
import Chat from "@/components/chat";

export default function Home(): JSX.Element {
  const { messages, input, stop, handleInputChange, handleSubmit, isLoading } = useChat();
  return (
    <main className="flex-col flex h-screen min-w-[1280px] overflow-hidden">
      <div className="border-b">
        <div className="flex h-14 items-center px-4">
          <MainNav className="mx-6" />
          <div className="ml-auto flex items-center space-x-4">
            <UserNav />
          </div>
        </div>
      </div>

      <div className="relative flex h-full overflow-hidden">
        <Sidebar />
        <Chat
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          input={input}
          isLoading={isLoading}
          messages={messages}
          stop={stop}
        />
      </div>
    </main>
  );
}
