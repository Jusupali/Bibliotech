/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LibraryProvider, useLibrary } from './context/LibraryContext';
import { ThemeProvider } from './context/ThemeContext';
import { ActiveTab, LoanStatus, Book, EnrichedBook } from './types/database';
import { TopBar } from './components/TopBar';
import { StatsBanner } from './components/StatsBanner';
import { ToastContainer } from './components/ToastContainer';
import { IssueBookModal } from './components/IssueBookModal';
import { AuthPanel } from './components/AuthPanel';
import { BookReaderModal } from './components/BookReaderModal';
import { AIAssistantModal } from './components/AIAssistantModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { X, UserCheck, ShieldCheck, BookOpen, User } from 'lucide-react';

// Tabs
import { LoansTab } from './components/tabs/LoansTab';
import { BooksTab } from './components/tabs/BooksTab';
import { ReadingRoomTab } from './components/tabs/ReadingRoomTab';
import { ReadersTab } from './components/tabs/ReadersTab';
import { AuthorsTab } from './components/tabs/AuthorsTab';
import { GenresTab } from './components/tabs/GenresTab';
import { LibrariansTab } from './components/tabs/LibrariansTab';
import { SchemaTab } from './components/tabs/SchemaTab';

const LibraryAppContent: React.FC = () => {
  const { currentUser } = useLibrary();
  const [activeTab, setActiveTab] = useState<ActiveTab>('loans');
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthBannerDismissed, setIsAuthBannerDismissed] = useState(false);
  const [preselectedBookId, setPreselectedBookId] = useState<number | undefined>(undefined);
  const [preselectedReaderId, setPreselectedReaderId] = useState<number | undefined>(undefined);
  const [loansFilterStatus, setLoansFilterStatus] = useState<'all' | LoanStatus | null>(null);
  const [readingBook, setReadingBook] = useState<Book | EnrichedBook | null>(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const handleOpenIssueModal = (bookId?: number, readerId?: number) => {
    setPreselectedBookId(bookId);
    setPreselectedReaderId(readerId);
    setIsIssueModalOpen(true);
  };

  const handleFilterOverdueLoans = () => {
    setActiveTab('loans');
    setLoansFilterStatus('просрочена');
  };

  const handleSelectGenreFilter = (genreId: number) => {
    setActiveTab('books');
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* 3-Zone Top Bar Contract */}
      <TopBar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'loans') {
            setLoansFilterStatus(null);
          }
        }}
        onOpenIssueModal={() => handleOpenIssueModal()}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenReaderModal={() => setActiveTab('reader')}
        onOpenAIModal={() => setIsAIModalOpen(true)}
      />

      {/* Auth & Registration Panel at the very beginning */}
      {!currentUser && !isAuthBannerDismissed && (
        <section className="bg-gradient-to-b from-amber-50/50 via-neutral-100/70 to-neutral-50 border-b border-neutral-200 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 mb-2 border border-amber-200">
                <UserCheck className="w-3.5 h-3.5 text-amber-700" />
                <span>Панель авторизации и регистрации</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
                Добро пожаловать в «БиблиоТех»
              </h2>
              <p className="text-xs text-neutral-600 mt-1 max-w-md mx-auto">
                Заполните личные данные для регистрации читательского билета или учетной записи сотрудника библиотеки
              </p>
            </div>

            <AuthPanel
              onSuccess={() => setIsAuthBannerDismissed(true)}
              onSkip={() => setIsAuthBannerDismissed(true)}
            />

            <div className="text-center mt-3">
              <button
                onClick={() => setIsAuthBannerDismissed(true)}
                className="text-xs text-neutral-500 hover:text-neutral-800 transition-colors"
              >
                Скрыть панель и перейти к просмотру каталога без регистрации &rarr;
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Active User Personal Info Ribbon */}
      {currentUser && (
        <div className="bg-white border-b border-neutral-200 px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-neutral-500">Личный профиль:</span>
              <span className="font-bold text-neutral-900">{currentUser.фио}</span>
              <span className="text-neutral-300">|</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-900 border border-amber-200/60">
                {currentUser.role === 'librarian' ? (
                  <>
                    <ShieldCheck className="w-3 h-3 text-amber-700" />
                    <span>Сотрудник: {currentUser.должность || 'Библиотекарь'}</span>
                  </>
                ) : (
                  <>
                    <BookOpen className="w-3 h-3 text-amber-700" />
                    <span>Читатель (билет #{currentUser.id})</span>
                  </>
                )}
              </span>
              <span className="text-neutral-500 text-[11px] hidden md:inline">
                Тел: <strong className="text-neutral-700 font-mono">{currentUser.телефон}</strong> · Email: <strong className="text-neutral-700">{currentUser.email}</strong>
              </span>
            </div>

            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="text-xs font-medium text-amber-800 hover:text-amber-950 underline underline-offset-2 flex items-center gap-1"
            >
              <User className="w-3.5 h-3.5" />
              <span>Личные данные / Сменить профиль</span>
            </button>
          </div>
        </div>
      )}

      {/* Aggregate Metric Banner */}
      <StatsBanner
        onNavigateToTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'loans') setLoansFilterStatus(null);
        }}
        onFilterOverdueLoans={handleFilterOverdueLoans}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-20 md:pb-8">
        {activeTab === 'loans' && (
          <LoansTab
            onOpenIssueModal={() => handleOpenIssueModal()}
            filterStatusOverride={loansFilterStatus}
            onOpenBookReader={(book) => setReadingBook(book)}
          />
        )}

        {activeTab === 'books' && (
          <BooksTab
            onIssueBook={(bookId) => handleOpenIssueModal(bookId, undefined)}
            onOpenBookReader={(book) => setReadingBook(book)}
            onOpenAIModal={() => setIsAIModalOpen(true)}
          />
        )}

        {activeTab === 'reader' && (
          <ReadingRoomTab
            onOpenBookReader={(book) => setReadingBook(book)}
            onOpenAIModal={() => setIsAIModalOpen(true)}
          />
        )}

        {activeTab === 'readers' && (
          <ReadersTab
            onIssueToReader={(readerId) => handleOpenIssueModal(undefined, readerId)}
          />
        )}

        {activeTab === 'authors' && <AuthorsTab />}

        {activeTab === 'genres' && (
          <GenresTab onSelectGenreFilter={handleSelectGenreFilter} />
        )}

        {activeTab === 'librarians' && <LibrariansTab />}

        {activeTab === 'schema' && <SchemaTab />}
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-neutral-200 bg-white py-4 text-xs text-neutral-500 mb-14 md:mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-800">БиблиоТех</span>
            <span>·</span>
            <span>Автоматизированная библиотечная информационная система</span>
          </div>
          <div className="font-mono text-[11px] text-neutral-400 tabular-nums">
            6 таблиц БД · Контроль выдачи и доступности фонда
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar (Visible only on mobile screens < 768px) */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'loans') setLoansFilterStatus(null);
        }}
        onOpenIssueModal={() => handleOpenIssueModal()}
        onOpenAIModal={() => setIsAIModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Issue Book Modal */}
      <IssueBookModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        preselectedBookId={preselectedBookId}
        preselectedReaderId={preselectedReaderId}
      />

      {/* Auth & Registration Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
          <div className="relative w-full max-w-xl my-auto max-h-[95dvh] flex flex-col">
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute -top-2.5 -right-2.5 sm:-top-3 sm:-right-3 z-20 p-2 bg-neutral-900 text-white rounded-full hover:bg-neutral-800 shadow-md transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
              title="Закрыть"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="overflow-y-auto rounded-2xl">
              <AuthPanel
                onSuccess={() => setIsAuthModalOpen(false)}
                onSkip={() => setIsAuthModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Book Reader Modal with Night Light adaptation */}
      <BookReaderModal
        isOpen={Boolean(readingBook)}
        onClose={() => setReadingBook(null)}
        book={readingBook}
      />

      {/* AI Bibliographer Assistant Modal (Gemini AI) */}
      <AIAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onOpenBookReader={(book) => setReadingBook(book)}
        onIssueBook={(bookId) => handleOpenIssueModal(bookId, undefined)}
      />

      {/* Toast Notification Container */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <LibraryProvider>
        <LibraryAppContent />
      </LibraryProvider>
    </ThemeProvider>
  );
}
