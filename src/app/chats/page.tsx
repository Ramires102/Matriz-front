"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import ChatsDashboard from "@/components/chats/ChatsDashboard";

export default function ChatsPage() {
  return (
    <AuthGuard>
      <ChatsDashboard />
    </AuthGuard>
  );
}
