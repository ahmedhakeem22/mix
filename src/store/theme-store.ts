
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { settingsAPI } from '@/services/settings-api';
import { applyDynamicStyles } from '@/utils/dynamic-styles';

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  border: string;
}

interface ApiColors {
  // ألوان الوضع الفاتح
  site_main_color_one?: string;
  site_main_color_two?: string;
  site_main_color_three?: string;
  heading_color?: string;
  light_color?: string;
  extra_light_color?: string;
  
  // ألوان الوضع الداكن
  dark_site_main_color_one?: string;
  dark_site_main_color_two?: string;
  dark_site_main_color_three?: string;
  dark_heading_color?: string;
  dark_light_color?: string;
  dark_extra_light_color?: string;
  dark_background_color?: string;
  dark_surface_color?: string;
  dark_text_color?: string;
  dark_border_color?: string;
}

interface ThemeState {
  mode: 'light' | 'dark' | 'system';
  colors: ThemeColors;
  apiColors: ApiColors;
  isLoading: boolean;
  setMode: (mode: 'light' | 'dark' | 'system') => void;
  setColors: (colors: Partial<ThemeColors>) => void;
  setApiColors: (colors: ApiColors) => void;
  loadThemeFromAPI: () => Promise<void>;
  applyTheme: () => void;
}

const defaultColors: ThemeColors = {
  primary: 'hsl(142 76% 36%)',
  secondary: 'hsl(210 40% 98%)',
  accent: 'hsl(210 40% 96%)',
  background: 'hsl(0 0% 100%)',
  surface: 'hsl(0 0% 100%)',
  text: 'hsl(222.2 84% 4.9%)',
  border: 'hsl(214.3 31.8% 91.4%)',
};

// ألوان افتراضية مخصصة للوضع الداكن
const defaultDarkColors: ThemeColors = {
  primary: 'hsl(160 84% 39%)',
  secondary: 'hsl(220 14% 11%)',
  accent: 'hsl(217 19% 15%)',
  background: 'hsl(224 20% 9%)',
  surface: 'hsl(217 19% 12%)',
  text: 'hsl(213 31% 91%)',
  border: 'hsl(217 10% 25%)',
};

// إعدادات افتراضية للألوان المخصصة في الوضع الداكن
const defaultDarkApiColors = {
  dark_site_main_color_one: '#10b981', // أخضر مائل للزرقة
  dark_site_main_color_two: '#059669', // أخضر أغمق
  dark_site_main_color_three: '#047857', // أخضر داكن
  dark_heading_color: '#f3f4f6', // رمادي فاتح للعناوين
  dark_light_color: '#9ca3af', // رمادي متوسط للنصوص الثانوية
  dark_extra_light_color: '#6b7280', // رمادي للنصوص الخفيفة
  dark_background_color: '#111827', // خلفية داكنة
  dark_surface_color: '#1f2937', // سطح داكن
  dark_text_color: '#f9fafb', // نص أبيض مائل للرمادي
  dark_border_color: '#374151', // حدود رمادية داكنة
};

