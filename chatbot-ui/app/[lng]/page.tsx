import { Chat } from '@/components/Chat/Chat';
import { Navbar } from '@/components/Mobile/Navbar';
import SidebarToggle from '@/components/Sidebar/SidebarToggle';
import { Chatbar } from '@/components/Chatbar/Chatbar';

export default function Page() {
  return (
    <>
      <main className="flex h-screen w-screen flex-col text-sm text-white">
        <div className="fixed top-0 w-full sm:hidden">
          <Navbar />
        </div>

        <div className="flex h-full w-full pt-[48px] sm:pt-0">
          <SidebarToggle>
            <Chatbar />
          </SidebarToggle>

          <div className="flex flex-1">
            <Chat />
          </div>
        </div>
      </main>
    </>
  );
}
