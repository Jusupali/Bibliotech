import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { useTheme } from '../../context/ThemeContext';
import { EnrichedBook, Book } from '../../types/database';
import { bookReadingLibrary, getBookReadingData } from '../../data/bookTexts';
import {
  BookOpen,
  Flame,
  Sun,
  Moon,
  Eye,
  Search,
  Sparkles,
  Sliders,
  CheckCircle2,
  Clock,
  Bookmark,
  FileText,
  Upload,
  ArrowRight,
  ShieldCheck,
  Heart,
} from 'lucide-react';

interface ReadingRoomTabProps {
  onOpenBookReader: (book: Book | EnrichedBook) => void;
  onOpenAIModal?: () => void;
}

export const ReadingRoomTab: React.FC<ReadingRoomTabProps> = ({
  onOpenBookReader,
  onOpenAIModal,
}) => {
  const { enrichedBooks, enrichedLoans, currentUser } = useLibrary();
  const {
    theme,
    effectiveTheme,
    setTheme,
    nightLightIntensity,
    setNightLightIntensity,
    isNightLightEnabled,
    toggleNightLight,
  } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [activeTabSub, setActiveTabSub] = useState<'catalog' | 'my-loans' | 'custom'>('catalog');

  // Custom text reading state
  const [customTitle, setCustomTitle] = useState('Мой литературный фрагмент');
  const [customAuthor, setCustomAuthor] = useState('Читатель');
  const [customTextContent, setCustomTextContent] = useState(
    'Вставьте сюда любой фрагмент книги, статьи или документа для комфортного чтения в режиме ночного света.\n\nМягкий янтарный спектр снизит нагрузку на зрение, устранит вредное синее излучение и сделает вечернее чтение по-настоящему уютным и безопасным для глаз.'
  );

  // Books borrowed by current user if logged in as reader
  const myBorrowedLoans = currentUser
    ? enrichedLoans.filter(
        (l) => l.читатель_id === currentUser.id && l.статус !== 'возвращена'
      )
    : [];

  const genresList = Array.from(new Set(enrichedBooks.map((b) => b.genreName))).filter(Boolean);

  const filteredBooks = enrichedBooks.filter((b) => {
    if (selectedGenre !== 'all' && b.genreName !== selectedGenre) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        b.название.toLowerCase().includes(q) ||
        b.authorName.toLowerCase().includes(q) ||
        b.издательство.toLowerCase().includes(q) ||
        String(b.год_издания).includes(q)
      );
    }
    return true;
  });

  const handleReadCustomText = () => {
    const virtualBook: Book = {
      id: 999999,
      название: customTitle || 'Пользовательский текст',
      автор_id: 1,
      год_издания: new Date().getFullYear(),
      жанр_id: 1,
      издательство: 'Личные заметки',
      количество: 1,
      доступно: 1,
    };
    onOpenBookReader(virtualBook);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomTitle(file.name.replace(/\.[^/.]+$/, ''));
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          setCustomTextContent(text);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Night Light & Eye Comfort Banner */}
      <section className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-transparent p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 mb-2.5">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Оптимизация под ночной свет экрана</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              Электронный читальный зал «БиблиоТех»
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 mt-1.5 leading-relaxed">
              Когда на вашем устройстве или мониторе включен <strong>ночной свет</strong> (Windows Night Light, macOS Night Shift, f.lux или мобильный фильтр синего), обычные контрастные страницы слепят глаза или создают оптические ореолы. Мы подготовили специальные янтарные и книжные палитры, регулировку спектра и книжную типографику.
            </p>
          </div>

          {/* Quick interactive theme & warmth controls inside banner */}
          <div className="w-full lg:w-auto shrink-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xs border border-amber-500/20 rounded-xl p-4 shadow-sm">
            <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-2 flex items-center justify-between">
              <span>Быстрый выбор темы:</span>
              {theme === 'night-light' && (
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                  ✓ Ночной свет
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-1.5 mb-3">
              <button
                onClick={() => setTheme('night-light')}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-all ${
                  theme === 'night-light'
                    ? 'border-amber-500 bg-amber-500/20 text-amber-900 dark:text-amber-200 font-bold ring-1 ring-amber-500'
                    : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                }`}
                title="Режим «Ночной свет» (Теплый янтарь)"
              >
                <Flame className="w-4 h-4 text-amber-500" />
                <span className="text-[10px]">Ночной свет</span>
              </button>

              <button
                onClick={() => setTheme('sepia')}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-all ${
                  theme === 'sepia'
                    ? 'border-amber-600 bg-amber-100 text-amber-950 font-bold ring-1 ring-amber-600'
                    : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                }`}
                title="Книжная сепия (Бумажный оттенок)"
              >
                <Eye className="w-4 h-4 text-amber-700" />
                <span className="text-[10px]">Сепия</span>
              </button>

              <button
                onClick={() => setTheme(effectiveTheme === 'dark' ? 'light' : 'dark')}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-all ${
                  theme === 'dark'
                    ? 'border-sky-500 bg-sky-500/20 text-sky-200 font-bold ring-1 ring-sky-500'
                    : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                }`}
                title="Переключить темную/светлую тему"
              >
                {effectiveTheme === 'dark' ? (
                  <Moon className="w-4 h-4 text-sky-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500" />
                )}
                <span className="text-[10px]">
                  {effectiveTheme === 'dark' ? 'Тёмная' : 'Светлая'}
                </span>
              </button>
            </div>

            {/* Night light intensity slider */}
            <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-700/60">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-neutral-500 dark:text-neutral-400">
                  Тепловой фильтр:
                </span>
                <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
                  {nightLightIntensity}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="75"
                value={nightLightIntensity}
                onChange={(e) => setNightLightIntensity(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-1.5"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Sub-navigation */}
      <div className="flex items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-3 flex-wrap">
        <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
          <button
            onClick={() => setActiveTabSub('catalog')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTabSub === 'catalog'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
            }`}
          >
            Фонд библиотеки ({enrichedBooks.length})
          </button>

          {currentUser && (
            <button
              onClick={() => setActiveTabSub('my-loans')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                activeTabSub === 'my-loans'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              <span>Мои книги на руках</span>
              {myBorrowedLoans.length > 0 && (
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 font-mono">
                  {myBorrowedLoans.length}
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => setActiveTabSub('custom')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTabSub === 'custom'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
            }`}
          >
            Свой текст / Загрузка
          </button>
        </div>

        {/* Search & Genre filter for Catalog */}
        {activeTabSub === 'catalog' && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Поиск по названию или автору..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-base sm:text-xs pl-8 pr-3 py-2 sm:py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 w-full focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="flex-1 sm:flex-none text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 px-2.5 py-2 sm:py-1.5 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 focus:outline-none min-h-[38px] sm:min-h-0"
              >
                <option value="all">Все жанры</option>
                {genresList.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>

              {onOpenAIModal && (
                <button
                  onClick={onOpenAIModal}
                  className="text-xs font-semibold px-3 py-2 sm:py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-200 transition-colors flex items-center justify-center gap-1.5 shrink-0 shadow-2xs min-h-[38px] sm:min-h-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  <span className="hidden sm:inline">ИИ-Поиск</span>
                  <span className="sm:hidden">ИИ</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Catalog View */}
      {activeTabSub === 'catalog' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBooks.map((book) => {
            const hasPreloadedText = Boolean(bookReadingLibrary[book.id]);

            return (
              <div
                key={book.id}
                className="group bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 hover:border-amber-500/50 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200/50 dark:border-amber-800/50">
                      {book.genreName}
                    </span>
                    <span className="font-mono text-[10px] text-neutral-400">
                      #{book.id} · {book.год_издания} г.
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                    {book.название}
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3">
                    {book.authorName}
                  </p>

                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-4 italic">
                    {bookReadingLibrary[book.id]?.epigraph ||
                      `Издательство «${book.издательство}». Находится в зале абонемента: ${book.location || 'Полка 1'}.`}
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                    <span>~{bookReadingLibrary[book.id]?.estimatedMinutes || 15} мин чтения</span>
                  </div>

                  <button
                    onClick={() => onOpenBookReader(book)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 rounded-lg shadow-xs transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Читать</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* My Borrowed Loans View */}
      {activeTabSub === 'my-loans' && (
        <div className="space-y-4">
          {myBorrowedLoans.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-8">
              <BookOpen className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                У вас сейчас нет книг на руках
              </p>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                Вы можете взять любую доступную книгу из каталога фонда или открыть электронную версию прямо здесь.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myBorrowedLoans.map((loan) => (
                <div
                  key={loan.id}
                  className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2 text-xs">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        ● На руках (срок до {loan.срок_возврата})
                      </span>
                      <span className="font-mono text-neutral-400 text-[10px]">
                        Выдача #{loan.id}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                      {loan.book?.название}
                    </h3>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3">
                      {loan.author?.фио}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <span className="text-[11px] text-neutral-500">
                      Выдано: {loan.дата_выдачи}
                    </span>
                    {loan.book && (
                      <button
                        onClick={() => onOpenBookReader(loan.book!)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Читать книгу</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Custom Text Mode */}
      {activeTabSub === 'custom' && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Чтение собственного текста в комфортном режиме
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Вставьте любой текст произведения, статьи или загрузите текстовый файл для чтения с ночным светом.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 block mb-1">
                Название текста:
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 block mb-1">
                Автор:
              </label>
              <input
                type="text"
                value={customAuthor}
                onChange={(e) => setCustomAuthor(e.target.value)}
                className="w-full text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
                Содержимое для чтения:
              </label>
              <label className="text-[11px] text-amber-600 hover:text-amber-700 font-medium cursor-pointer inline-flex items-center gap-1">
                <Upload className="w-3 h-3" />
                <span>Загрузить .txt или .md файл</span>
                <input
                  type="file"
                  accept=".txt,.md,.text"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            <textarea
              rows={8}
              value={customTextContent}
              onChange={(e) => setCustomTextContent(e.target.value)}
              className="w-full text-xs font-mono rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 p-3 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              placeholder="Вставьте сюда текст главы или статьи..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={handleReadCustomText}
              disabled={!customTextContent.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 disabled:opacity-40 rounded-lg shadow-xs transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Открыть в читальном зале</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
