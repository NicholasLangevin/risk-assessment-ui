'use client';

import type { NotificationItem } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { MoreHorizontal, Cog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface NotificationListProps {
  notifications: NotificationItem[];
}

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
        <div className="w-2.5 h-2.5 bg-primary rounded-full mt-1.5 flex-shrink-0" title="Unread"></div>
      )}
      <Avatar className={`h-10 w-10 flex-shrink-0 ${notification.isRead && !notification.imageSrc ? 'ml-[22px]' : ''} ${notification.isRead && notification.imageSrc ? 'ml-[22px]' : ''}`}>
        <AvatarImage src={notification.avatarSrc} alt={notification.avatarAlt} data-ai-hint="profile person" />
        <AvatarFallback>{notification.avatarAlt.substring(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-grow overflow-hidden">
        <p className="text-sm text-popover-foreground leading-snug">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{notification.timestamp}</p>
      </div>
      {notification.imageSrc && (
        <div className="w-28 h-16 relative flex-shrink-0">
          <Image
            src={notification.imageSrc}
            alt={notification.imageAlt || 'Notification image'}
            fill
            className="rounded-md object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            data-ai-hint="thumbnail video"
          />
        </div>
      )}
      <Button variant="ghost" size="icon" className="ml-1 h-8 w-8 self-center flex-shrink-0 text-muted-foreground hover:text-foreground">
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">More options</span>
      </Button>
    </div>
  );
}
