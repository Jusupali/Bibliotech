import React, { useState, useRef, useEffect } from 'react';
import { useTheme, AppTheme } from '../context/ThemeContext';
import { Sun, Moon, Flame, Monitor, Sliders, ChevronDown, Check, Eye } from 'lucide-react';

interface ThemeSwitcherProps {
  compact?: boolean;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ compact = false }) => {
  const {
    theme,
    effectiveTheme,
    setTheme,
    nightLightIntensity,
    setNightLightIntensity,
    isNightLightEnabled,
    toggleNightLight,
  } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const [showWarmthSlider, setShowWarmthSlider] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setShowWarmthSlider(false);
      }
    };
    if (isOpen || showWarmthSlider) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, showWarmthSlider]);

  const themes: {
    id: AppTheme;
    name: string;
    description: string;
    icon: React.ReactNode;
    colorBadge: string;
  }[] = [
    {
      id: 'light',
      name: 'Светлая',
      description: 'Классическая дневная тема',
      icon: <Sun className="w-4 h-4 text-amber-500" />,
      colorBadge: 'bg-white border-neutral-300',
    },
    {
      id: 'dark',
      name: 'Тёмная',
      description: 'Глубокий ночной контраст',
      icon: <Moon className="w-4 h-4 text-sky-400" />,
      colorBadge: 'bg-[#181b24] border-neutral-700',
    },
    {
      id: 'night-light',
      name: 'Ночной свет (Теплый янтарь)',
      description: 'Адаптирована под ночной свет экрана, без синего излучения',
      icon: <Flame className="w-4 h-4 text-amber-400" />,
      colorBadge: 'bg-[#241e18] border-amber-600',
    },
    {
      id: 'sepia',
      name: 'Книжная сепия',
      description: 'Мягкий оттенок книжных страниц',
      icon: <Eye className="w-4 h-4 text-amber-700" />,
      colorBadge: 'bg-[#fbf6ec] border-amber-300',
    },
    {
      id: 'system',
      name: 'Системная',
      description: 'Как в настройках ОС',
      icon: <Monitor className="w-4 h-4 text-neutral-400" />,
      colorBadge: 'bg-gradient-to-r from-white to-neutral-800 border-neutral-400',
    },
  ];

  // Current active icon
  const currentIcon =
    effectiveTheme === 'night-light' ? (
      <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
    ) : effectiveTheme === 'dark' ? (
      <Moon className="w-3.5 h-3.5 text-sky-400" />
    ) : effectiveTheme === 'sepia' ? (
      <Eye className="w-3.5 h-3.5 text-amber-700" />
    ) : (
      <Sun className="w-3.5 h-3.5 text-amber-500" />
    );

  const currentLabel =
    theme === 'night-light'
      ? 'Ночной свет'
      : theme === 'dark'
      ? 'Тёмная'
      : theme === 'sepia'
      ? 'Сепия'
      : theme === 'light'
      ? 'Светлая'
      : 'Системная';

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-neutral-200 hover:border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 transition-colors shadow-2xs"
        title="Сменить тему оформления и режим ночного света"
      >
        <span className="shrink-0">{currentIcon}</span>
        {!compact && <span className="hidden sm:inline">{currentLabel}</span>}
        <ChevronDown className="w-3 h-3 text-neutral-400 shrink-0" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-64 rounded-xl border border-neutral-200 bg-white shadow-xl z-50 p-2 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2 py-1 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider border-b border-neutral-100 mb-1">
            Тема интерфейса
          </div>

          <div className="space-y-1">
            {themes.map((t) => {
              const isSelected = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                    isSelected
                      ? 'bg-amber-50 text-amber-950 font-semibold'
                      : 'hover:bg-neutral-100 text-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="shrink-0">{t.icon}</span>
                    <div className="leading-tight">
                      <div className="flex items-center gap-1.5">
                        <span>{t.name}</span>
                        {t.id === 'night-light' && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-normal">
                            Комфорт
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-neutral-500 font-normal mt-0.5 line-clamp-1">
                        {t.description}
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>

          {/* Quick Night Light Live Warmth Setting */}
          <div className="mt-2 pt-2 border-t border-neutral-100 px-2 py-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-neutral-600 flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-500" />
                <span>Тёплый фильтр (Ночной свет)</span>
              </span>
              <button
                onClick={toggleNightLight}
                className={`text-[10px] px-1.5 py-0.5 rounded font-medium transition-colors ${
                  isNightLightEnabled
                    ? 'bg-amber-500 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {isNightLightEnabled ? 'ВКЛ' : 'ВЫКЛ'}
              </button>
            </div>

            {isNightLightEnabled && (
              <div className="mt-2 animate-in fade-in duration-150">
                <div className="flex justify-between text-[10px] text-neutral-500 mb-1">
                  <span>Теплота спектра:</span>
                  <span className="font-mono font-bold text-amber-600">
                    {nightLightIntensity}%
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="70"
                  value={nightLightIntensity}
                  onChange={(e) => setNightLightIntensity(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-neutral-200 rounded-lg"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
