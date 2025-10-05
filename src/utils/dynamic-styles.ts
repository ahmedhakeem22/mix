
// أداة مساعدة لتطبيق الأنماط الديناميكية بشكل احترافي
export const applyDynamicStyles = (colors: any, mode: string = 'light') => {
  if (!colors) return;
  
  const styleId = 'dynamic-api-styles';
  let styleElement = document.getElementById(styleId) as HTMLStyleElement;
  
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = styleId;
    document.head.appendChild(styleElement);
  }
  
  let css = '';
  const isDarkMode = mode === 'dark';  
  // ألوان العلامة التجارية الأساسية
  const primaryColor = isDarkMode && colors.dark_site_main_color_one 
    ? colors.dark_site_main_color_one 
    : colors.site_main_color_one;
    
  const secondaryColor = isDarkMode && colors.dark_site_main_color_two 
    ? colors.dark_site_main_color_two 
    : colors.site_main_color_two;
    
  const tertiaryColor = isDarkMode && colors.dark_site_main_color_three 
    ? colors.dark_site_main_color_three 
    : colors.site_main_color_three;

  // ألوان النصوص
  const headingColor = isDarkMode && colors.dark_heading_color 
    ? colors.dark_heading_color 
    : colors.heading_color;
    
  const lightColor = isDarkMode && colors.dark_light_color 
    ? colors.dark_light_color 
    : colors.light_color;
    
  const extraLightColor = isDarkMode && colors.dark_extra_light_color 
    ? colors.dark_extra_light_color 
    : colors.extra_light_color;

  // تطبيق ألوان العلامة التجارية
  if (primaryColor) {
    css += `
      /* ========== ألوان العلامة التجارية الأساسية ========== */
      
      .bg-primary,
      .bg-brand,
      button:not(.bg-secondary):not(.bg-destructive):not(.bg-outline):not(.bg-ghost):not(.bg-link),
      .btn-primary,
      .bg-\\[var\\(--site-main-color-one\\)\\],
      \\[data-primary="true"\\],
      .primary-bg {
        background-color: ${primaryColor} !important;
        color: white !important;
      }
      
      .text-primary,
      .text-brand,
      .primary-text,
      a:not(.btn):hover,
      .link-primary {
        color: ${primaryColor} !important;
      }
      
      .border-primary,
      .border-brand,
      .primary-border {
        border-color: ${primaryColor} !important;
      }
    `;
    
    if (secondaryColor) {
      css += `
        .bg-primary:hover,
        .bg-brand:hover,
        button:not(.bg-secondary):not(.bg-destructive):not(.bg-outline):not(.bg-ghost):not(.bg-link):hover,
        .btn-primary:hover {
          background-color: ${secondaryColor} !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
      `;
    }
  }
  
  if (secondaryColor) {
    css += `
      .bg-secondary-brand,
      .featured-bg,
      .highlight-bg,
      .accent-bg {
        background-color: ${secondaryColor} !important;
        color: white !important;
      }
      
      .text-secondary-brand,
      .featured-text,
      .highlight-text {
        color: ${secondaryColor} !important;
      }
    `;
  }
  
  if (tertiaryColor) {
    css += `
      .bg-tertiary-brand,
      .warning-bg,
      .alert-bg {
        background-color: ${tertiaryColor} !important;
        color: ${isDarkMode ? 'white' : '#333'} !important;
      }
      
      .text-tertiary-brand,
      .warning-text,
      .alert-text {
        color: ${tertiaryColor} !important;
      }
    `;
  }
  
  // تطبيق ألوان النصوص
  if (headingColor) {
    css += `
      /* ========== ألوان النصوص والعناوين ========== */
      
      h1, h2, h3, h4, h5, h6,
      .heading,
      .title,
      .site-heading,
      .page-title,
      .section-title,
      .card-title {
        color: ${headingColor} !important;
      }
    `;
  }
  
  if (lightColor) {
    css += `
      .text-muted,
      .text-secondary,
      .description,
      .subtitle,
      .light-text,
      .secondary-text,
      p.text-gray-600,
      .text-gray-600,
      .text-gray-500 {
        color: ${lightColor} !important;
      }
    `;
  }
  
  if (extraLightColor) {
    css += `
      .placeholder,
      .text-placeholder,
      .extra-light-text,
      .hint-text,
      .text-gray-400,
      .text-gray-300,
      ::placeholder {
        color: ${extraLightColor} !important;
      }
    `;
  }
  
  // إضافة عناصر تفاعلية إضافية
  if (primaryColor) {
    css += `
      /* ========== عناصر الواجهة المخصصة ========== */
      
      .featured-card,
      .highlighted-card {
        border-left: 4px solid ${primaryColor} !important;
        background: linear-gradient(45deg, ${primaryColor}08, transparent) !important;
      }
      
      .progress-bar,
      .loading-bar {
        background-color: ${primaryColor} !important;
      }
      
      .nav-link.active,
      .menu-item.active,
      .tab.active,
      \\[data-state="active"\\],
      \\[aria-selected="true"\\] {
        background-color: ${primaryColor} !important;
        color: white !important;
      }
      
      .btn-default,
      \\[class*="buttonVariants"\\] {
        background-color: ${primaryColor} !important;
        color: white !important;
      }
      
      input:focus,
      textarea:focus,
      select:focus {
        border-color: ${primaryColor} !important;
        box-shadow: 0 0 0 2px ${primaryColor}20 !important;
      }
      
      .selected,
      .checked,
      \\[data-checked="true"\\] {
        background-color: ${primaryColor} !important;
        color: white !important;
      }
    `;
  }
  
  css += `
    /* ========== متغيرات CSS المحدثة ========== */
    :root {
      ${headingColor ? `--site-heading: ${headingColor};` : ''}
      ${lightColor ? `--site-light: ${lightColor};` : ''}
      ${extraLightColor ? `--site-extra-light: ${extraLightColor};` : ''}
      ${primaryColor ? `--site-primary: ${primaryColor};` : ''}
      ${secondaryColor ? `--site-secondary: ${secondaryColor};` : ''}
      ${tertiaryColor ? `--site-tertiary: ${tertiaryColor};` : ''}
    }
  `;
  
  // تحديث متغيرات shadcn
  if (primaryColor) {
    css += `
      :root {
        --primary: ${convertToHsl(primaryColor)};
        --primary-foreground: 0 0% ${isDarkMode ? '100' : '0'}%;
        ${secondaryColor ? `--secondary: ${convertToHsl(secondaryColor)};` : ''}
        ${tertiaryColor ? `--accent: ${convertToHsl(tertiaryColor)};` : ''}
      }
    `;
  }
  
 console.log(`🎨 تم تحديث الألوان بنجاح للوضع ${isDarkMode ? 'الداكن' : 'الفاتح'}.`);
};