// دالة مساعدة لتحويل hex إلى hsl
const hexToHsl = (hex: string): string => {
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
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'system',
      colors: defaultColors,
      apiColors: {},
      isLoading: false,

      setMode: (mode) => {
        set({ mode });
        setTimeout(() => {
          get().applyTheme();
        }, 50);
      },

      setColors: (newColors) => {
        set((state) => ({
          colors: { ...state.colors, ...newColors }
        }));
        get().applyTheme();
      },

      setApiColors: (apiColors) => {
        set({ apiColors });
        setTimeout(() => {
          get().applyTheme();
        }, 50);
      },

      loadThemeFromAPI: async () => {
        set({ isLoading: true });
        try {
          const colorSettings = await settingsAPI.getColorSettings();
          if (colorSettings?.data) {
            get().setApiColors(colorSettings.data);
          }
        } catch (error) {
          console.error('❌ فشل في تحميل الألوان من API:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      applyTheme: () => {
        const { mode, apiColors } = get();
        const root = document.documentElement;
        
        // تحديد الوضع الفعلي
        let actualMode = mode;
        if (mode === 'system') {
          actualMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }

        // تطبيق كلاس الوضع
        root.classList.remove('light', 'dark');
        root.classList.add(actualMode);

        // تحديد الألوان المناسبة للوضع
        let themeColors: ThemeColors;
        let finalApiColors: any = {};
        
        if (actualMode === 'dark') {
          // في الوضع الداكن - استخدام الألوان الافتراضية للوضع الداكن
          themeColors = defaultDarkColors;
          
          // دمج الألوان الافتراضية مع ألوان API للوضع الداكن
          finalApiColors = {
            ...defaultDarkApiColors,
            ...Object.fromEntries(
              Object.entries(apiColors).filter(([key]) => key.startsWith('dark_'))
            )
          };
          
        } else {
          // الوضع الفاتح - استخدام الألوان الافتراضية للوضع الفاتح
          themeColors = defaultColors;
          
          // استخدام ألوان API للوضع الفاتح فقط
          finalApiColors = Object.fromEntries(
            Object.entries(apiColors).filter(([key]) => !key.startsWith('dark_'))
          );
          
        }
        
        // تطبيق الألوان الأساسية
        root.style.setProperty('--background', themeColors.background.replace('hsl(', '').replace(')', ''));
        root.style.setProperty('--foreground', themeColors.text.replace('hsl(', '').replace(')', ''));
        root.style.setProperty('--card', themeColors.surface.replace('hsl(', '').replace(')', ''));
        root.style.setProperty('--card-foreground', themeColors.text.replace('hsl(', '').replace(')', ''));
        root.style.setProperty('--border', themeColors.border.replace('hsl(', '').replace(')', ''));
        root.style.setProperty('--muted', themeColors.secondary.replace('hsl(', '').replace(')', ''));
        root.style.setProperty('--accent', themeColors.accent.replace('hsl(', '').replace(')', ''));
        root.style.setProperty('--primary', themeColors.primary.replace('hsl(', '').replace(')', ''));

        // تطبيق ألوان العلامة التجارية
        if (actualMode === 'dark') {
          // في الوضع الداكن - استخدام الألوان المخصصة للوضع الداكن
          if (finalApiColors.dark_site_main_color_one) {
            root.style.setProperty('--site-main-color-one', finalApiColors.dark_site_main_color_one);
            root.style.setProperty('--brand', finalApiColors.dark_site_main_color_one);
            root.style.setProperty('--site-primary', finalApiColors.dark_site_main_color_one);
          }
          
          if (finalApiColors.dark_site_main_color_two) {
            root.style.setProperty('--site-main-color-two', finalApiColors.dark_site_main_color_two);
            root.style.setProperty('--brand-hover', finalApiColors.dark_site_main_color_two);
            root.style.setProperty('--site-secondary', finalApiColors.dark_site_main_color_two);
          }
          
          if (finalApiColors.dark_site_main_color_three) {
            root.style.setProperty('--site-main-color-three', finalApiColors.dark_site_main_color_three);
            root.style.setProperty('--site-tertiary', finalApiColors.dark_site_main_color_three);
          }
        } else {
          // في الوضع الفاتح - استخدام ألوان API للوضع الفاتح
          if (finalApiColors.site_main_color_one) {
            root.style.setProperty('--site-main-color-one', finalApiColors.site_main_color_one);
            root.style.setProperty('--brand', finalApiColors.site_main_color_one);
            root.style.setProperty('--site-primary', finalApiColors.site_main_color_one);
          }
          
          if (finalApiColors.site_main_color_two) {
            root.style.setProperty('--site-main-color-two', finalApiColors.site_main_color_two);
            root.style.setProperty('--brand-hover', finalApiColors.site_main_color_two);
            root.style.setProperty('--site-secondary', finalApiColors.site_main_color_two);
          }
          
          if (finalApiColors.site_main_color_three) {
            root.style.setProperty('--site-main-color-three', finalApiColors.site_main_color_three);
            root.style.setProperty('--site-tertiary', finalApiColors.site_main_color_three);
          }
        }
        
        // تطبيق ألوان النصوص
        const headingColor = actualMode === 'dark' && finalApiColors.dark_heading_color
          ? finalApiColors.dark_heading_color 
          : finalApiColors.heading_color;
        
        const lightColor = actualMode === 'dark' && finalApiColors.dark_light_color
          ? finalApiColors.dark_light_color 
          : finalApiColors.light_color;
        
        const extraLightColor = actualMode === 'dark' && finalApiColors.dark_extra_light_color
          ? finalApiColors.dark_extra_light_color 
          : finalApiColors.extra_light_color;
        
        if (headingColor) {
          root.style.setProperty('--heading-color', headingColor);
          root.style.setProperty('--site-heading', headingColor);
        }
        
        if (lightColor) {
          root.style.setProperty('--light-color', lightColor);
          root.style.setProperty('--site-light', lightColor);
        }
        
        if (extraLightColor) {
          root.style.setProperty('--extra-light-color', extraLightColor);
          root.style.setProperty('--site-extra-light', extraLightColor);
        }

        // تطبيق الأنماط الديناميكية المحسنة
        if (Object.keys(finalApiColors).length > 0) {
          applyDynamicStyles(finalApiColors, actualMode);
        }

      },
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({ mode: state.mode, colors: state.colors, apiColors: state.apiColors }),
    }
  )
);
