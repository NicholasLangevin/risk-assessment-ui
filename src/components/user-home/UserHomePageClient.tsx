
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, ListChecks, UserCircle2 } from 'lucide-react';
import type { UserProfile } from '@/types';
import { getUserProfileById, getAllUserProfiles } from '@/lib/mockData'; // Import functions

const LOCAL_STORAGE_PROFILE_KEY = 'selectedUserProfileId';

export function UserHomePageClient() {
  const [userName, setUserName] = useState<string>("User"); // Default name
  const [isMounted, setIsMounted] = useState(false);

  // Placeholder data - in a real app, this would come from user session or API
  const tasksDueToday = 3;
  const activeQuotes = 12;
  const recentActivity = "Reviewed Quote Q1000008";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const storedProfileId = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
      let profileToSet: UserProfile | null = null;

      if (storedProfileId) {
        profileToSet = getUserProfileById(storedProfileId);
      }
      
      if (profileToSet) {
        setUserName(profileToSet.name);
      } else {
        // Fallback if no stored profile or if stored ID is invalid
        const allProfiles = getAllUserProfiles();
        if (allProfiles.length > 0) {
          setUserName(allProfiles[0].name); // Default to the first profile in the list
           // Optionally, also set this as the default in localStorage
          localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, allProfiles[0].id);
        } else {
          setUserName("Alex Miller"); // Absolute fallback
        }
      }
    }
  }, [isMounted]);


  if (!isMounted) {
    // Render a loading state or null to avoid hydration mismatch
    // For simplicity, we can show a generic loading message or a skeleton
    return (
        <>
        <div className="flex items-center mb-8">
            <UserCircle2 className="h-12 w-12 mr-4 text-primary" />
            <div>
            <h1 className="text-3xl font-bold font-headline">Welcome back!</h1>
            <p className="text-muted-foreground">Loading your workflow overview...</p>
            </div>
        </div>
        {/* Skeletons for cards can be added here if desired */}
        </>
    );
  }

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
