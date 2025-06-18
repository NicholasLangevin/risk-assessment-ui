
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { UserProfile, SkillSettings, CaseType } from '@/types';
import { AllCaseTypes } from '@/types'; // Import AllCaseTypes
import { getAllUserProfiles, getUserProfileById, updateUserProfileInStorage } from '@/lib/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit3, ShieldCheck, UserCog, AlertTriangle } from 'lucide-react';
import { EditSkillsDialog } from './EditSkillsDialog'; // We will create this next
import { Skeleton } from '@/components/ui/skeleton';

const LOCAL_STORAGE_PROFILE_KEY = 'selectedUserProfileId';

// Mock data for skill options (can be moved to a constants file or fetched)
export const mockLinesOfBusiness: string[] = ["Commercial Line", "Non Standard Risk", "E&O", "D&O"];
export const mockBranches: string[] = ["New York", "London", "Chicago", "Singapore", "Zurich", "Toronto"];
export const mockBrokerCodes: string[] = ["123456", "234567", "345678", "456789", "567890", "678901", "789012"];


export function ManageTeamPageClient() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [teamMembers, setTeamMembers] = useState<UserProfile[]>([]);
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null);
  const [isSkillsDialogOpen, setIsSkillsDialogOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const loadProfilesAndTeam = useCallback(() => {
    if (!isMounted) return;

    setIsLoading(true);
    const profiles = getAllUserProfiles();
    setAllProfiles(profiles);

    const storedProfileId = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
    let user = null;
    if (storedProfileId) {
      user = profiles.find(p => p.id === storedProfileId) || null;
    }
    
    // Fallback if no stored profile or ID is invalid
    if (!user && profiles.length > 0) {
      user = profiles.find(p => p.role === 'manager') || profiles[0]; // Prefer a manager, else first profile
      if (user) localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, user.id);
    }
    setCurrentUser(user);

    if (user && user.role === 'manager') {
      const members = profiles.filter(p => p.managerId === user.id && p.role === 'underwriter');
      setTeamMembers(members);
    } else {
      setTeamMembers([]);
    }
    setIsLoading(false);
  }, [isMounted]);

  useEffect(() => {
    loadProfilesAndTeam();
  }, [loadProfilesAndTeam]);

  const handleEditSkills = (profile: UserProfile) => {
    setEditingProfile(profile);
    setIsSkillsDialogOpen(true);
  };

  const handleSaveSkills = (updatedProfile: UserProfile) => {
    updateUserProfileInStorage(updatedProfile);
    // Refresh local state to reflect changes
    loadProfilesAndTeam(); 
    setIsSkillsDialogOpen(false);
    setEditingProfile(null);
  };

  const renderSkillList = (skills: string[] | 'ALL' | undefined, categoryName: string): string => {
    if (skills === 'ALL') return 'ALL';
    if (!skills || skills.length === 0) return `No ${categoryName} assigned`;
    return skills.join(', ');
  };
  
  if (!isMounted || isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-4 p-4 border-b">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[150px]" />
                </div>
                <Skeleton className="h-8 w-20 ml-auto" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'manager') {
    return (
      <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8 text-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <CardTitle className="text-xl">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You do not have permission to view this page. Please switch to a manager profile.
            </p>
            <Button asChild className="mt-4">
              <a href="/profile">Switch Profile</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold font-headline flex items-center">
            <UserCog className="mr-3 h-8 w-8 text-primary" /> Manage Team
          </CardTitle>
          <CardDescription>View and edit skills for underwriters assigned to you, {currentUser.name}.</CardDescription>
        </CardHeader>
        <CardContent>
          {teamMembers.length === 0 ? (
            <p className="text-muted-foreground text-center py-10">You currently have no underwriters assigned to your team.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Transaction Types</TableHead>
                  <TableHead>Lines of Business</TableHead>
                  <TableHead>Branches</TableHead>
                  <TableHead>Broker Codes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell className="text-xs max-w-[150px] truncate" title={renderSkillList(member.skills?.transactionTypes, 'Transaction Types')}>
                      {renderSkillList(member.skills?.transactionTypes, 'Transaction Types')}
                    </TableCell>
                    <TableCell className="text-xs max-w-[150px] truncate" title={renderSkillList(member.skills?.linesOfBusiness, 'LOBs')}>
                      {renderSkillList(member.skills?.linesOfBusiness, 'LOBs')}
                    </TableCell>
                    <TableCell className="text-xs max-w-[150px] truncate" title={renderSkillList(member.skills?.branches, 'Branches')}>
                      {renderSkillList(member.skills?.branches, 'Branches')}
                    </TableCell>
                    <TableCell className="text-xs max-w-[150px] truncate" title={renderSkillList(member.skills?.brokerCodes, 'Broker Codes')}>
                      {renderSkillList(member.skills?.brokerCodes, 'Broker Codes')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleEditSkills(member)}>
                        <Edit3 className="mr-2 h-3.5 w-3.5" /> Edit Skills
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {editingProfile && (
        <EditSkillsDialog
          isOpen={isSkillsDialogOpen}
          onOpenChange={setIsSkillsDialogOpen}
          userProfileToEdit={editingProfile}
          onSave={handleSaveSkills}
          allCaseTypes={AllCaseTypes}
          allLinesOfBusiness={mockLinesOfBusiness}
          allBranches={mockBranches}
          allBrokerCodes={mockBrokerCodes}
        />
      )}
    </div>
  );
}

