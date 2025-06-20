"use client";

import { Button } from '@/components/ui/button';
import { UserHomePageClient } from '@/components/user-home/UserHomePageClient';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCcw } from 'lucide-react';
import notifications from '@/lib/mockData/notifications.json'; // Import the JSON data directly

export default function UserPersonalHomePage() {
  const router = useRouter();
  const [showNotification, setShowNotification] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<{ id: string; title: string; message: string } | null>(null);

  function fetchNotification() {
    const randomIndex = Math.floor(Math.random() * notifications.length);
    const selectedNotification = notifications[randomIndex];
    setSelectedNotification(selectedNotification);
    setShowNotification(true);
  }

  const formatNotificationMessage = (message: string) => {
    const match = message.match(/(Case #[C0-9-]+)/);
    if (match) {
      const caseNumber = match[0];
      const parts = message.split(caseNumber);
      return (
        <>
          {parts[0]}<span className="text-primary font-bold">{caseNumber}</span>{parts[1]}
        </>
      );
    }
    return message;
  };

  const extractCaseId = (message: string): string | null => {
    const match = message.match(/Case #([C0-9-]+)/); // Keep this for navigation logic
    return match ? match[1] : null;
  };

  const handleNotificationClick = () => {
    if (selectedNotification) {
      const caseId = extractCaseId(selectedNotification.message);
      if (caseId) {
 console.log("Extracted Case ID:", caseId);
        router.push(`/case/${caseId}`);
        setShowNotification(false); // Close popup after navigation
      }
    }
  };
  return (
    <div>
      <UserHomePageClient />
      <Button onClick={fetchNotification}>
        <RefreshCcw className="h-4 w-4" />
      </Button>
      {showNotification && (
        <div className="notification-popup fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg cursor-pointer" onClick={handleNotificationClick}>
          <div className="notification-title font-bold mb-1">
            {selectedNotification?.title}
          </div>
          <div className="notification-message text-sm font-semibold">
            {/* {selectedNotification?.message} */}
            {selectedNotification?.message && formatNotificationMessage(selectedNotification.message)}
          </div>
          <button className="notification-popup-close" onClick={(e) => { e.stopPropagation(); setShowNotification(false); }}>X</button>
        </div>
      )}
    </div>
  );
}