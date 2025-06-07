import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, Activity } from "lucide-react";

export default function LoadingQuotePage() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8 animate-pulse">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Skeleton className="h-8 w-40 mb-2" /> {/* Back button */}
          <Skeleton className="h-10 w-64 mb-1" /> {/* Title */}
          <Skeleton className="h-5 w-80" /> {/* Subtitle */}
        </div>
        <Skeleton className="h-10 w-32" /> {/* AI Monitor Button */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column / Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <CardSkeleton height="h-48" /> {/* Recommended Actions */}
          <CardSkeleton height="h-72" /> {/* Guideline Status */}
        </div>

        {/* Right Column / Summaries */}
        <div className="lg:col-span-1 space-y-6">
          <CardSkeleton height="h-40" /> {/* Premium Summary */}
          <CardSkeleton height="h-36" /> {/* Capacity Check */}
          <CardSkeleton height="h-56" /> {/* Business Overview */}
        </div>
      </div>
    </div>
  );
}

function CardSkeleton({ height = "h-32" }: { height?: string }) {
  return (
    <div className={`rounded-lg border bg-card p-6 shadow-sm ${height}`}>
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="h-6 w-1/2" /> {/* Card Title */}
        <Skeleton className="h-5 w-5 rounded-full" /> {/* Icon */}
      </div>
      <Skeleton className="h-4 w-3/4 mb-4" /> {/* Card Description */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}
