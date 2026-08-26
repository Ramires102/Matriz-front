"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import EventsDashboard from "@/components/events/EventsDashboard";

export default function EventsPage() {
  return (
    <AuthGuard>
      <EventsDashboard />
    </AuthGuard>
  );
}
