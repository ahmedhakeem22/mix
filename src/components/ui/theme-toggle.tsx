
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/theme-provider";
import { useThemeStore } from "@/store/theme-store";

interface ThemeToggleProps {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function ThemeToggle({ 
  variant = "ghost", 
  size = "icon",
  className = ""
}: ThemeToggleProps) {
  const { setTheme, theme } = useTheme();
  const { applyTheme } = useThemeStore();

  const handleToggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
      setTimeout(() => {
      applyTheme();
    }, 50);
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      className={`relative ${className}`}
      onClick={handleToggle}
      title={theme === "dark" ? "وضع النهار" : "الوضع الداكن"}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">تبديل الوضع</span>
    </Button>
  );
}
