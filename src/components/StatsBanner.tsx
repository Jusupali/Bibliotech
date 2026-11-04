import React from 'react';
import { useLibrary } from '../context/LibraryContext';
import { BookMarked, BookCopy, CheckCircle, ClockAlert, Users } from 'lucide-react';
import { ActiveTab } from '../types/database';

interface StatsBannerProps {
  onNavigateToTab: (tab: ActiveTab) => void;
  onFilterOverdueLoans: () => void;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({
  onNavigateToTab,
  onFilterOverdueLoans,
}) => {
  const { stats } = useLibrary();

  return (
    <div className="bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
          {/* Card 1: Books Fund */}
          <div
            onClick={() => onNavigateToTab('books')}
            className="cursor-pointer group p-2.5 sm:p-3 rounded-xl border border-neutral-100 hover:border-neutral-300 bg-neutral-50/50 hover:bg-neutral-50 active:scale-[0.98] transition-all"
          >
            <div className="flex items-center justify-between text-neutral-500 mb-1">
              <span className="text-[11px] font-medium text-neutral-500">Фонд литературы</span>
              <BookMarked className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 transition-colors" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono tabular-nums text-neutral-900">
                {stats.totalCopies}
              </span>
              <span className="text-[11px] text-neutral-500">
                экз. ({stats.totalBookTitles} наим.)
              </span>
            </div>
          </div>

          {/* Card 2: Books on loan */}
          <div
            onClick={() => onNavigateToTab('loans')}
            className="cursor-pointer group p-3 rounded-lg border border-neutral-100 hover:border-neutral-300 bg-neutral-50/50 hover:bg-neutral-50 transition-all"
          >
            <div className="flex items-center justify-between text-neutral-500 mb-1">
              <span className="text-[11px] font-medium text-neutral-500">На руках у читателей</span>
              <BookCopy className="w-4 h-4 text-neutral-400 group-hover:text-amber-600 transition-colors" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono tabular-nums text-amber-700">
                {stats.totalIssued}
              </span>
              <span className="text-[11px] text-neutral-500">
                книг выдано
              </span>
            </div>
          </div>

          {/* Card 3: Available copies */}
          <div
            onClick={() => onNavigateToTab('books')}
            className="cursor-pointer group p-3 rounded-lg border border-neutral-100 hover:border-neutral-300 bg-neutral-50/50 hover:bg-neutral-50 transition-all"
          >
            <div className="flex items-center justify-between text-neutral-500 mb-1">
              <span className="text-[11px] font-medium text-neutral-500">Доступно к выдаче</span>
              <CheckCircle className="w-4 h-4 text-neutral-400 group-hover:text-emerald-600 transition-colors" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono tabular-nums text-emerald-700">
                {stats.totalAvailable}
              </span>
              <span className="text-[11px] text-neutral-500">
                свободно
              </span>
            </div>
          </div>

          {/* Card 4: Overdue Alert */}
          <div
            onClick={() => {
              onNavigateToTab('loans');
              onFilterOverdueLoans();
            }}
            className={`cursor-pointer group p-3 rounded-lg border transition-all ${
              stats.totalOverdue > 0
                ? 'border-rose-200 bg-rose-50/50 hover:bg-rose-50'
                : 'border-neutral-100 bg-neutral-50/50 hover:bg-neutral-50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium text-neutral-500">
                Просрочено возвратов
              </span>
              <ClockAlert
                className={`w-4 h-4 ${
                  stats.totalOverdue > 0 ? 'text-rose-600 animate-pulse' : 'text-neutral-400'
                }`}
              />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span
                className={`text-xl font-bold font-mono tabular-nums ${
                  stats.totalOverdue > 0 ? 'text-rose-600' : 'text-neutral-600'
                }`}
              >
                {stats.totalOverdue}
              </span>
              <span className="text-[11px] text-neutral-500">
                {stats.totalOverdue > 0 ? 'требуют возврата' : 'нет просрочек'}
              </span>
            </div>
          </div>

          {/* Card 5: Active Readers */}
          <div
            onClick={() => onNavigateToTab('readers')}
            className="cursor-pointer group p-3 rounded-lg border border-neutral-100 hover:border-neutral-300 bg-neutral-50/50 hover:bg-neutral-50 transition-all col-span-2 sm:col-span-1"
          >
            <div className="flex items-center justify-between text-neutral-500 mb-1">
              <span className="text-[11px] font-medium text-neutral-500">Активные читатели</span>
              <Users className="w-4 h-4 text-neutral-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono tabular-nums text-neutral-900">
                {stats.activeReadersCount}
              </span>
              <span className="text-[11px] text-neutral-500">
                с книгами на руках
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
