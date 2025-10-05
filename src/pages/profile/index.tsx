
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useCurrentUser } from '@/hooks/use-api';
import { profileAPI } from '@/services/apis';
import { useToast } from '@/hooks/use-toast';

const profileSchema = z.object({
  first_name: z.string().min(2, 'الاسم الأول مطلوب'),
  last_name: z.string().min(2, 'اسم العائلة مطلوب'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  phone: z.string().min(10, 'رقم الهاتف مطلوب'),
  bio: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { data: user, refetch } = useCurrentUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      
      // Append all form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      // Append avatar if selected
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      await profileAPI.updateProfile(formData);
      await refetch();
      
      toast({
        title: 'تم التحديث بنجاح',
        description: 'تم حفظ بياناتك الشخصية',
      });
    } catch (error) {
      toast({
        title: 'خطأ في التحديث',
        description: 'حدث خطأ أثناء حفظ البيانات',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>الملف الشخصي</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage 
                  src={avatarFile ? URL.createObjectURL(avatarFile) : user?.avatar} 
                  alt={user?.first_name} 
                />
                <AvatarFallback>
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <Label htmlFor="avatar">صورة الملف الشخصي</Label>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">الاسم الأول</Label>
                <Input
                  id="first_name"
                  {...register('first_name')}
                  error={errors.first_name?.message}
                />
              </div>
              <div>
                <Label htmlFor="last_name">اسم العائلة</Label>
                <Input
                  id="last_name"
                  {...register('last_name')}
                  error={errors.last_name?.message}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                error={errors.email?.message}
              />
            </div>

            <div>
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input
                id="phone"
                {...register('phone')}
                error={errors.phone?.message}
              />
            </div>

            <div>
              <Label htmlFor="bio">نبذة شخصية</Label>
              <Textarea
                id="bio"
                {...register('bio')}
                rows={4}
                placeholder="اكتب نبذة عن نفسك..."
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
