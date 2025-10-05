import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsAPI } from '@/services/settings-api';
import { applyDynamicStyles } from '@/utils/dynamic-styles';

// Hook to fetch site identity
export const useSiteIdentity = () => {
  return useQuery({
    queryKey: ['site-identity'],
    queryFn: () => settingsAPI.getSiteIdentity(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: true, // تفعيل الاستعلام
  });
};

// Hook to fetch basic settings
export const useBasicSettings = () => {
  return useQuery({
    queryKey: ['basic-settings'],
    queryFn: () => settingsAPI.getBasicSettings(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: false,
  });
};

// Hook to fetch color settings
export const useColorSettings = () => {
  return useQuery({
    queryKey: ['color-settings'],
    queryFn: () => settingsAPI.getColorSettings(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: false,
  });
};

// Hook to fetch listing settings
export const useListingSettings = () => {
  return useQuery({
    queryKey: ['listing-settings'],
    queryFn: () => settingsAPI.getListingSettings(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: false,
  });
};
export const applyColorSettingsToDOM = (colors: any, mode: string = 'light') => {
  const root = document.documentElement;
  
  console.log(`🎨 تطبيق إعدادات الألوان من API للوضع ${mode === 'dark' ? 'الداكن' : 'الفاتح'}:`, colors);
  
  const isDarkMode = mode === 'dark';
  
  // تطبيق الألوان المخصصة من API على متغيرات CSS
  if (isDarkMode) {
    // في الوضع الداكن - استخدام ألوان الوضع الداكن إن وجدت
    if (colors.dark_site_main_color_one) {
      root.style.setProperty('--site-main-color-one', colors.dark_site_main_color_one);
      root.style.setProperty('--brand', colors.dark_site_main_color_one);
      root.style.setProperty('--primary', colors.dark_site_main_color_one);
      root.style.setProperty('--site-primary', colors.dark_site_main_color_one);
    }
    
    if (colors.dark_site_main_color_two) {
      root.style.setProperty('--site-main-color-two', colors.dark_site_main_color_two);
      root.style.setProperty('--brand-hover', colors.dark_site_main_color_two);
      root.style.setProperty('--site-secondary', colors.dark_site_main_color_two);
    }
    
    if (colors.dark_site_main_color_three) {
      root.style.setProperty('--site-main-color-three', colors.dark_site_main_color_three);
      root.style.setProperty('--site-tertiary', colors.dark_site_main_color_three);
    }
    
    if (colors.dark_heading_color) {
      root.style.setProperty('--heading-color', colors.dark_heading_color);
      root.style.setProperty('--site-heading', colors.dark_heading_color);
    }
    
    if (colors.dark_light_color) {
      root.style.setProperty('--light-color', colors.dark_light_color);
      root.style.setProperty('--site-light', colors.dark_light_color);
    }
    
    if (colors.dark_extra_light_color) {
      root.style.setProperty('--extra-light-color', colors.dark_extra_light_color);
      root.style.setProperty('--site-extra-light', colors.dark_extra_light_color);
    }
  } else {
    // في الوضع الفاتح - استخدام الألوان العادية
    if (colors.site_main_color_one) {
      root.style.setProperty('--site-main-color-one', colors.site_main_color_one);
      root.style.setProperty('--brand', colors.site_main_color_one);
      root.style.setProperty('--primary', colors.site_main_color_one);
      root.style.setProperty('--site-primary', colors.site_main_color_one);
    }
    
    if (colors.site_main_color_two) {
      root.style.setProperty('--site-main-color-two', colors.site_main_color_two);
      root.style.setProperty('--brand-hover', colors.site_main_color_two);
      root.style.setProperty('--site-secondary', colors.site_main_color_two);
    }
    
    if (colors.site_main_color_three) {
      root.style.setProperty('--site-main-color-three', colors.site_main_color_three);
      root.style.setProperty('--site-tertiary', colors.site_main_color_three);
    }
    
    if (colors.heading_color) {
      root.style.setProperty('--heading-color', colors.heading_color);
      root.style.setProperty('--site-heading', colors.heading_color);
    }
    
    if (colors.light_color) {
      root.style.setProperty('--light-color', colors.light_color);
      root.style.setProperty('--site-light', colors.light_color);
    }
    
    if (colors.extra_light_color) {
      root.style.setProperty('--extra-light-color', colors.extra_light_color);
      root.style.setProperty('--site-extra-light', colors.extra_light_color);
    }
  }
  
  applyDynamicStyles(colors, mode);
  
  applyColorsToExistingElements(colors, mode);  
};

// دالة لتطبيق الألوان على العناصر الموجودة فوراً
const applyColorsToExistingElements = (colors: any, mode: string = 'light') => {
  const isDarkMode = mode === 'dark';
  
  // تحديد اللون الأساسي المناسب
  const primaryColor = isDarkMode && colors.dark_site_main_color_one 
    ? colors.dark_site_main_color_one 
    : colors.site_main_color_one;
    
  const headingColor = isDarkMode && colors.dark_heading_color 
    ? colors.dark_heading_color 
    : colors.heading_color;
    
  const lightColor = isDarkMode && colors.dark_light_color 
    ? colors.dark_light_color 
    : colors.light_color;
  
  // تطبيق على الأزرار
  if (primaryColor) {
    const buttons = document.querySelectorAll('button:not(.bg-secondary):not(.bg-destructive):not(.bg-outline):not(.bg-ghost):not(.bg-link), .btn-primary');
    buttons.forEach((btn) => {
      if (btn instanceof HTMLElement) {
        btn.style.backgroundColor = primaryColor;
        btn.style.color = 'white';
      }
    });
  }
  
  // تطبيق على العناوين
  if (headingColor) {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6, .heading, .title');
    headings.forEach((heading) => {
      if (heading instanceof HTMLElement) {
        heading.style.color = headingColor;
      }
    });
  }
  
  // تطبيق على النصوص الثانوية
  if (lightColor) {
    const secondaryTexts = document.querySelectorAll('.text-muted, .text-secondary, .description, .subtitle');
    secondaryTexts.forEach((text) => {
      if (text instanceof HTMLElement) {
        text.style.color = lightColor;
      }
    });
  }
  
  // تطبيق على العناصر النشطة
  if (primaryColor) {
    const activeElements = document.querySelectorAll('.active, [data-state="active"], [aria-selected="true"]');
    activeElements.forEach((element) => {
      if (element instanceof HTMLElement) {
        element.style.backgroundColor = primaryColor;
        element.style.color = 'white';
      }
    });
  }
};

// Comprehensive hook for all settings
export const useAllSettings = () => {
  const siteIdentity = useSiteIdentity();
  const basicSettings = useBasicSettings();
  const colorSettings = useColorSettings();
  const listingSettings = useListingSettings();
  
  return {
    siteIdentity,
    basicSettings,
    colorSettings,
    listingSettings,
    isLoading: siteIdentity.isLoading || basicSettings.isLoading || colorSettings.isLoading || listingSettings.isLoading,
    isError: siteIdentity.isError || basicSettings.isError || colorSettings.isError || listingSettings.isError
  };
};
