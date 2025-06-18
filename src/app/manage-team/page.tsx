
import { ManageTeamPageClient } from '@/components/manage-team/ManageTeamPageClient';

export default function ManageTeamPage() {
  // The ManageTeamPageClient will handle fetching user profiles from localStorage
  // and determining if the current user is a manager and which team members to display.
  return <ManageTeamPageClient />;
}
