"use client";

import { Button } from '@/components/ui/button';
import { UserHomePageClient } from '@/components/user-home/UserHomePageClient';
import { useState } from 'react';
import notifications from '@/lib/mockData/notifications.json'; // Import the JSON data directly

// This is a server component
export default function UserPersonalHomePage() {
  const [showNotification, setShowNotification] = useState(false);
  const [notificationContent, setNotificationContent] = useState('');

  function fetchNotification() {
    const randomIndex = Math.floor(Math.random() * notifications.length);
    const selectedNotification = notifications[randomIndex];
    setNotificationContent(selectedNotification.message);
    setShowNotification(true);
  }
  return (
    <div>
      <UserHomePageClient />
      <Button onClick={fetchNotification}>Show Random Notification</Button>
      {showNotification && (
        <div className="notification-popup">
          <div className="notification-popup-content">{notificationContent}</div>
          <button className="notification-popup-close" onClick={() => setShowNotification(false)}>X</button>
        </div>
      )}
    </div>
  );
}