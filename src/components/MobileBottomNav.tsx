import React, { useState } from 'react';
import { ActiveTab } from '../types/database';
import { useLibrary } from '../context/LibraryContext';
import { useTheme } from '../context/ThemeContext';
import {
  BookMarked,
  BookOpen,
  Users,
  Flame,
  MoreHorizontal,
  X,
  Plus,
  Sparkles,
  Download,
  Upload,
  RotateCcw,
  UserCheck,
  Tag,
  ShieldCheck,
  Database,
  Moon,
  Sun,
  User,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenIssueModal: () => void;
  onOpenAIModal: () => void;
  onOpenAuthModal: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenIssueModal,
  onOpenAIModal,
  onOpenAuthModal,
}) => {
  const { stats, currentUser, logout, exportDatabaseJSON, importDatabaseJSON, resetToDemo } = useLibrary();
  const { effectiveTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          importDatabaseJSON(text);
          setIsMenuOpen(false);
        }
      };
      reader.readAsText(file);
    }
  };

  const navButtons = [
    {
      id: 'loans' as ActiveTab,
      label: 'Выдача',
      icon: <BookMarked className="w-5 h-5" />,
      badge: stats.totalIssued,
      alert: stats.totalOverdue > 0,
    },
    {
      id: 'books' as ActiveTab,
      label: 'Каталог',
      icon: <BookOpen className="w-5 h-5" />,
      badge: stats.totalBookTitles,
    },
    {
      id: 'reader' as ActiveTab,
      label: 'Читальня',
      icon: (
        <div className="relative">
          <BookOpen className="w-5 h-5" />
          <Flame className="w-2.5 h-2.5 text-amber-500 absolute -top-1 -right-1 animate-pulse" />
        </div>
      ),
      highlight: true,
    },
    {
      id: 'readers' as ActiveTab,
      label: 'Читатели',
      icon: <Users className="w-5 h-5" />,
      badge: stats.activeReadersCount,
    },
  ];

  const secondaryTabs: { id: ActiveTab; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: 'authors',
      label: 'Авторы',
      desc: 'Картотека писателей фонда',
      icon: <UserCheck className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />,
    },
    {
      id: 'genres',
      label: 'Жанры',
      desc: 'Классификатор литературы',
      icon: <Tag className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />,
    },
    {
      id: 'librarians',
      label: 'Сотрудники',
      desc: 'Персонал библиотеки',
      icon: <ShieldCheck className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />,
    },
    {
      id: 'schema',
      label: 'Схема БД и Жизненный цикл',
      desc: 'Таблицы, связи, архитектура ИС',
      icon: <Database className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />,
    },
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Fixed Bottom Bar on Mobile */}
      <nav
        aria-label="Мобильная навигация"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 pb-safe shadow-lg transition-colors"
      >
        <div className="flex items-center justify-around h-14 px-1 max-w-lg mx-auto">
          {navButtons.map((btn) => {
            const isActive = activeTab === btn.id;
            return (
              <button
                key={btn.id}
                onClick={() => handleSelectTab(btn.id)}
                className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-colors relative min-h-[44px] touch-manipulation ${
                  isActive
                    ? 'text-amber-800 dark:text-amber-400 font-semibold'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
              >
                <div className="relative">
                  {btn.icon}
                  {btn.badge !== undefined && btn.badge > 0 && (
                    <span
                      className={`absolute -top-1.5 -right-2.5 text-[9px] font-mono tabular-nums px-1 py-0.2 rounded-full leading-none font-bold ${
                        isActive
                          ? 'bg-amber-600 text-white'
                          : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      {btn.badge}
                    </span>
                  )}
                  {btn.alert && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  )}
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight">{btn.label}</span>
                {isActive && (
                  <span className="w-4 h-0.5 rounded-full bg-amber-600 dark:bg-amber-400 mt-0.5" />
                )}
              </button>
            );
          })}

          {/* More / Menu Button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-colors relative min-h-[44px] touch-manipulation ${
              isMenuOpen || ['authors', 'genres', 'librarians', 'schema'].includes(activeTab)
                ? 'text-amber-800 dark:text-amber-400 font-semibold'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            <div className="relative">
              <MoreHorizontal className="w-5 h-5" />
              {['authors', 'genres', 'librarians', 'schema'].includes(activeTab) && (
                <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-amber-600" />
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">Ещё</span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Bottom Sheet Drawer */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Sheet */}
          <div className="relative bg-white dark:bg-neutral-900 rounded-t-2xl border-t border-neutral-200 dark:border-neutral-800 shadow-2xl max-h-[85vh] flex flex-col z-10 animate-in slide-in-from-bottom duration-250 pb-safe">
            {/* Grabber handle */}
            <div className="w-12 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700 mx-auto my-2.5 shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">
                  БТ
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    Меню «БиблиоТех»
                  </h3>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                    Разделы и функции системы
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg min-w-[40px] min-h-[40px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable menu content */}
            <div className="overflow-y-auto px-4 py-3 space-y-4">
              {/* Primary Quick Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenIssueModal();
                  }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-amber-600 text-white font-medium text-xs shadow-xs active:bg-amber-700 min-h-[48px]"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <div className="text-left">
                    <div className="font-bold">Выдать книгу</div>
                    <div className="text-[10px] opacity-85">Новый абонемент</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenAIModal();
                  }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/15 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-500/30 font-medium text-xs active:bg-amber-500/25 min-h-[48px]"
                >
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />
                  <div className="text-left">
                    <div className="font-bold">ИИ-Поиск</div>
                    <div className="text-[10px] text-amber-700 dark:text-amber-400">Gemini AI</div>
                  </div>
                </button>
              </div>

              {/* Theme & Night Light Switcher on Mobile */}
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-500" />
                    <span>Тема оформления и Ночной свет</span>
                  </div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Светлая, Тёмная, Ночной свет, Сепия
                  </div>
                </div>
                <ThemeSwitcher />
              </div>

              {/* Additional Database Sections */}
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 px-1 mb-1.5">
                  База данных и разделы
                </div>
                <div className="space-y-1">
                  {secondaryTabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleSelectTab(tab.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-xs transition-colors min-h-[44px] ${
                          isActive
                            ? 'bg-neutral-900 text-white font-semibold'
                            : 'bg-neutral-50 dark:bg-neutral-800/40 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`p-2 rounded-lg ${
                              isActive
                                ? 'bg-neutral-800 text-white'
                                : 'bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200'
                            }`}
                          >
                            {tab.icon}
                          </span>
                          <div>
                            <div className="font-semibold text-xs">{tab.label}</div>
                            <div
                              className={`text-[10px] ${
                                isActive
                                  ? 'text-neutral-300'
                                  : 'text-neutral-500 dark:text-neutral-400'
                              }`}
                            >
                              {tab.desc}
                            </div>
                          </div>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 ${
                            isActive ? 'text-neutral-300' : 'text-neutral-400'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Database Backup & Demo Tools */}
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 px-1 mb-1.5">
                  Резервные копии и демонстрация
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={exportDatabaseJSON}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-center transition-colors min-h-[44px]"
                  >
                    <Download className="w-4 h-4 mb-1 text-neutral-600 dark:text-neutral-300" />
                    <span className="text-[10px] font-medium leading-tight">Экспорт JSON</span>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-center transition-colors min-h-[44px]"
                  >
                    <Upload className="w-4 h-4 mb-1 text-neutral-600 dark:text-neutral-300" />
                    <span className="text-[10px] font-medium leading-tight">Импорт JSON</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <button
                    onClick={() => {
                      if (confirm('Сбросить базу данных к исходным демонстрационным записям?')) {
                        resetToDemo();
                        setIsMenuOpen(false);
                      }
                    }}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-center transition-colors min-h-[44px]"
                  >
                    <RotateCcw className="w-4 h-4 mb-1 text-neutral-600 dark:text-neutral-300" />
                    <span className="text-[10px] font-medium leading-tight">Сброс демо</span>
                  </button>
                </div>
              </div>

              {/* User Account / Auth Section */}
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                {currentUser ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40">
                    <div
                      className="flex items-center gap-2.5 cursor-pointer"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenAuthModal();
                      }}
                    >
                      <div className="w-8 h-8 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 flex items-center justify-center font-bold text-xs">
                        {currentUser.фио.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'У'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                          {currentUser.фио}
                        </div>
                        <div className="text-[10px] text-amber-700 dark:text-amber-400">
                          {currentUser.role === 'librarian'
                            ? currentUser.должность || 'Сотрудник библиотеки'
                            : `Читательский билет #${currentUser.id}`}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      title="Выйти"
                      className="p-2 text-neutral-400 hover:text-rose-600 rounded-lg min-w-[40px] min-h-[40px] flex items-center justify-center"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenAuthModal();
                    }}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-neutral-900 text-white font-medium text-xs shadow-xs min-h-[44px]"
                  >
                    <User className="w-4 h-4 text-amber-400" />
                    <span>Вход / Регистрация читательского билета</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
