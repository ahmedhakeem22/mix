// src/components/ui/logo.tsx
import React from 'react';
import { useSiteIdentity, useBasicSettings } from '@/hooks/use-settings';
interface LogoProps {
  variant?: 'dark' | 'light'; // لم نعد بحاجة لـ size إذا كان ثابتًا
}

// الأبعاد الثابتة المختارة (مثال)
const FIXED_LOGO_WIDTH = 90; // بكسل
const FIXED_LOGO_HEIGHT = 36; // بكسل

export function Logo({
  variant = 'dark'
}: LogoProps) {
  const {
    data: siteIdentity
  } = useSiteIdentity();
  const {
    data: basicSettings
  } = useBasicSettings();
  const logoUrl = variant === 'light' && siteIdentity?.data?.site_white_logo ? siteIdentity.data.site_white_logo : siteIdentity?.data?.site_logo;
  const siteTitle = basicSettings?.data?.site_title || ' ';
  return <div className="flex items-center">
      {logoUrl ? <img src={logoUrl} alt={siteTitle} className="mr-2" // لا حاجة لـ sizeClass
    width={FIXED_LOGO_WIDTH} // مهم لمنع layout shift
    height={FIXED_LOGO_HEIGHT} // مهم لمنع layout shift
    style={{
      maxWidth: '100%',
      height: 'auto'
    }} // للاستجابة إذا كانت الحاوية أضيق
    onError={e => {
      (e.target as HTMLImageElement).style.display = 'none';
    }} /> : <div style={{
      width: `${FIXED_LOGO_WIDTH}px`,
      height: `${FIXED_LOGO_HEIGHT}px`
    }} className="mr-2 rounded flex items-center justify-center text-white font-bold bg-transparent">
          {siteTitle.charAt(0)}
        </div>}
      {/* يمكن تبسيط حجم الخط لاسم الموقع إذا كان حجم الشعار ثابتًا */}
      <span className={`font-bold text-xl text-brand`}> 
        {siteTitle}
      </span>
    </div>;
}
