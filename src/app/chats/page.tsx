"use client";

import { useState } from "react";
import ChatList from "@/components/ChatList";
import ChatWindow from "@/components/ChatWindow";

export default function ChatsPage() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  return (
    <div className="flex h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Sidebar */}
      <aside className="w-[320px] min-w-[280px] max-w-[320px] border-r border-gray-200 bg-white">
        <ChatList
          selectedChatId={selectedChatId}
          onSelectChat={setSelectedChatId}
        />
      </aside>

      {/* Chat Area */}
      <main className="flex flex-col flex-1 overflow-hidden">
        <ChatWindow chatId={selectedChatId} />
      </main>
    </div>
  );
}
