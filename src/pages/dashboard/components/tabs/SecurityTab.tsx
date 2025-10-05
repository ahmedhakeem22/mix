import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Key, Loader2, Trash } from 'lucide-react';
import { useChangePassword, useDeleteAccount } from '@/hooks/use-settings-api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function SecurityTab() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const changePasswordMutation = useChangePassword();
  const deleteAccountMutation = useDeleteAccount();

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
        // toast is handled by the hook, but we can add specific client-side validation
        alert('كلمة المرور الجديدة وتأكيدها غير متطابقين');
        return;
    }
    changePasswordMutation.mutate(
      { current_password: currentPassword, password: newPassword, password_confirmation: confirmPassword },
      {
        onSuccess: () => {
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }
      }
    );
  };
  
  const handleDeleteAccount = () => {
    // The backend expects reason and description, for now we send a generic one.
    // In a real app, you would have a form for this in the dialog.
    deleteAccountMutation.mutate({ reason: 'User requested deletion from profile page' });
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>تغيير كلمة المرور</CardTitle>
          <CardDescription>
            قم بتغيير كلمة المرور الخاصة بك بشكل دوري للحفاظ على أمان حسابك
          </CardDescription>
        </CardHeader>
        <form onSubmit={handlePasswordSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">كلمة المرور الحالية</Label>
              <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="أدخل كلمة المرور الحالية" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
              <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="أدخل كلمة المرور الجديدة" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">تأكيد كلمة المرور</Label>
              <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="أعد إدخال كلمة المرور الجديدة" required />
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-4">
                <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 ml-2 flex-shrink-0" />
                    <div className="text-sm text-yellow-700">
                        <p className="font-semibold">نصائح لكلمة مرور قوية:</p>
                        <ul className="list-disc pr-5 mt-1 space-y-1">
                            <li>استخدم 8 أحرف على الأقل</li>
                            <li>استخدم مزيجًا من الأحرف الكبيرة والصغيرة والأرقام والرموز</li>
                        </ul>
                    </div>
                </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="ml-auto" disabled={changePasswordMutation.isPending}>
              {changePasswordMutation.isPending ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Key className="ml-2 h-4 w-4" />}
              {changePasswordMutation.isPending ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card className="mt-6 border-red-500">
        <CardHeader>
          <CardTitle className="text-red-600">إلغاء الحساب</CardTitle>
          <CardDescription>
            إذا قمت بإلغاء حسابك، سيتم حذف جميع بياناتك وإعلاناتك بشكل نهائي.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <p className="text-red-700 font-medium mb-2">تحذير: هذا الإجراء لا يمكن التراجع عنه.</p>
            <p className="text-sm text-red-600">
              سيؤدي طلب حذف حسابك إلى حذفه نهائيا بعد المراجعة.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={deleteAccountMutation.isPending}>
                  {deleteAccountMutation.isPending ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Trash className="ml-2 h-4 w-4" />}
                  طلب حذف الحساب
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>هل أنت متأكد تماماً؟</AlertDialogTitle>
                <AlertDialogDescription>
                  هذا الإجراء لا يمكن التراجع عنه. سيتم تقديم طلب لحذف حسابك بشكل دائم وسيتم إزالة جميع بياناتك من خوادمنا.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">
                  نعم، قم بحذف حسابي
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </>
  );
}