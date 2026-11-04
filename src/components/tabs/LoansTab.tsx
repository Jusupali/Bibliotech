import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { LoanStatus } from '../../types/database';
import {
  Search,
  CheckCircle2,
  Calendar,
  Clock,
  RotateCcw,
  Trash2,
  Plus,
  BookOpen,
  User,
  Filter,
} from 'lucide-react';

interface LoansTabProps {
  onOpenIssueModal: () => void;
  filterStatusOverride?: 'all' | LoanStatus | null;
  onOpenBookReader?: (book: any) => void;
}

export const LoansTab: React.FC<LoansTabProps> = ({
  onOpenIssueModal,
  filterStatusOverride,
  onOpenBookReader,
}) => {
  const { enrichedLoans, returnBook, prolongLoan, deleteLoan } = useLibrary();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | LoanStatus>(
    filterStatusOverride || 'all'
  );
  const [prolongModalLoanId, setProlongModalLoanId] = useState<number | null>(null);
  const [newDueDate, setNewDueDate] = useState<string>('');

  // Synchronize if prop changes
  React.useEffect(() => {
    if (filterStatusOverride) {
      setStatusFilter(filterStatusOverride);
    }
  }, [filterStatusOverride]);

  const filteredLoans = enrichedLoans.filter((loan) => {
    // Status filter
    if (statusFilter !== 'all' && loan.статус !== statusFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const bookTitle = loan.book?.название?.toLowerCase() || '';
      const authorName = loan.author?.фио?.toLowerCase() || '';
      const readerName = loan.reader?.фио?.toLowerCase() || '';
      const librarianName = loan.librarian?.фио?.toLowerCase() || '';
      const phone = loan.reader?.телефон?.toLowerCase() || '';

      const matches =
        bookTitle.includes(q) ||
        authorName.includes(q) ||
        readerName.includes(q) ||
        librarianName.includes(q) ||
        phone.includes(q) ||
        String(loan.id) === q;

      if (!matches) return false;
    }

    return true;
  });

  const countAll = enrichedLoans.length;
  const countActive = enrichedLoans.filter((l) => l.статус === 'на руках').length;
  const countOverdue = enrichedLoans.filter((l) => l.статус === 'просрочена').length;
  const countReturned = enrichedLoans.filter((l) => l.статус === 'возвращена').length;

  const handleOpenProlong = (loanId: number, currentDueDate: string) => {
    const cur = new Date(currentDueDate);
    cur.setDate(cur.getDate() + 14);
    setNewDueDate(cur.toISOString().slice(0, 10));
    setProlongModalLoanId(loanId);
  };

  const handleConfirmProlong = (e: React.FormEvent) => {
    e.preventDefault();
    if (prolongModalLoanId && newDueDate) {
      prolongLoan(prolongModalLoanId, newDueDate);
      setProlongModalLoanId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action and Filter Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по книге, автору, читателю или телефону..."
            className="w-full text-xs rounded-lg border border-neutral-200 pl-9 pr-3 py-2 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
          />
        </div>

        {/* Status Segmented Buttons */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg shrink-0 overflow-x-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Все ({countAll})
          </button>

          <button
            onClick={() => setStatusFilter('на руках')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              statusFilter === 'на руках'
                ? 'bg-white text-amber-800 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            На руках ({countActive})
          </button>

          <button
            onClick={() => setStatusFilter('просрочена')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'просрочена'
                ? 'bg-white text-rose-700 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-rose-600'
            }`}
          >
            <span>Просрочено ({countOverdue})</span>
            {countOverdue > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            )}
          </button>

          <button
            onClick={() => setStatusFilter('возвращена')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              statusFilter === 'возвращена'
                ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Возвращены ({countReturned})
          </button>
        </div>
      </div>

      {/* Mobile Responsive Cards View (< md) */}
      <div className="md:hidden space-y-3">
        {filteredLoans.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 p-6 text-center text-neutral-500">
            <BookOpen className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-neutral-700">Записей о выдаче не найдено</p>
            <p className="text-xs text-neutral-400 mt-1">
              {searchQuery
                ? 'Попробуйте изменить поисковый запрос или сбросить фильтры'
                : 'В журнале пока нет оформленных выдач'}
            </p>
            {!searchQuery && (
              <button
                onClick={onOpenIssueModal}
                className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Оформить выдачу книги
              </button>
            )}
          </div>
        ) : (
          filteredLoans.map((loan) => {
            const isReturned = loan.статус === 'возвращена';
            const isOverdue = loan.статус === 'просрочена';
            const days = loan.daysRemainingOrOverdue ?? 0;

            return (
              <div
                key={loan.id}
                className={`bg-white rounded-xl border transition-all p-4 space-y-3 shadow-xs ${
                  isOverdue
                    ? 'border-rose-300 bg-rose-50/20'
                    : isReturned
                    ? 'border-neutral-200 opacity-90'
                    : 'border-neutral-200'
                }`}
              >
                {/* Header: ID + Status + Delete */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-neutral-400">
                      #{loan.id}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        isReturned
                          ? 'bg-emerald-100 text-emerald-800'
                          : isOverdue
                          ? 'bg-rose-100 text-rose-800 font-bold'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isReturned
                            ? 'bg-emerald-600'
                            : isOverdue
                            ? 'bg-rose-600 animate-pulse'
                            : 'bg-amber-600'
                        }`}
                      />
                      <span>
                        {isReturned ? 'Возвращена' : isOverdue ? 'Просрочена' : 'На руках'}
                      </span>
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Удалить запись выдачи #${loan.id}?`)) {
                        deleteLoan(loan.id);
                      }
                    }}
                    title="Удалить запись"
                    className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg min-w-[36px] min-h-[36px] flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Book & Author */}
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 leading-snug">
                    {loan.book?.название || `Книга #${loan.книга_id}`}
                  </h4>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {loan.author?.фио || 'Автор не указан'}
                  </p>
                </div>

                {/* Reader Info */}
                <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-neutral-400 shrink-0" />
                    <div>
                      <div className="font-medium text-neutral-900">
                        {loan.reader?.фио || `Читатель #${loan.читатель_id}`}
                      </div>
                      <div className="text-[10px] text-neutral-500">
                        {loan.librarian ? `Библиотекарь: ${loan.librarian.фио}` : ''}
                      </div>
                    </div>
                  </div>

                  {loan.reader?.телефон && (
                    <a
                      href={`tel:${loan.reader.телефон}`}
                      className="px-2 py-1 rounded-md bg-white border border-neutral-200 text-amber-700 font-mono font-medium text-[11px] hover:bg-amber-50 shrink-0"
                    >
                      {loan.reader.телефон}
                    </a>
                  )}
                </div>

                {/* Dates Info */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-neutral-100">
                  <div>
                    <span className="text-[10px] text-neutral-400 block">Выдана:</span>
                    <span className="font-mono text-neutral-700">{loan.дата_выдачи}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-neutral-400 block">Срок сдачи:</span>
                    <span
                      className={`font-mono font-medium ${
                        isOverdue
                          ? 'text-rose-600 font-bold'
                          : isReturned
                          ? 'text-neutral-500'
                          : 'text-neutral-800'
                      }`}
                    >
                      {loan.срок_возврата}
                      {!isReturned && (
                        <span className="block text-[10px] font-normal">
                          {isOverdue ? `Просрочено на ${Math.abs(days)} дн.` : `Осталось ${days} дн.`}
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Mobile Action Buttons */}
                <div className="pt-2 border-t border-neutral-100 flex flex-wrap gap-2">
                  {!isReturned && (
                    <button
                      onClick={() => returnBook(loan.id)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs transition-colors min-h-[40px]"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Принять возврат</span>
                    </button>
                  )}

                  {!isReturned && (
                    <button
                      onClick={() => handleOpenProlong(loan.id, loan.срок_возврата)}
                      className="inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors min-h-[40px]"
                    >
                      <Clock className="w-4 h-4 text-neutral-500" />
                      <span>+14 дней</span>
                    </button>
                  )}

                  {onOpenBookReader && loan.book && (
                    <button
                      onClick={() => onOpenBookReader(loan.book)}
                      className="inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors min-h-[40px]"
                    >
                      <BookOpen className="w-4 h-4 text-amber-600" />
                      <span>Читать</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Main Desktop Table (hidden on mobile < md) */}
      <div className="hidden md:block bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/70 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 font-mono">ID</th>
                <th className="py-3 px-4">Книга и автор</th>
                <th className="py-3 px-4">Читатель</th>
                <th className="py-3 px-4 hidden lg:table-cell">Библиотекарь</th>
                <th className="py-3 px-4">Выдана</th>
                <th className="py-3 px-4">Срок возврата</th>
                <th className="py-3 px-4 hidden md:table-cell">Дата возврата</th>
                <th className="py-3 px-4">Статус</th>
                <th className="py-3 px-4 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-neutral-500">
                    <BookOpen className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-neutral-700">Записей о выдаче не найдено</p>
                    <p className="text-xs text-neutral-400 mt-1">
                      {searchQuery
                        ? 'Попробуйте изменить поисковый запрос или сбросить фильтры'
                        : 'В журнале пока нет оформленных выдач'}
                    </p>
                    {!searchQuery && (
                      <button
                        onClick={onOpenIssueModal}
                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Оформить выдачу книги
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredLoans.map((loan) => {
                  const isReturned = loan.статус === 'возвращена';
                  const isOverdue = loan.статус === 'просрочена';
                  const days = loan.daysRemainingOrOverdue ?? 0;

                  return (
                    <tr
                      key={loan.id}
                      className={`hover:bg-neutral-50/70 transition-colors ${
                        isOverdue ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      {/* ID */}
                      <td className="py-3.5 px-4 font-mono text-neutral-400 tabular-nums">
                        #{loan.id}
                      </td>

                      {/* Book & Author */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-neutral-900 hover:text-amber-800 transition-colors">
                          {loan.book?.название || `Книга #${loan.книга_id}`}
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          {loan.author?.фио || 'Не указан'}
                        </div>
                      </td>

                      {/* Reader */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-neutral-900">
                          {loan.reader?.фио || `Читатель #${loan.читатель_id}`}
                        </div>
                        <div className="text-[11px] font-mono text-neutral-500 tabular-nums">
                          {loan.reader?.телефон || loan.reader?.email || '—'}
                        </div>
                      </td>

                      {/* Librarian */}
                      <td className="py-3.5 px-4 hidden lg:table-cell text-neutral-600">
                        <div>{loan.librarian?.фио || `Библиотекарь #${loan.библиотекарь_id}`}</div>
                        <div className="text-[10px] text-neutral-400">{loan.librarian?.должность}</div>
                      </td>

                      {/* Issue date */}
                      <td className="py-3.5 px-4 font-mono text-neutral-600 tabular-nums whitespace-nowrap">
                        {loan.дата_выдачи}
                      </td>

                      {/* Due date with countdown */}
                      <td className="py-3.5 px-4 font-mono tabular-nums whitespace-nowrap">
                        <div className={isOverdue ? 'text-rose-700 font-semibold' : 'text-neutral-800'}>
                          {loan.срок_возврата}
                        </div>
                        {!isReturned && (
                          <div
                            className={`text-[10px] ${
                              isOverdue
                                ? 'text-rose-600 font-medium'
                                : days === 0
                                ? 'text-amber-600 font-medium'
                                : 'text-neutral-500'
                            }`}
                          >
                            {isOverdue
                              ? `просрочено на ${Math.abs(days)} дн.`
                              : days === 0
                              ? 'сдать сегодня'
                              : `осталось ${days} дн.`}
                          </div>
                        )}
                      </td>

                      {/* Return date */}
                      <td className="py-3.5 px-4 hidden md:table-cell font-mono text-neutral-600 tabular-nums whitespace-nowrap">
                        {loan.дата_возврата || '—'}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isReturned && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            Возвращена
                          </span>
                        )}
                        {loan.статус === 'на руках' && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                            На руках
                          </span>
                        )}
                        {isOverdue && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                            Просрочена
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {/* Read button */}
                          {onOpenBookReader && loan.book && (
                            <button
                              onClick={() => onOpenBookReader(loan.book)}
                              title="Читать книгу в электронном зале (Ночной свет)"
                              className="p-1 text-neutral-500 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-neutral-800 rounded-md transition-colors"
                            >
                              <BookOpen className="w-4 h-4 text-amber-600" />
                            </button>
                          )}

                          {/* Quick return button */}
                          {!isReturned ? (
                            <button
                              onClick={() => returnBook(loan.id)}
                              title="Принять возврат книги в фонд"
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:text-white bg-emerald-50 hover:bg-emerald-600 border border-emerald-200 hover:border-emerald-600 rounded-md transition-all shadow-xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Принять возврат</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-neutral-400 italic">Сдана</span>
                          )}

                          {/* Prolong button */}
                          {!isReturned && (
                            <button
                              onClick={() => handleOpenProlong(loan.id, loan.срок_возврата)}
                              title="Продлить срок возврата (+14 дней)"
                              className="p-1 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete button */}
                          <button
                            onClick={() => {
                              if (confirm(`Удалить запись выдачи #${loan.id}?`)) {
                                deleteLoan(loan.id);
                              }
                            }}
                            title="Удалить запись"
                            className="p-1 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Prolong Modal */}
      {prolongModalLoanId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center gap-2 text-neutral-900">
              <Clock className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-semibold">Продление срока выдачи</h3>
            </div>
            <p className="text-xs text-neutral-500">
              Укажите новую дату, до которой читатель обязуется вернуть книгу:
            </p>

            <form onSubmit={handleConfirmProlong} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Новый срок возврата
                </label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full text-sm rounded-lg border border-neutral-300 px-3 py-2 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setProlongModalLoanId(null)}
                  className="px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors"
                >
                  Сохранить срок
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
