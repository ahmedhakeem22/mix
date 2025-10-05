
import React, { useState } from 'react';
import { usePromotionPackages, usePromoteWithBankTransfer, usePromoteWithStripe } from '@/hooks/use-promotions';
import { usePromoteListing } from '@/hooks/use-promotions';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PromoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adId: number | null;
}

export function PromoteDialog({ open, onOpenChange, adId }: PromoteDialogProps) {
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'stripe'>('bank_transfer');
  const [bankTransferProof, setBankTransferProof] = useState<File | null>(null);

  const { toast } = useToast();
  
  const { data: promotionPackagesResponse, isLoading: packagesLoading } = usePromotionPackages();
  
  // Handle API response properly
  const promotionPackages = React.useMemo(() => {
    if (!promotionPackagesResponse) return [];
    
    // Handle direct array response
    if (Array.isArray(promotionPackagesResponse)) {
      return promotionPackagesResponse;
    }
    
    // Handle object response with data property
    if (promotionPackagesResponse && typeof promotionPackagesResponse === 'object' && 'data' in promotionPackagesResponse) {
      const responseData = (promotionPackagesResponse as any).data;
      return Array.isArray(responseData) ? responseData : [];
    }
    
    return [];
  }, [promotionPackagesResponse]);

  const promoteWithBankTransferMutation = usePromoteWithBankTransfer();
  const promoteWithStripeMutation = usePromoteWithStripe();

  const handleSubmit = async () => {
    if (!adId || !selectedPackage) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار باقة الترقية",
        variant: "destructive"
      });
      return;
    }

    try {
      if (paymentMethod === 'bank_transfer') {
        if (!bankTransferProof) {
          toast({
            title: "خطأ",
            description: "يرجى رفع إثبات التحويل البنكي",
            variant: "destructive"
          });
          return;
        }

        await promoteWithBankTransferMutation.mutateAsync({
          listingId: adId,
          data: {
            promotion_package_id: selectedPackage,
            bank_transfer_proof: bankTransferProof,
            payment_method: 'bank_transfer'
          }
        });

        toast({
          title: "تم الإرسال بنجاح",
          description: "سيتم مراجعة طلب الترقية وتفعيلها خلال 24 ساعة"
        });
      } else if (paymentMethod === 'stripe') {
        await promoteWithStripeMutation.mutateAsync({
          listingId: adId,
          data: {
            promotion_package_id: selectedPackage,
            payment_method: 'stripe'
          }
        });

        toast({
          title: "تم بنجاح",
          description: "تم ترقية الإعلان بنجاح"
        });
      }

      onOpenChange(false);
      setSelectedPackage(null);
      setBankTransferProof(null);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء ترقية الإعلان",
        variant: "destructive"
      });
    }
  };

  const selectedPackageData = promotionPackages.find(pkg => pkg.id === selectedPackage);

  if (packagesLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <div className="flex items-center justify-center p-8">
            <div className="animate-pulse text-center">
              <div className="h-4 bg-muted rounded w-32 mx-auto mb-2"></div>
              <div className="h-3 bg-muted rounded w-24 mx-auto"></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} >
      <DialogContent className="w-[95%] rounded-lg sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-neutral-50 dark:bg-neutral-800">
        <DialogHeader>
          <DialogTitle>ترقية الإعلان</DialogTitle>
          <DialogDescription>
            اختر باقة الترقية المناسبة لإعلانك لزيادة الوصول والمشاهدات
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Package Selection */}
          <div className="space-y-3">
            <Label>اختر باقة الترقية</Label>
            <div className="grid gap-3">
              {promotionPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedPackage === pkg.id
                      ? 'border-brand bg-brand/5'
                      : 'border-border hover:border-brand/50'
                  }`}
                  onClick={() => setSelectedPackage(pkg.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{pkg.name}</h3>
                    <span className="text-lg font-bold text-brand">
                      {pkg.price} SYP
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {pkg.description}
                  </p>
                  <div className="text-sm text-muted-foreground">
                    المدة: {pkg.duration_days} يوم
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          {selectedPackage && (
            <Tabs value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
              <div className="space-y-3">
                <Label>طريقة الدفع</Label>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="bank_transfer">تحويل بنكي</TabsTrigger>
                  <TabsTrigger value="stripe">بطاقة ائتمان</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="bank_transfer" className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">معلومات التحويل البنكي</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>اسم البنك:</strong> البنك الأهلي السعودي</p>
                    <p><strong>رقم الحساب:</strong> 123456789</p>
                    <p><strong>اسم المستفيد:</strong> واحة السوق العربي</p>
                    <p><strong>المبلغ:</strong> {selectedPackageData?.price} SYP</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bank-proof">رفع إثبات التحويل البنكي</Label>
                  <Input
                    id="bank-proof"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setBankTransferProof(e.target.files?.[0] || null)}
                  />
                </div>
              </TabsContent>

              <TabsContent value="stripe" className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm">
                    سيتم توجيهك إلى صفحة دفع آمنة لإتمام عملية الترقية باستخدام بطاقة الائتمان
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!selectedPackage || promoteWithBankTransferMutation.isPending || promoteWithStripeMutation.isPending}
          >
            {promoteWithBankTransferMutation.isPending || promoteWithStripeMutation.isPending ? "جاري الترقية..." : "ترقية الإعلان"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
