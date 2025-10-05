import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface AdFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}

export function AdFilters({
  searchQuery,
  setSearchQuery,
  selectedStatus,
  setSelectedStatus,
  sortBy,
  setSortBy,
}: AdFiltersProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      <div className="relative flex-1">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="البحث في إعلاناتي..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10"
        />
      </div>
      <div className="flex gap-2 flex-wrap">
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-full md:w-40"><SelectValue placeholder="الحالة" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            <SelectItem value="1">نشط</SelectItem>
            <SelectItem value="0">في الانتظar</SelectItem>
            <SelectItem value="rejected">مرفوض</SelectItem>
            <SelectItem value="expired">منتهي الصلاحية</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-40"><SelectValue placeholder="الترتيب" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">الأحدث</SelectItem>
            <SelectItem value="oldest">الأقدم</SelectItem>
            <SelectItem value="price_asc">السعر: من الأقل</SelectItem>
            <SelectItem value="price_desc">السعر: من الأعلى</SelectItem>
            <SelectItem value="popular">الأكثر مشاهدة</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}