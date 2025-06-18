
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { CaseListItem, UserProfile } from '@/types';
import { CasesDataTable } from '@/components/cases/CasesDataTable';
import { columns } from '@/components/cases/columns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getUserProfileById, getAllUserProfiles } from '@/lib/mockData';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useOpenedCases } from '@/contexts/OpenedCasesContext';
import { SkipForward } from 'lucide-react';

const LOCAL_STORAGE_PROFILE_KEY = 'selectedUserProfileId';

interface WorkingListPageClientProps {
  caseListItems: CaseListItem[];
  initialUserName: string;
}

export function WorkingListPageClient({ caseListItems, initialUserName }: WorkingListPageClientProps) {
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [displayedCases, setDisplayedCases] = useState<CaseListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const router = useRouter();
  const { openCase, isCaseOpen, openedCases } = useOpenedCases();

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
      setDisplayedCases([]); 
    }
  }, [currentUserProfile, caseListItems, isLoading]);

  const nextCaseToOpen = useMemo(() => {
    if (!displayedCases || displayedCases.length === 0) {
      return null;
    }
    return displayedCases.find(caseItem => !isCaseOpen(caseItem.id)) || null;
  }, [displayedCases, isCaseOpen, openedCases]); // Include openedCases to re-evaluate when a tab is closed

  const handleNextCase = () => {
    if (nextCaseToOpen) {
      const caseInfo: Parameters<typeof openCase>[0] = {
        id: nextCaseToOpen.id,
        insuredName: nextCaseToOpen.insuredName,
        broker: nextCaseToOpen.broker,
      };
      openCase(caseInfo);
      router.push(`/case/${nextCaseToOpen.id}`);
    }
  };

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
            <Skeleton className="h-px w-full" />
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
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-3xl font-bold font-headline">My Working List</CardTitle>
            <CardDescription>
              Cases assigned to {actualUserName}. View, sort, and filter your active underwriting cases.
            </CardDescription>
          </div>
          <Button 
            onClick={handleNextCase} 
            disabled={!nextCaseToOpen}
            variant="outline"
            size="sm"
          >
            <SkipForward className="mr-2 h-4 w-4" />
            Next Case
          </Button>
        </CardHeader>
        <CardContent>
          <CasesDataTable columns={columns} data={displayedCases} />
        </CardContent>
      </Card>
    </div>
  );
}
