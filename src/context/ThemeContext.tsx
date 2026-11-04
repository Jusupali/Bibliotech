import React, { createContext, useContext, useEffect, useState } from 'react';

export type AppTheme = 'light' | 'dark' | 'night-light' | 'sepia' | 'system';
export type EffectiveTheme = 'light' | 'dark' | 'night-light' | 'sepia';

interface ThemeContextType {
  theme: AppTheme;
  effectiveTheme: EffectiveTheme;
  setTheme: (theme: AppTheme) => void;
  nightLightIntensity: number; // 0 to 100% warmth level
  setNightLightIntensity: (level: number) => void;
  isNightLightEnabled: boolean;
  toggleNightLight: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'bibliotech_app_theme';
const NIGHT_LIGHT_STORAGE_KEY = 'bibliotech_night_light_intensity';
const NIGHT_LIGHT_ENABLED_KEY = 'bibliotech_night_light_enabled';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as AppTheme | null;
      if (saved && ['light', 'dark', 'night-light', 'sepia', 'system'].includes(saved)) {
        return saved;
      }
    } catch {
      // fallback
    }
    return 'light';
  });

  const [nightLightIntensity, setNightLightIntensityState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(NIGHT_LIGHT_STORAGE_KEY);
      if (saved !== null) {
        const val = Number(saved);
        if (!isNaN(val) && val >= 0 && val <= 100) return val;
      }
    } catch {
      // fallback
    }
    return 35; // Default 35% comfortable warmth
  });

  const [isNightLightEnabled, setIsNightLightEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(NIGHT_LIGHT_ENABLED_KEY);
      if (saved !== null) return saved === 'true';
    } catch {
      // fallback
    }
    return false;
  });

  // Calculate effective theme (handling 'system')
  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const effectiveTheme: EffectiveTheme =
    theme === 'system' ? (systemIsDark ? 'dark' : 'light') : theme;

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {
      console.error(e);
    }
  };

  const setNightLightIntensity = (level: number) => {
    const clamped = Math.min(100, Math.max(0, level));
    setNightLightIntensityState(clamped);
    try {
      localStorage.setItem(NIGHT_LIGHT_STORAGE_KEY, String(clamped));
    } catch (e) {
      console.error(e);
    }
  };

  const toggleNightLight = () => {
    setIsNightLightEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(NIGHT_LIGHT_ENABLED_KEY, String(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  // Sync with document element
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', effectiveTheme);

    // If dark or night-light, add 'dark' class for standard tailwind dark: variants
    if (effectiveTheme === 'dark' || effectiveTheme === 'night-light') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Set CSS variable for warmth intensity
    root.style.setProperty('--night-light-warmth', `${nightLightIntensity}%`);
  }, [effectiveTheme, nightLightIntensity]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        effectiveTheme,
        setTheme,
        nightLightIntensity,
        setNightLightIntensity,
        isNightLightEnabled,
        toggleNightLight,
      }}
    >
      {children}
      {/* Global Night Light Warm Overlay if active */}
      {isNightLightEnabled && (
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none z-[9999] transition-opacity duration-300 mix-blend-multiply"
          style={{
            backgroundColor: `rgba(255, 170, 50, ${(nightLightIntensity / 100) * 0.18})`,
          }}
        />
      )}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
};