let colorSettingsData: any = null;
// متغير لتخزين مرجع للمستمع (listener) لإزالته عند الحاجة
let mediaQueryListener: ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | null = null;
export const setupDynamicStyles = async () => {
  try {
    // 1. جلب البيانات فقط إذا لم تكن موجودة بالفعل
    if (!colorSettingsData) {
      const { settingsAPI } = await import('@/services/settings-api');
      const response = await settingsAPI.getColorSettings();
      if (response?.data) {
        colorSettingsData = response.data;
      } else {
        console.error('❌ لم يتم العثور على بيانات الألوان، سيتم استخدام الأنماط الافتراضية.');
        return; // الخروج من الدالة إذا لم توجد بيانات
      }
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // 2. دالة معالجة التغيير
    const handleThemeChange = (event: MediaQueryListEvent) => {
      const newMode = event.matches ? 'dark' : 'light';
      console.log(`🎨 تم اكتشاف تغيير في المظهر. التطبيق على الوضع: ${newMode}`);
      applyDynamicStyles(colorSettingsData, newMode);
    };

    // 3. تطبيق الأنماط لأول مرة عند التحميل
    const initialMode = mediaQuery.matches ? 'dark' : 'light';
    applyDynamicStyles(colorSettingsData, initialMode);

    // 4. إزالة المستمع القديم (إذا كان موجودًا) لتجنب التكرار
    if (mediaQueryListener) {
      mediaQuery.removeEventListener('change', mediaQueryListener);
    }

    // 5. إضافة المستمع الجديد
    mediaQuery.addEventListener('change', handleThemeChange);
    mediaQueryListener = handleThemeChange; // حفظ مرجع للمستمع الجديد


  } catch (error) {
    console.error('❌ فشل في إعداد الأنماط الديناميكية:', error);
  }
};

// دالة مساعدة لتحويل hex إلى hsl
function convertToHsl(hex: string): string {
  if (!hex) return '0 0% 50%';
  
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0 0% 50%';
  
  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

// تطبيق الأنماط عند تحميل الصفحة
export const initializeDynamicStyles = async () => {
  try {
    const { settingsAPI } = await import('@/services/settings-api');
    const colorSettings = await settingsAPI.getColorSettings();
    
    if (colorSettings?.data) {
      // تحديد الوضع الحالي
      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyDynamicStyles(colorSettings.data, isDarkMode ? 'dark' : 'light');
    }
  } catch (error) {
    console.error('❌ فشل في تهيئة الألوان الديناميكية:', error);
  }
};
