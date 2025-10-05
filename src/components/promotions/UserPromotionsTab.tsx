
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, CreditCard } from 'lucide-react';
import { useUserPromotions } from '@/hooks/use-promotions';

export function UserPromotionsTab() {
  const { data: promotionsResponse, isLoading } = useUserPromotions();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  // Handle paginated response
  const promotionsList = promotionsResponse?.data || [];

  if (!promotionsList || promotionsList.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ترقيات الإعلانات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">لا توجد ترقيات</h3>
            <p className="text-muted-foreground">لم تقم بترقية أي إعلان بعد</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>ترقيات الإعلانات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {promotionsList.map((promotion: any) => (
              <Card key={promotion.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h4 className="font-semibold">{promotion.listing?.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      باقة: {promotion.package?.name}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {promotion.starts_at ? 
                            new Date(promotion.starts_at).toLocaleDateString('ar-SA') : 
                            'في الانتظار'
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          {promotion.expires_at ? 
                            new Date(promotion.expires_at).toLocaleDateString('ar-SA') : 
                            'غير محدد'
                          }
                        </span>
                      </div>
                    </div>
                    {promotion.bank_transfer_proof_url && (
                      <div className="text-xs text-muted-foreground">
                        طريقة الدفع: {promotion.payment_method === 'bank_transfer' ? 'تحويل بنكي' : promotion.payment_method}
                      </div>
                    )}
                  </div>
                  <div className="text-left space-y-2">
                    <Badge 
                      variant={promotion.payment_status === 'paid' ? 'default' : 
                               promotion.payment_status === 'pending' ? 'secondary' : 'destructive'}
                    >
                      {promotion.payment_status === 'paid' ? 'مدفوع' : 
                       promotion.payment_status === 'pending' ? 'في الانتظار' : 'فشل'}
                    </Badge>
                    <p className="text-sm font-medium">
                      {promotion.amount_paid} SYP
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
