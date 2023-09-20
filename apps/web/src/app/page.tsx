'use client'
import Sidebar from "@/components/sidebar";
import MainNav from "@/components/main-nav";
import UserNav from "@/components/user-nav";
import Chat from "@/components/chat";

export default function Home(): JSX.Element {
  return (
    <main className="flex-col flex h-screen min-w-[1280px]">
      <div className="border-b">
        <div className="flex h-14 items-center px-4">
          <MainNav className="mx-6" />
          <div className="ml-auto flex items-center space-x-4">
            <UserNav />
          </div>
        </div>
      </div>

      <div className="relative flex h-full">
        <Sidebar />
        <Chat />
      </div>
    </main>
  );
}
