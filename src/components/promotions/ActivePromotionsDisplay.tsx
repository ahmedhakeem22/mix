
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Zap, Star, TrendingUp } from 'lucide-react';

interface ActivePromotionsDisplayProps {
  listing: {
    featured?: boolean;
    promoted_until?: string;
    [key: string]: any;
  };
}

export function ActivePromotionsDisplay({ listing }: ActivePromotionsDisplayProps) {
  const now = new Date();
  const promotedUntil = listing.promoted_until ? new Date(listing.promoted_until) : null;
  const isPromoted = promotedUntil && promotedUntil > now;

  if (!listing.featured && !isPromoted) {
    return null;
  }

  return (
    <div className="flex gap-1 absolute top-2 left-2">
      {listing.featured && (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <Star className="h-3 w-3 ml-1" />
          مميز
        </Badge>
      )}
      {isPromoted && (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
          <Zap className="h-3 w-3 ml-1" />
          مُرقّى
        </Badge>
      )}
    </div>
  );
}
