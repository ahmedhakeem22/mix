
import { createContext, useContext, useEffect } from "react";
import { useThemeStore } from "@/store/theme-store";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  ...props
}: ThemeProviderProps) {
  const { mode, setMode, applyTheme } = useThemeStore();

  useEffect(() => {
    // Apply theme on mount
    applyTheme();
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (mode === 'system') {
        applyTheme();
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
      const observer = new MutationObserver(() => {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        applyTheme();
      }, 100);
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
            observer.disconnect();

    };
  }, [mode, applyTheme]);

  const value = {
    theme: mode,
    setTheme: (theme: Theme) => {
      setMode(theme);
      setTimeout(() => {
        applyTheme();
      }, 0);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
