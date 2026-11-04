import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { Book, EnrichedBook } from '../../types/database';
import {
  Search,
  Plus,
  BookOpen,
  Filter,
  Edit2,
  Trash2,
  Share2,
  History,
  X,
  Check,
  AlertCircle,
  MapPin,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface BooksTabProps {
  onIssueBook: (bookId: number) => void;
  onOpenBookReader?: (book: EnrichedBook) => void;
  onOpenAIModal?: () => void;
}

export const BooksTab: React.FC<BooksTabProps> = ({
  onIssueBook,
  onOpenBookReader,
  onOpenAIModal,
}) => {
  const {
    enrichedBooks,
    authors,
    genres,
    addBook,
    updateBook,
    deleteBook,
    enrichedLoans,
  } = useLibrary();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenreId, setSelectedGenreId] = useState<number | 'all'>('all');
  const [selectedAuthorId, setSelectedAuthorId] = useState<number | 'all'>('all');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // Modal states
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [historyBook, setHistoryBook] = useState<EnrichedBook | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [authorId, setAuthorId] = useState<number>(authors[0]?.id || 1);
  const [genreId, setGenreId] = useState<number>(genres[0]?.id || 1);
  const [year, setYear] = useState<number>(2023);
  const [publisher, setPublisher] = useState('');
  const [quantity, setQuantity] = useState<number>(3);
  const [available, setAvailable] = useState<number>(3);
  const [location, setLocation] = useState('');
  const [arrivalDate, setArrivalDate] = useState('');
  const [formError, setFormError] = useState('');

  const filteredBooks = enrichedBooks.filter((book) => {
    if (selectedGenreId !== 'all' && book.жанр_id !== selectedGenreId) return false;
    if (selectedAuthorId !== 'all' && book.автор_id !== selectedAuthorId) return false;
    if (onlyAvailable && book.доступно <= 0) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matches =
        book.название.toLowerCase().includes(q) ||
        book.authorName.toLowerCase().includes(q) ||
        book.издательство.toLowerCase().includes(q) ||
        (book.location && book.location.toLowerCase().includes(q)) ||
        String(book.год_издания).includes(q) ||
        String(book.id) === q;
      if (!matches) return false;
    }

    return true;
  });

  const handleOpenAdd = () => {
    setEditingBook(null);
    setTitle('');
    setAuthorId(authors[0]?.id || 1);
    setGenreId(genres[0]?.id || 1);
    setYear(new Date().getFullYear());
    setPublisher('');
    setQuantity(3);
    setAvailable(3);
    setLocation('Зал абонемента, Стеллаж 1');
    setArrivalDate(new Date().toISOString().slice(0, 10));
    setFormError('');
    setIsAddEditModalOpen(true);
  };

  const handleOpenEdit = (book: EnrichedBook) => {
    setEditingBook(book);
    setTitle(book.название);
    setAuthorId(book.автор_id);
    setGenreId(book.жанр_id);
    setYear(book.год_издания);
    setPublisher(book.издательство);
    setQuantity(book.количество);
    setAvailable(book.доступно);
    setLocation(book.location || '');
    setArrivalDate(book.arrival_date || '');
    setFormError('');
    setIsAddEditModalOpen(true);
  };

  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim()) {
      setFormError('Укажите название книги.');
      return;
    }
    if (!publisher.trim()) {
      setFormError('Укажите издательство.');
      return;
    }
    if (Number(quantity) < 1) {
      setFormError('Общее количество экземпляров должно быть не менее 1.');
      return;
    }
    if (Number(available) > Number(quantity)) {
      setFormError('Доступное количество не может превышать общее количество экземпляров.');
      return;
    }

    if (editingBook) {
      updateBook(editingBook.id, {
        название: title.trim(),
        автор_id: Number(authorId),
        жанр_id: Number(genreId),
        год_издания: Number(year),
        издательство: publisher.trim(),
        количество: Number(quantity),
        доступно: Number(available),
        location: location.trim(),
        arrival_date: arrivalDate || undefined,
      });
    } else {
      addBook({
        название: title.trim(),
        автор_id: Number(authorId),
        жанр_id: Number(genreId),
        год_издания: Number(year),
        издательство: publisher.trim(),
        количество: Number(quantity),
        доступно: Number(available),
        location: location.trim() || 'Основное хранилище',
        arrival_date: arrivalDate || new Date().toISOString().slice(0, 10),
      });
    }

    setIsAddEditModalOpen(false);
  };

  // History for modal
  const bookLoansHistory = historyBook
    ? enrichedLoans.filter((l) => l.книга_id === historyBook.id)
    : [];

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search */}
          <div className="relative min-w-[240px] flex-1 max-w-sm">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по названию, автору, издательству, стеллажу..."
              className="w-full text-xs rounded-lg border border-neutral-200 pl-9 pr-3 py-2 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
            />
          </div>

          {/* Genre Filter */}
          <select
            value={selectedGenreId}
            onChange={(e) =>
              setSelectedGenreId(e.target.value === 'all' ? 'all' : Number(e.target.value))
            }
            className="text-xs rounded-lg border border-neutral-200 px-3 py-2 bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
          >
            <option value="all">Все жанры ({genres.length})</option>
            {genres.map((g) => (
              <option key={g.id} value={g.id}>
                {g.название}
              </option>
            ))}
          </select>

          {/* Author Filter */}
          <select
            value={selectedAuthorId}
            onChange={(e) =>
              setSelectedAuthorId(e.target.value === 'all' ? 'all' : Number(e.target.value))
            }
            className="text-xs rounded-lg border border-neutral-200 px-3 py-2 bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
          >
            <option value="all">Все авторы ({authors.length})</option>
            {authors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.фио}
              </option>
            ))}
          </select>

          {/* Available only toggle */}
          <label className="flex items-center gap-1.5 text-xs text-neutral-600 cursor-pointer select-none bg-neutral-100 hover:bg-neutral-200/80 px-2.5 py-1.5 rounded-lg transition-colors">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              className="rounded border-neutral-300 text-amber-600 focus:ring-amber-500"
            />
            <span>Только в наличии</span>
          </label>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* AI Search Button */}
          {onOpenAIModal && (
            <button
              onClick={onOpenAIModal}
              title="Интеллектуальный поиск автора или книги через Gemini AI"
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-900 dark:text-amber-200 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-lg shadow-2xs transition-colors shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>ИИ-Поиск (Gemini)</span>
            </button>
          )}

          {/* Add Book Button */}
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Добавить книгу в фонд</span>
          </button>
        </div>
      </div>

      {/* Mobile Responsive Cards View (< md) */}
      <div className="md:hidden space-y-3">
        {filteredBooks.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 p-6 text-center text-neutral-500">
            <BookOpen className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-neutral-700">Книги не найдены</p>
            <p className="text-xs text-neutral-400 mt-1">
              Попробуйте изменить поисковый запрос или фильтры
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Добавить книгу в фонд
            </button>
          </div>
        ) : (
          filteredBooks.map((book) => {
            const isAvailable = book.доступно > 0;
            const ratio = Math.round((book.доступно / (book.количество || 1)) * 100);

            return (
              <div
                key={book.id}
                className="bg-white rounded-xl border border-neutral-200 p-4 space-y-3 shadow-xs"
              >
                {/* Header: ID + Availability badge */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-neutral-400">
                    #{book.id}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      isAvailable
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isAvailable ? 'bg-emerald-600' : 'bg-rose-600'
                      }`}
                    />
                    <span>
                      {isAvailable
                        ? `Доступно: ${book.доступно} из ${book.количество}`
                        : 'Все выданы (нет на полке)'}
                    </span>
                  </span>
                </div>

                {/* Title & Author */}
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 leading-snug">
                    {book.название}
                  </h4>
                  <p className="text-xs text-neutral-600 mt-0.5 font-medium">
                    {book.authorName}
                  </p>
                  <div className="text-[11px] text-neutral-500 flex items-center gap-1.5 flex-wrap mt-1">
                    <span className="bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-700 font-medium">
                      {book.genreName}
                    </span>
                    <span>·</span>
                    <span>{book.издательство}</span>
                    <span>·</span>
                    <span>{book.год_издания} г.</span>
                  </div>
                </div>

                {/* Location */}
                {book.location && (
                  <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-100 flex items-center gap-1.5 text-xs text-neutral-700">
                    <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="text-[11px]">{book.location}</span>
                  </div>
                )}

                {/* Stock progress bar */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-1">
                    <span>Наличие в фонде</span>
                    <span className="font-mono tabular-nums">
                      {book.доступно} / {book.количество} экз. ({ratio}%)
                    </span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        book.доступно === 0
                          ? 'bg-rose-500'
                          : book.доступно < book.количество
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, ratio))}%` }}
                    />
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div className="pt-2 border-t border-neutral-100 flex flex-wrap gap-2">
                  {onOpenBookReader && (
                    <button
                      onClick={() => onOpenBookReader(book)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors min-h-[40px]"
                    >
                      <BookOpen className="w-4 h-4 text-amber-600" />
                      <span>Читать</span>
                    </button>
                  )}

                  {isAvailable && (
                    <button
                      onClick={() => onIssueBook(book.id)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 rounded-lg shadow-xs transition-colors min-h-[40px]"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                      <span>Выдать</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenEdit(book)}
                    title="Редактировать книгу"
                    className="p-2 text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Удалить книгу «${book.название}» из фонда библиотеки?`)) {
                        deleteBook(book.id);
                      }
                    }}
                    title="Удалить книгу"
                    className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Main Desktop Books Table (hidden on mobile < md) */}
      <div className="hidden md:block bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/70 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 font-mono">ID</th>
                <th className="py-3 px-4">Название книги (title)</th>
                <th className="py-3 px-4">Автор (author_id)</th>
                <th className="py-3 px-4 hidden md:table-cell">Жанр (genre_id)</th>
                <th className="py-3 px-4 hidden lg:table-cell">Местоположение (location)</th>
                <th className="py-3 px-4 hidden sm:table-cell">Год</th>
                <th className="py-3 px-4 text-center">Фонд</th>
                <th className="py-3 px-4 text-center">Доступно</th>
                <th className="py-3 px-4 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-neutral-500">
                    <BookOpen className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-neutral-700">Книги не найдены</p>
                    <p className="text-xs text-neutral-400 mt-1">
                      Попробуйте изменить поисковый запрос или фильтры
                    </p>
                  </td>
                </tr>
              ) : (
                filteredBooks.map((book) => {
                  const isAvailable = book.доступно > 0;
                  const ratio = Math.round((book.доступно / (book.количество || 1)) * 100);

                  return (
                    <tr key={book.id} className="hover:bg-neutral-50/70 transition-colors">
                      {/* ID */}
                      <td className="py-3 px-4 font-mono text-neutral-400 tabular-nums">
                        #{book.id}
                      </td>

                      {/* Title & Publisher */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-neutral-900">{book.название}</div>
                        <div className="text-[11px] text-neutral-500 flex items-center gap-1.5 flex-wrap mt-0.5">
                          <span>{book.издательство}</span>
                          <span>·</span>
                          <span className="md:hidden">{book.genreName} ·</span>
                          <span>{book.год_издания} г.</span>
                        </div>
                      </td>

                      {/* Author */}
                      <td className="py-3 px-4 text-neutral-700">
                        <div>{book.authorName}</div>
                      </td>

                      {/* Genre */}
                      <td className="py-3 px-4 hidden md:table-cell text-neutral-600">
                        {book.genreName}
                      </td>

                      {/* Location (RunSQL new field) */}
                      <td className="py-3 px-4 hidden lg:table-cell text-neutral-600">
                        {book.location ? (
                          <div className="flex items-center gap-1 text-[11px] text-neutral-700 bg-neutral-100/70 px-2 py-0.5 rounded max-w-[180px] truncate">
                            <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                            <span className="truncate">{book.location}</span>
                          </div>
                        ) : (
                          <span className="text-neutral-400 text-[11px]">Основной зал</span>
                        )}
                      </td>

                      {/* Year */}
                      <td className="py-3 px-4 hidden sm:table-cell font-mono text-neutral-600 tabular-nums">
                        {book.год_издания}
                      </td>

                      {/* Total copies */}
                      <td className="py-3 px-4 text-center font-mono tabular-nums text-neutral-600">
                        {book.количество} экз.
                      </td>

                      {/* Available copies with stock indicator */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span
                            className={`font-mono font-semibold tabular-nums ${
                              isAvailable ? 'text-emerald-700' : 'text-rose-600'
                            }`}
                          >
                            {book.доступно} из {book.количество}
                          </span>
                          <div className="w-16 h-1 bg-neutral-200 rounded-full mt-1 overflow-hidden">
                            <div
                              className={`h-full ${
                                ratio > 50
                                  ? 'bg-emerald-500'
                                  : ratio > 0
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(0, ratio))}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {/* Read Book button */}
                          {onOpenBookReader && (
                            <button
                              onClick={() => onOpenBookReader(book)}
                              title="Открыть книгу в комфортном режиме чтения (Ночной свет)"
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-neutral-800 dark:text-neutral-100 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-md transition-colors"
                            >
                              <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                              <span>Читать</span>
                            </button>
                          )}

                          {/* Quick issue button */}
                          <button
                            onClick={() => onIssueBook(book.id)}
                            disabled={!isAvailable}
                            title={isAvailable ? 'Выдать книгу читателю' : 'Все экземпляры выданы'}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 disabled:opacity-40 disabled:pointer-events-none border border-amber-200 rounded-md transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Выдать</span>
                          </button>

                          {/* History */}
                          <button
                            onClick={() => setHistoryBook(book)}
                            title="История выдач и карточка хранения"
                            className="p-1 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
                          >
                            <History className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEdit(book)}
                            title="Редактировать запись книги"
                            className="p-1 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`Удалить книгу «${book.название}» из фонда?`)) {
                                deleteBook(book.id);
                              }
                            }}
                            title="Списать книгу"
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

      {/* Add / Edit Book Modal */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
              <h3 className="text-base font-semibold text-neutral-900">
                {editingBook ? 'Редактирование книги' : 'Добавление книги в каталог (Table books)'}
              </h3>
              <button
                onClick={() => setIsAddEditModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBook} className="p-6 space-y-3.5 max-h-[85vh] overflow-y-auto">
              {formError && (
                <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                  Название книги (title)
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Например: Преступление и наказание"
                  className="w-full text-sm rounded-lg border border-neutral-300 px-3 py-2 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>

              {/* Author & Genre Selection (Foreign Keys) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                    Автор (author_id &gt; authors.id)
                  </label>
                  <select
                    value={authorId}
                    onChange={(e) => setAuthorId(Number(e.target.value))}
                    className="w-full text-sm rounded-lg border border-neutral-300 px-3 py-2 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  >
                    {authors.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.фио} ({a.страна})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                    Жанр (genre_id &gt; genres.id)
                  </label>
                  <select
                    value={genreId}
                    onChange={(e) => setGenreId(Number(e.target.value))}
                    className="w-full text-sm rounded-lg border border-neutral-300 px-3 py-2 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  >
                    {genres.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.название}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location & Arrival Date (RunSQL fields) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-neutral-50 p-3 rounded-lg border border-neutral-200/80">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                    Местоположение (location)
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Зал 1, Стеллаж 3, Полка Б"
                    className="w-full text-sm rounded-lg border border-neutral-300 px-3 py-2 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  />
                  <span className="text-[10px] text-neutral-500 mt-0.5 block">
                    Где хранится физический экземпляр
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                    Дата поступления (arrival_date)
                  </label>
                  <input
                    type="date"
                    value={arrivalDate}
                    onChange={(e) => setArrivalDate(e.target.value)}
                    className="w-full text-sm rounded-lg border border-neutral-300 px-3 py-2 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  />
                  <span className="text-[10px] text-neutral-500 mt-0.5 block">
                    Дата внесения в библиотечный фонд
                  </span>
                </div>
              </div>

              {/* Publisher & Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                    Издательство (publisher)
                  </label>
                  <input
                    type="text"
                    required
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                    placeholder="АСТ, Эксмо, Азбука..."
                    className="w-full text-sm rounded-lg border border-neutral-300 px-3 py-2 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                    Год издания (year_published)
                  </label>
                  <input
                    type="number"
                    required
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full text-sm rounded-lg border border-neutral-300 px-3 py-2 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  />
                </div>
              </div>

              {/* Quantity & Available */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                    Всего экземпляров (quantity)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setQuantity(val);
                      if (!editingBook) setAvailable(val);
                    }}
                    className="w-full text-sm rounded-lg border border-neutral-300 px-3 py-2 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                    Доступно (available)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={quantity}
                    required
                    value={available}
                    onChange={(e) => setAvailable(Number(e.target.value))}
                    className="w-full text-sm rounded-lg border border-neutral-300 px-3 py-2 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-sm transition-colors"
                >
                  {editingBook ? 'Сохранить изменения' : 'Внести в фонд'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Book Loan History & Physical Placement Modal */}
      {historyBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-base font-semibold text-neutral-900">
                  Карточка издания: «{historyBook.название}»
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {historyBook.authorName} · {historyBook.genreName} · {historyBook.издательство}, {historyBook.год_издания} г.
                </p>
              </div>
              <button
                onClick={() => setHistoryBook(null)}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Placement Details Card */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-xs">
              <div>
                <span className="text-neutral-400 block text-[11px]">Место на стеллаже (location):</span>
                <span className="font-semibold text-neutral-800 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  {historyBook.location || 'Основной зал'}
                </span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[11px]">Поступила в библиотеку (arrival_date):</span>
                <span className="font-mono text-neutral-800 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                  {historyBook.arrival_date || 'Не указана'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
                История выдач (Всего записей: {bookLoansHistory.length})
              </h4>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {bookLoansHistory.length === 0 ? (
                  <p className="text-xs text-neutral-400 py-6 text-center">
                    По этой книге пока не зафиксировано операций выдачи.
                  </p>
                ) : (
                  bookLoansHistory.map((loan) => (
                    <div
                      key={loan.id}
                      className="p-3 rounded-lg border border-neutral-200 bg-neutral-50/50 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-neutral-900">
                          {loan.reader?.фио || `Читатель #${loan.читатель_id}`}
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          Выдано: {loan.дата_выдачи} · Срок: {loan.срок_возврата}
                          {loan.дата_возврата && ` · Возврат: ${loan.дата_возврата}`}
                        </div>
                      </div>
                      <div>
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                            loan.статус === 'возвращена'
                              ? 'text-emerald-800 bg-emerald-100/60'
                              : loan.статус === 'просрочена'
                              ? 'text-rose-700 bg-rose-100/60'
                              : 'text-amber-800 bg-amber-100/60'
                          }`}
                        >
                          {loan.статус}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-neutral-100">
              <button
                onClick={() => setHistoryBook(null)}
                className="px-4 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
