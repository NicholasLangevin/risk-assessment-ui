
'use client';

import { useState, useEffect } from 'react';
import type { UserProfile } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { UserCircle2, Edit3 } from 'lucide-react'; // Using UserCircle2 for better visual

interface ProfilePageClientProps {
  profiles: UserProfile[];
  initialProfile: UserProfile | null;
}

export function ProfilePageClient({ profiles, initialProfile }: ProfilePageClientProps) {
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(initialProfile);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // If no initial profile (e.g., profiles list was empty server-side, unlikely with mock)
    // or if the initialProfile is not in the list (also unlikely with mock),
    // default to the first available profile if any.
    if (!selectedProfile && profiles.length > 0) {
      setSelectedProfile(profiles[0]);
    }
  }, [profiles, selectedProfile]);

  const handleProfileChange = (profileId: string) => {
    const newProfile = profiles.find(p => p.id === profileId);
    if (newProfile) {
      setSelectedProfile(newProfile);
    }
  };

  if (!isMounted || !selectedProfile) {
    // Basic loading state or placeholder until client-side hydration completes
    // and selectedProfile is confirmed.
    return (
      <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>Loading profile information...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-6 bg-muted rounded w-1/2"></div>
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
          <Button className="w-full" variant="outline">
            <Edit3 className="mr-2 h-4 w-4" /> Edit Profile (Placeholder)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
