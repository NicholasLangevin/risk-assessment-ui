
'use client';

import type { NotificationItem, NotificationType } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MoreHorizontal, Cog, FilePlus2, MessagesSquare, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface NotificationListProps {
  notifications: NotificationItem[];
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'newCase':
      return <FilePlus2 className="h-6 w-6 text-blue-500" />;
    case 'brokerResponse':
      return <MessagesSquare className="h-6 w-6 text-green-500" />;
    case 'systemUpdate':
      return <BellRing className="h-6 w-6 text-orange-500" />;
    case 'generic':
    default:
      return <BellRing className="h-6 w-6 text-muted-foreground" />;
  }
};

export function NotificationList({ notifications }: NotificationListProps) {
  const importantNotifications = notifications.filter(n => n.category === 'Important');
  const moreNotifications = notifications.filter(n => n.category === 'More');

  return (
    <div className="w-[380px] sm:w-[420px] text-sm bg-popover text-popover-foreground rounded-lg overflow-hidden">
      <div className="p-4 flex justify-between items-center border-b border-border">
        <h3 className="font-semibold text-lg">Notifications</h3>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Cog className="h-5 w-5" />
          <span className="sr-only">Notification settings</span>
        </Button>
      </div>

      <ScrollArea className="h-[400px] sm:h-[450px]">
        {importantNotifications.length > 0 && (
          <div className="p-2">
            <h4 className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Important</h4>
            {importantNotifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
          </div>
        )}

        {moreNotifications.length > 0 && (
          <div className="p-2">
             {importantNotifications.length > 0 && <Separator className="my-2 bg-border/70" />}
            <h4 className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">More notifications</h4>
            {moreNotifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
          </div>
        )}
        {notifications.length === 0 && (
            <p className="text-muted-foreground text-center p-10">No new notifications.</p>
        )}
      </ScrollArea>
    </div>
  );
}

function NotificationCard({ notification }: { notification: NotificationItem }) {
  return (
    <div className="flex items-start p-3 hover:bg-muted/70 rounded-md cursor-pointer space-x-3">
      {!notification.isRead && (
        <div className="w-2.5 h-2.5 bg-primary rounded-full mt-1.5 flex-shrink-0 self-center" title="Unread"></div>
      )}
      <div className={cn(
        "flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-muted/50",
        notification.isRead && "ml-[22px]" // Maintain margin if read and no dot
      )}>
        {getNotificationIcon(notification.type)}
      </div>
      <div className="flex-grow overflow-hidden">
        <p className="text-sm text-popover-foreground leading-snug">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{notification.timestamp}</p>
      </div>
      <Button variant="ghost" size="icon" className="ml-1 h-8 w-8 self-center flex-shrink-0 text-muted-foreground hover:text-foreground">
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">More options</span>
      </Button>
    </div>
  );
}
