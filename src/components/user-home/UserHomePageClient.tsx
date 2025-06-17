
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, ListChecks, UserCircle2 } from 'lucide-react'; // Changed to UserCircle2 for better visual

export function UserHomePageClient() {
  // Placeholder data - in a real app, this would come from user session or API
  const userName = "Alex Underwriter"; // Example user name
  const tasksDueToday = 3;
  const activeQuotes = 12;
  const recentActivity = "Reviewed Quote Q1000008";

  return (
    <>
      <div className="flex items-center mb-8">
        <UserCircle2 className="h-12 w-12 mr-4 text-primary" />
        <div>
          <h1 className="text-3xl font-bold font-headline">Welcome back, {userName}!</h1>
          <p className="text-muted-foreground">Here's a quick overview of your workflow.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Due Today</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasksDueToday}</div>
            <p className="text-xs text-muted-foreground">Items requiring your attention.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Quotes</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeQuotes}</div>
            <p className="text-xs text-muted-foreground">Total quotes currently in progress.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
             <CardDescription className="text-xs">Your latest interactions.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{recentActivity}</p>
            <p className="text-xs text-muted-foreground">Logged 15 minutes ago.</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
