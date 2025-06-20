
'use client';

import { useState, useEffect } from 'react';
import type { UserProfile } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { UserCircle2, Save } from 'lucide-react'; // Changed Edit3 to Save
import { useRouter } from 'next/navigation'; // Import useRouter

interface ProfilePageClientProps {
  profiles: UserProfile[];
  initialProfile: UserProfile | null;
}

const LOCAL_STORAGE_PROFILE_KEY = 'selectedUserProfileId';

export function ProfilePageClient({ profiles, initialProfile }: ProfilePageClientProps) {
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter(); // Initialize router

  useEffect(() => {
    setIsMounted(true);
    let profileToSet = initialProfile;

    const storedProfileId = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
    if (storedProfileId) {
      const foundProfile = profiles.find(p => p.id === storedProfileId);
      if (foundProfile) {
        profileToSet = foundProfile;
      }
    }
    
    if (!profileToSet && profiles.length > 0) {
        profileToSet = profiles[0];
    }
    setSelectedProfile(profileToSet);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profiles]); 

  const handleProfileChange = (profileId: string) => {
    const newProfile = profiles.find(p => p.id === profileId);
    if (newProfile) {
      setSelectedProfile(newProfile);
      localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, newProfile.id);
    }
  };

  const handleSaveProfile = () => {
    // The profile selection is already saved to localStorage by the Select's onValueChange.
    // Navigating to the home page will trigger other components (like the sidebar)
    // to re-evaluate based on the localStorage value.
    if (selectedProfile) {
        // Explicitly set it again just to be absolutely sure, though Select's onChange should handle it.
        localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, selectedProfile.id);
    }
    router.push('/'); 
  };

  if (!isMounted || !selectedProfile) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>Loading profile information...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="h-20 w-20 mx-auto bg-muted rounded-full mb-4"></div>
              <div className="h-8 bg-muted rounded w-3/4 mx-auto"></div>
              <div className="h-6 bg-muted rounded w-1/2 mx-auto"></div>
              <div className="h-10 bg-muted rounded w-full mt-6"></div>
              <div className="h-10 bg-muted rounded w-full"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <UserCircle2 className="h-20 w-20 mx-auto text-primary mb-4" />
          <CardTitle className="text-2xl font-bold">{selectedProfile.name}</CardTitle>
          <CardDescription className="text-lg capitalize">{selectedProfile.role}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="profile-select" className="text-sm font-medium">Switch Profile</Label>
            <Select value={selectedProfile.id} onValueChange={handleProfileChange}>
              <SelectTrigger id="profile-select" className="w-full mt-1">
                <SelectValue placeholder="Select a profile" />
              </SelectTrigger>
              <SelectContent>
                {profiles.map(profile => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.name} ({profile.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full" onClick={handleSaveProfile}>
            <Save className="mr-2 h-4 w-4" /> Save Profile
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
