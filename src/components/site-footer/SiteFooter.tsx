
import React from 'react';
import { useBasicSettings, useSiteIdentity } from '@/hooks/use-settings';
import { Logo } from '@/components/ui/logo';

export function SiteFooter() {
  const { data: basicSettings } = useBasicSettings();
  const { data: siteIdentity } = useSiteIdentity();

  const currentYear = new Date().getFullYear();
  const footerCopyright = basicSettings?.data?.site_footer_copyright || `جميع الحقوق محفوظة © ${currentYear}`;
  const siteTagline = basicSettings?.data?.site_tag_line || 'إعلانات مبوبة';

  return (
    <footer className="bg-gray-900 text-white py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Site Info */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <Logo variant="light" />
            </div>
            <p className="text-gray-300 mb-4">
              {siteTagline}
            </p>
            <div className="text-sm text-gray-400">
              {footerCopyright}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">روابط سريعة</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/" className="hover:text-white transition-colors">الرئيسية</a></li>
              <li><a href="/categories" className="hover:text-white transition-colors">التصنيفات</a></li>
              <li><a href="/add-ad" className="hover:text-white transition-colors">أضف إعلان</a></li>
              <li><a href="/search" className="hover:text-white transition-colors">البحث</a></li>
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">الحساب</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/auth/login" className="hover:text-white transition-colors">تسجيل الدخول</a></li>
              <li><a href="/auth/register" className="hover:text-white transition-colors">إنشاء حساب</a></li>
              <li><a href="/dashboard" className="hover:text-white transition-colors">لوحة التحكم</a></li>
              <li><a href="/favorites" className="hover:text-white transition-colors">المفضلة</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p className="text-sm">
            تم تطوير الموقع باستخدام أحدث التقنيات لضمان أفضل تجربة مستخدم
          </p>
        </div>
      </div>
    </footer>
  );
}
