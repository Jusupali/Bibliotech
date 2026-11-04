import React, { useState, useEffect } from 'react';
import { useLibrary } from '../context/LibraryContext';
import { X, BookOpen, User, Calendar, UserCheck, AlertCircle } from 'lucide-react';

interface IssueBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedBookId?: number;
  preselectedReaderId?: number;
}

export const IssueBookModal: React.FC<IssueBookModalProps> = ({
  isOpen,
  onClose,
  preselectedBookId,
  preselectedReaderId,
}) => {
  const { books, readers, librarians, enrichedBooks, issueBook } = useLibrary();

  const today = new Date().toISOString().slice(0, 10);
  
  // Calculate +14 days by default
  const defaultDueDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  };

  const [bookId, setBookId] = useState<number>(preselectedBookId || 0);
  const [readerId, setReaderId] = useState<number>(preselectedReaderId || 0);
  const [librarianId, setLibrarianId] = useState<number>(0);
  const [issueDate, setIssueDate] = useState<string>(today);
  const [dueDate, setDueDate] = useState<string>(defaultDueDate());
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (preselectedBookId) {
        setBookId(preselectedBookId);
      } else {
        // pick first available book
        const firstAvail = books.find((b) => b.доступно > 0);
        setBookId(firstAvail ? firstAvail.id : books[0]?.id || 0);
      }

      if (preselectedReaderId) {
        setReaderId(preselectedReaderId);
      } else if (readers.length > 0) {
        setReaderId(readers[0].id);
      }

      if (librarians.length > 0) {
        setLibrarianId(librarians[0].id);
      }

      setIssueDate(today);
      setDueDate(defaultDueDate());
      setError('');
    }
  }, [isOpen, preselectedBookId, preselectedReaderId, books, readers, librarians, today]);

  if (!isOpen) return null;

  const selectedBook = enrichedBooks.find((b) => b.id === bookId);
  const isAvailable = selectedBook && selectedBook.доступно > 0;

  const setDaysAhead = (days: number) => {
    const base = new Date(issueDate || today);
    base.setDate(base.getDate() + days);
    setDueDate(base.toISOString().slice(0, 10));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!bookId) {
      setError('Пожалуйста, выберите книгу.');
      return;
    }
    if (!readerId) {
      setError('Пожалуйста, выберите читателя.');
      return;
    }
    if (!librarianId) {
      setError('Пожалуйста, укажите ответственного библиотекаря.');
      return;
    }
    if (!dueDate || dueDate < issueDate) {
      setError('Срок возврата не может быть раньше даты выдачи.');
      return;
    }

    const res = issueBook({
      книга_id: Number(bookId),
      читатель_id: Number(readerId),
      библиотекарь_id: Number(librarianId),
      дата_выдачи: issueDate,
      срок_возврата: dueDate,
    });

    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Ошибка при оформлении выдачи.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="bg-white rounded-2xl border border-neutral-200 shadow-xl max-w-lg w-full max-h-[92dvh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-neutral-100 bg-neutral-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-800">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-neutral-900">Оформить выдачу книги</h3>
              <p className="text-[11px] sm:text-xs text-neutral-500">Регистрация выдачи экземпляра в абонемент</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Book Select */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
              Книга из фонда (Ref: Выдача_книг.книга_id &gt; Книги.id)
            </label>
            <select
              value={bookId}
              onChange={(e) => setBookId(Number(e.target.value))}
              className="w-full text-sm rounded-lg border border-neutral-300 px-3 py-2 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
            >
              {enrichedBooks.map((b) => (
                <option key={b.id} value={b.id} disabled={b.доступно <= 0}>
                  {b.название} — {b.authorName} ({b.доступно > 0 ? `доступно: ${b.доступно} из ${b.количество}` : 'нет в наличии'})
                </option>
              ))}
            </select>
            {selectedBook && (
              <div className="mt-1 flex items-center justify-between text-xs text-neutral-500">
                <span>Жанр: {selectedBook.genreName} · {selectedBook.год_издания} г.</span>
                <span className={`font-medium ${selectedBook.доступно > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  Доступно экземпляров: {selectedBook.доступно}
                </span>
              </div>
            )}
          </div>

          {/* Reader Select */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
              Читатель (Ref: Выдача_книг.читатель_id &gt; Читатели.id)
            </label>
            <select
              value={readerId}
              onChange={(e) => setReaderId(Number(e.target.value))}
              className="w-full text-sm rounded-lg border border-neutral-300 px-3 py-2 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
            >
              {readers.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.фио} · {r.телефон}
                </option>
              ))}
            </select>
          </div>

          {/* Librarian Select */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
              Ответственный библиотекарь (Ref: Выдача_книг.библиотекарь_id &gt; Библиотекари.id)
            </label>
            <select
              value={librarianId}
              onChange={(e) => setLibrarianId(Number(e.target.value))}
              className="w-full text-sm rounded-lg border border-neutral-300 px-3 py-2 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
            >
              {librarians.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.фио} ({l.должность})
                </option>
              ))}
            </select>
          </div>

          {/* Dates grid */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                Дата выдачи
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full text-sm rounded-lg border border-neutral-300 px-3 py-2 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                Срок возврата
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-sm rounded-lg border border-neutral-300 px-3 py-2 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>
          </div>

          {/* Quick preset buttons */}
          <div className="flex items-center gap-2 pt-1 text-xs text-neutral-500">
            <span className="shrink-0 font-medium">Быстрый срок:</span>
            <button
              type="button"
              onClick={() => setDaysAhead(7)}
              className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-md transition-colors"
            >
              +7 дней
            </button>
            <button
              type="button"
              onClick={() => setDaysAhead(14)}
              className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-md transition-colors"
            >
              +14 дней (стандарт)
            </button>
            <button
              type="button"
              onClick={() => setDaysAhead(30)}
              className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-md transition-colors"
            >
              +30 дней
            </button>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={!isAvailable}
              className="px-4 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors"
            >
              Подтвердить выдачу
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
