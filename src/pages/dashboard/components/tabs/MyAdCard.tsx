// src/components/dashboard/MyAdCard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Listing } from '@/types';
import { Eye, Edit, Trash2, TrendingUp, Calendar, MapPin, RefreshCw, ImageIcon, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const getAdImage = (listing: Listing): string | null => {
  if (listing.main_image_url) return listing.main_image_url;
  if (listing.image && typeof listing.image === 'object' && 'image_url' in listing.image) return (listing.image as any).image_url;
  if (typeof listing.image === 'string' && listing.image) return listing.image;
  if (listing.images && Array.isArray(listing.images) && listing.images.length > 0) {
    const firstImage = listing.images[0];
    if (firstImage) {
      if (typeof firstImage === 'object') return (firstImage as any).url || (firstImage as any).image_url;
      if (typeof firstImage === 'string') return firstImage;
    }
  }
  return null;
};

const StatusIndicator = ({ status }: { status: string | number }) => {
  const statusConfig = {
    '1': { color: 'bg-green-500', label: 'نشط' },
    'active': { color: 'bg-green-500', label: 'نشط' },
    '0': { color: 'bg-yellow-500', label: 'في الانتظار' },
    'pending': { color: 'bg-yellow-500', label: 'في الانتظار' },
    'rejected': { color: 'bg-red-500', label: 'مرفوض' },
    'expired': { color: 'bg-gray-400', label: 'منتهي الصلاحية' },
  };

  const config = (statusConfig as any)[status] || { color: 'bg-gray-400', label: status };

  return (
    <div className="flex items-center gap-2" title={`الحالة: ${config.label}`}>
      <span className={cn('block h-2.5 w-2.5 rounded-full', config.color)}></span>
      <span className="text-xs font-medium text-muted-foreground">{config.label}</span>
    </div>
  );
};

interface MyAdCardProps {
  listing: Listing;
  onPromote: (id: number) => void;
  onDelete: (id: number) => void;
  onRefresh: (id: number) => void;
}

export function MyAdCard({ listing, onPromote, onDelete, onRefresh }: MyAdCardProps) {
  const navigate = useNavigate();
  const imageUrl = getAdImage(listing);
  const timeAgo = formatDistanceToNow(new Date(listing.created_at), { addSuffix: true, locale: ar });

  return (
    <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-xl">
      <div className="flex h-40">
        <div className="relative w-32 flex-shrink-0 sm:w-40 overflow-hidden">
          <div
            className="absolute top-2 right-2 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white transition-transform hover:scale-110"
            title="عرض تفاصيل الإعلان"
            onClick={() => navigate(`/ad/${listing.id}`)}
          >
            <ExternalLink className="h-4 w-4" />
          </div>
          {imageUrl ? (
            <img src={imageUrl} alt={listing.title} className="h-full w-full object-cover object-center" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
              <ImageIcon className="h-10 w-10" />
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-between overflow-hidden p-3 sm:p-4">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3
                className="flex-1 cursor-pointer truncate text-base font-bold sm:text-lg"
                title={listing.title}
                onClick={() => navigate(`/ad/${listing.id}`)}
              >
                {listing.title}
              </h3>
              {listing.price && Number(listing.price) > 0 && (
                <span className="shrink-0 text-base font-bold text-brand sm:text-lg">
                  {Number(listing.price).toLocaleString()} ل.س
                </span>
              )}
            </div>
            <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{listing.description}</p>
            <div className="mt-2.5">
              <StatusIndicator status={listing.status} />
            </div>
          </div>
          <div className="flex flex-col items-stretch gap-y-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{timeAgo}</span>
              <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{listing.views_count || 0}</span>
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{listing.city_name || 'غير محدد'}</span>
            </div>
            <div className="flex gap-1 self-end sm:self-auto">
              {/* <Button size="sm" variant="outline" onClick={() => onPromote(listing.id)} title="ترويج">
                <TrendingUp className="h-4 w-4" />
              </Button> */}
              {/* <Button size="sm" variant="outline" onClick={() => onRefresh(listing.id)} title="تحديث">
                <RefreshCw className="h-4 w-4" />
              </Button> */}
              <Button size="sm" variant="outline" onClick={() => navigate(`/edit-ad/${listing.id}`)} title="تعديل">
                <Edit className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="destructive" onClick={() => onDelete(listing.id)} title="حذف">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}