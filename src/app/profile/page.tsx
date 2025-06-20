
import { ProfilePageClient } from '@/components/profile/ProfilePageClient';
import { getAllUserProfiles } from '@/lib/mockData';
import type { UserProfile } from '@/types';

export default async function ProfilePage() {
  // In a real app, you might fetch available profiles or the current user's profile here
  // For this mock, we'll pass all profiles to the client component.
  const allProfiles: UserProfile[] = getAllUserProfiles();
  
  // Determine an initial selected profile (e.g., the first one, or a specific default)
  const initialSelectedProfile = allProfiles.length > 0 ? allProfiles[0] : null;

  return <ProfilePageClient profiles={allProfiles} initialProfile={initialSelectedProfile} />;
}
