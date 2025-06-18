
'use client';

import { useState, useEffect } from 'react';
import type { CaseListItem, UserProfile } from '@/types';
import { CasesDataTable } from '@/components/cases/CasesDataTable';
import { columns } from '@/components/cases/columns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getUserProfileById, getAllUserProfiles } from '@/lib/mockData'; // Import profile functions
import { Skeleton } from '@/components/ui/skeleton';

const LOCAL_STORAGE_PROFILE_KEY = 'selectedUserProfileId';

interface WorkingListPageClientProps {
  caseListItems: CaseListItem[];
  initialUserName: string; // Used as a fallback or initial display
}

export function WorkingListPageClient({ caseListItems, initialUserName }: WorkingListPageClientProps) {
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [displayedCases, setDisplayedCases] = useState<CaseListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      setIsLoading(true);
      const storedProfileId = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
      let profile: UserProfile | null = null;

      if (storedProfileId) {
        profile = getUserProfileById(storedProfileId);
      }
      
      if (!profile) {
        const allProfiles = getAllUserProfiles();
        if (allProfiles.length > 0) {
          // Fallback to a default profile, e.g., the first one or a specific one
          profile = allProfiles.find(p => p.id === "user-alex-uw") || allProfiles[0]; 
          if (profile) localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, profile.id);
        }
      }
      setCurrentUserProfile(profile);
      setIsLoading(false);
    }
  }, [isMounted]);

  useEffect(() => {
    if (currentUserProfile && caseListItems) {
      const filtered = caseListItems.filter(
        (item) => item.assignedTo === currentUserProfile.name
      );
      setDisplayedCases(filtered);
    } else if (!currentUserProfile && !isLoading) {
      // If no profile could be determined (e.g., empty localStorage and no defaults)
      setDisplayedCases([]); 
    }
  }, [currentUserProfile, caseListItems, isLoading]);

  if (!isMounted || isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3 mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center py-4">
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-10 w-24 ml-auto" />
            </div>
            <Skeleton className="h-px w-full" /> {/* Table border visual */}
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border-b">
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-6 w-1/4" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const actualUserName = currentUserProfile?.name || initialUserName;

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold font-headline">My Working List</CardTitle>
          <CardDescription>
            Cases assigned to {actualUserName}. View, sort, and filter your active underwriting cases.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CasesDataTable columns={columns} data={displayedCases} />
        </CardContent>
      </Card>
    </div>
  );
}
