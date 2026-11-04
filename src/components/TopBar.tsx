import React from 'react';
import { ActiveTab } from '../types/database';
import { useLibrary } from '../context/LibraryContext';
import { BookOpen, Plus, RotateCcw, Download, Upload, User, LogOut, Flame, Sparkles } from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher';

interface TopBarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenIssueModal: () => void;
  onOpenAuthModal: () => void;
  onOpenReaderModal?: () => void;
  onOpenAIModal?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  onOpenIssueModal,
  onOpenAuthModal,
  onOpenReaderModal,
  onOpenAIModal,
}) => {
  const { stats, resetToDemo, exportDatabaseJSON, importDatabaseJSON, currentUser, logout } = useLibrary();

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          importDatabaseJSON(text);
        }
      };
      reader.readAsText(file);
    }
  };

  const navItems: { id: ActiveTab; label: string; badge?: number; alert?: boolean }[] = [
    {
      id: 'loans',
      label: 'Выдача книг',
      badge: stats.totalIssued,
      alert: stats.totalOverdue > 0,
    },
    { id: 'books', label: 'Каталог фонда', badge: stats.totalBookTitles },
    { id: 'reader', label: 'Читальный зал' },
    { id: 'readers', label: 'Читатели', badge: stats.activeReadersCount },
    { id: 'authors', label: 'Авторы' },
    { id: 'genres', label: 'Жанры' },
    { id: 'librarians', label: 'Сотрудники' },
    { id: 'schema', label: 'Схема БД' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-xs tracking-wider">
              БТ
            </div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('loans');
              }}
              className="text-lg font-bold tracking-tight text-neutral-900 flex items-center gap-1.5"
            >
              <span>БиблиоТех</span>
              <span className="text-xs font-normal text-neutral-400 hidden sm:inline">| Управление</span>
            </a>
          </div>

          {/* Zone 2: Navigation links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5 overflow-x-auto py-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-mono tabular-nums px-1.5 py-0.2 rounded ${
                        isActive
                          ? 'bg-neutral-700 text-neutral-200'
                          : 'bg-neutral-200 text-neutral-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {item.alert && (
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"
                      title={`${stats.totalOverdue} просрочено`}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-2">
            {/* Quick backup / reset tools */}
            <div className="hidden lg:flex items-center gap-1 border-r border-neutral-200 pr-2">
              <button
                onClick={exportDatabaseJSON}
                title="Экспорт базы данных в JSON"
                className="p-1.5 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-md transition-colors text-xs flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden xl:inline text-[11px]">Экспорт</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                title="Импорт базы данных из JSON"
                className="p-1.5 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-md transition-colors text-xs flex items-center gap-1"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden xl:inline text-[11px]">Импорт</span>
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
                  }
                }}
                title="Восстановить демонстрационные данные"
                className="p-1.5 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-md transition-colors text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Theme & Night Light Switcher */}
            <ThemeSwitcher />

            {/* AI Assistant Button */}
            {onOpenAIModal && (
              <button
                onClick={onOpenAIModal}
                title="ИИ-Библиограф (Gemini AI) — поиск авторов, книг и консультации"
                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs font-semibold text-amber-900 dark:text-amber-200 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-lg transition-colors whitespace-nowrap shadow-2xs min-h-[36px]"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse shrink-0" />
                <span className="hidden sm:inline">ИИ-Поиск</span>
                <span className="sm:inline hidden text-[11px] font-mono text-amber-700 dark:text-amber-300">AI</span>
                <span className="sm:hidden text-xs">ИИ</span>
              </button>
            )}

            {/* Primary Action Button */}
            <button
              onClick={onOpenIssueModal}
              title="Оформить выдачу книги"
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 rounded-lg shadow-xs transition-colors whitespace-nowrap min-h-[36px]"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Выдать книгу</span>
              <span className="sm:hidden font-medium">Выдать</span>
            </button>

            {/* User Profile / Auth Button */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 pl-1.5 sm:pl-2 border-l border-neutral-200 dark:border-neutral-800">
                <button
                  onClick={onOpenAuthModal}
                  title="Личный кабинет / Личные данные"
                  className="flex items-center gap-1.5 text-left hover:opacity-80 transition-opacity p-0.5"
                >
                  <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center font-bold text-[11px] shrink-0">
                    {currentUser.фио.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'У'}
                  </div>
                  <div className="hidden sm:block leading-tight text-left">
                    <div className="text-xs font-semibold text-neutral-800 max-w-[110px] truncate">
                      {currentUser.фио}
                    </div>
                    <div className="text-[10px] text-neutral-500 flex items-center gap-1">
                      <span
                        className={`inline-block w-1.5 h-1.5 rounded-full ${
                          currentUser.role === 'librarian' ? 'bg-amber-600' : 'bg-emerald-600'
                        }`}
                      />
                      <span className="truncate max-w-[80px]">
                        {currentUser.role === 'librarian'
                          ? currentUser.должность || 'Сотрудник'
                          : 'Читатель'}
                      </span>
                    </div>
                  </div>
                </button>
                <button
                  onClick={logout}
                  title="Выйти из учетной записи"
                  className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-neutral-800 rounded-md transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200/80 rounded-lg transition-colors shrink-0 min-h-[36px]"
              >
                <User className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden sm:inline">Вход / Регистрация</span>
                <span className="sm:hidden">Вход</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar with smooth horizontal scroll and touch padding */}
        <div className="flex md:hidden overflow-x-auto py-2 border-t border-neutral-100 dark:border-neutral-800 gap-1.5 scrollbar-none px-0.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors min-h-[32px] ${
                  isActive
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200'
                }`}
              >
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-mono tabular-nums px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? 'bg-neutral-700 text-neutral-100'
                        : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {item.alert && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
