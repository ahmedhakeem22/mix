
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adId: string;
  onConfirm: () => void;
}

export function DeleteConfirmDialog({ 
  open, 
  onOpenChange, 
  adId, 
  onConfirm 
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            تأكيد حذف الإعلان
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-muted-foreground">
            هل أنت متأكد من رغبتك في حذف هذا الإعلان؟ هذا الإجراء لا يمكن التراجع عنه.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            حذف الإعلان
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
