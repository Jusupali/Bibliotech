import React, { useState, useEffect, useRef } from 'react';
import { Book, EnrichedBook } from '../types/database';
import { getBookReadingData, BookReadingData, BookChapter } from '../data/bookTexts';
import { useTheme } from '../context/ThemeContext';
import {
  X,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Flame,
  Type,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  Search,
  Sliders,
  Sparkles,
  AlignLeft,
  AlignJustify,
  FileText,
  RotateCcw,
  Check,
  Eye,
} from 'lucide-react';

interface BookReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | EnrichedBook | null;
  authorName?: string;
  genreName?: string;
}

type ReaderTheme = 'night-light' | 'sepia' | 'dark' | 'light' | 'emerald';
type ReaderFont = 'serif' | 'sans' | 'mono';
type ReaderWidth = 'narrow' | 'normal' | 'wide';

export const BookReaderModal: React.FC<BookReaderModalProps> = ({
  isOpen,
  onClose,
  book,
  authorName,
  genreName,
}) => {
  const { nightLightIntensity, setNightLightIntensity, isNightLightEnabled, toggleNightLight } =
    useTheme();

  // Reading state
  const [readingData, setReadingData] = useState<BookReadingData | null>(null);
  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showToc, setShowToc] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Ergonomic Preferences (persisted in localStorage)
  const [readerTheme, setReaderTheme] = useState<ReaderTheme>(() => {
    try {
      const saved = localStorage.getItem('bibliotech_reader_theme');
      if (saved && ['night-light', 'sepia', 'dark', 'light', 'emerald'].includes(saved)) {
        return saved as ReaderTheme;
      }
    } catch {}
    return 'night-light'; // Default to Night Light for maximum comfort!
  });

  const [fontSize, setFontSize] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('bibliotech_reader_fontsize');
      if (saved) return Number(saved) || 19;
    } catch {}
    return 19;
  });

  const [lineHeight, setLineHeight] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('bibliotech_reader_lineheight');
      if (saved) return Number(saved) || 1.75;
    } catch {}
    return 1.75;
  });

  const [fontFamily, setFontFamily] = useState<ReaderFont>(() => {
    try {
      const saved = localStorage.getItem('bibliotech_reader_font');
      if (saved && ['serif', 'sans', 'mono'].includes(saved)) {
        return saved as ReaderFont;
      }
    } catch {}
    return 'serif';
  });

  const [columnWidth, setColumnWidth] = useState<ReaderWidth>('normal');
  const [textAlign, setTextAlign] = useState<'justify' | 'left'>('justify');

  // Bookmarks
  const [bookmarks, setBookmarks] = useState<
    { id: string; bookId: number; chapterIdx: number; title: string; date: string }[]
  >(() => {
    try {
      const saved = localStorage.getItem('bibliotech_reader_bookmarks');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Reading Progress (scroll percentage)
  const [progress, setProgress] = useState(0);
  const contentScrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Custom text input mode
  const [isCustomTextMode, setIsCustomTextMode] = useState(false);
  const [customText, setCustomText] = useState('');

  // Load book data
  useEffect(() => {
    if (!book) return;
    const author = authorName || ('authorName' in book ? (book as any).authorName : 'Автор неизвестен');
    const genre = genreName || ('genreName' in book ? (book as any).genreName : 'Литература');
    const data = getBookReadingData(book.id, book.название, author, book.год_издания, genre);
    setReadingData(data);
    setCurrentChapterIdx(0);
    setProgress(0);
  }, [book, authorName, genreName]);

  // Persist preferences
  useEffect(() => {
    try {
      localStorage.setItem('bibliotech_reader_theme', readerTheme);
      localStorage.setItem('bibliotech_reader_fontsize', String(fontSize));
      localStorage.setItem('bibliotech_reader_lineheight', String(lineHeight));
      localStorage.setItem('bibliotech_reader_font', fontFamily);
    } catch (e) {
      console.error(e);
    }
  }, [readerTheme, fontSize, lineHeight, fontFamily]);

  // Handle scroll progress
  const handleScroll = () => {
    const el = contentScrollRef.current;
    if (!el) return;
    const total = el.scrollHeight - el.clientHeight;
    if (total <= 0) {
      setProgress(100);
      return;
    }
    const current = Math.round((el.scrollTop / total) * 100);
    setProgress(Math.min(100, Math.max(0, current)));
  };

  // Bookmark toggle
  const isCurrentChapterBookmarked = bookmarks.some(
    (b) => b.bookId === book?.id && b.chapterIdx === currentChapterIdx
  );

  const toggleBookmark = () => {
    if (!book || !readingData) return;
    if (isCurrentChapterBookmarked) {
      const next = bookmarks.filter(
        (b) => !(b.bookId === book.id && b.chapterIdx === currentChapterIdx)
      );
      setBookmarks(next);
      localStorage.setItem('bibliotech_reader_bookmarks', JSON.stringify(next));
    } else {
      const newBookmark = {
        id: `${book.id}-${currentChapterIdx}-${Date.now()}`,
        bookId: book.id,
        chapterIdx: currentChapterIdx,
        title:
          readingData.chapters[currentChapterIdx]?.title || `Глава ${currentChapterIdx + 1}`,
        date: new Date().toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      const next = [newBookmark, ...bookmarks];
      setBookmarks(next);
      localStorage.setItem('bibliotech_reader_bookmarks', JSON.stringify(next));
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showSettings) setShowSettings(false);
        else if (showToc) setShowToc(false);
        else if (isFullscreen) setIsFullscreen(false);
        else onClose();
      } else if (e.key === 'f' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setShowSearch((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showSettings, showToc, isFullscreen, onClose]);

  if (!isOpen || !book) return null;

  const currentChapter: BookChapter | undefined = readingData?.chapters[currentChapterIdx];

  // Theme styling definitions for high-comfort reading
  const themeStyles: Record<
    ReaderTheme,
    {
      bg: string;
      headerBg: string;
      text: string;
      subtext: string;
      border: string;
      accent: string;
      cardBg: string;
      highlight: string;
    }
  > = {
    // 🕯️ Ночной свет: теплый глубокий кофейно-янтарный, исключающий синий спектр и блики
    'night-light': {
      bg: 'bg-[#181410]',
      headerBg: 'bg-[#221c16]/95 border-[#382d23]',
      text: 'text-[#f5ebdd]',
      subtext: 'text-[#bfab93]',
      border: 'border-[#382d23]',
      accent: 'text-amber-400 bg-amber-950/60 border-amber-800/80',
      cardBg: 'bg-[#251e18]',
      highlight: 'bg-amber-500/25 text-amber-200',
    },
    // 📜 Бумага / Сепия: мягкий тон старинной книги без ярких бликов
    sepia: {
      bg: 'bg-[#f8f3e8]',
      headerBg: 'bg-[#efe6d4]/95 border-[#ded1ba]',
      text: 'text-[#2e2417]',
      subtext: 'text-[#685741]',
      border: 'border-[#ded1ba]',
      accent: 'text-amber-800 bg-amber-100 border-amber-300',
      cardBg: 'bg-[#efe6d4]',
      highlight: 'bg-amber-200 text-amber-950',
    },
    // 🌙 OLED / Тёмный бархат: нейтральный темный фон без чрезмерного контраста
    dark: {
      bg: 'bg-[#111317]',
      headerBg: 'bg-[#1a1d24]/95 border-[#282d38]',
      text: 'text-[#e5e9f0]',
      subtext: 'text-[#8892a4]',
      border: 'border-[#282d38]',
      accent: 'text-sky-400 bg-sky-950/60 border-sky-800/80',
      cardBg: 'bg-[#1a1d24]',
      highlight: 'bg-sky-500/25 text-sky-200',
    },
    // ☀️ Дневной мягкий: молочно-белый не ослепляющий фон
    light: {
      bg: 'bg-[#faf9f5]',
      headerBg: 'bg-white/95 border-neutral-200',
      text: 'text-neutral-900',
      subtext: 'text-neutral-500',
      border: 'border-neutral-200',
      accent: 'text-amber-700 bg-amber-50 border-amber-200',
      cardBg: 'bg-white',
      highlight: 'bg-amber-100 text-amber-900',
    },
    // 🍃 Мягкий нефрит: снижает напряжение цилиарной мышцы глаза
    emerald: {
      bg: 'bg-[#121915]',
      headerBg: 'bg-[#19241e]/95 border-[#27382f]',
      text: 'text-[#e2f0e6]',
      subtext: 'text-[#8ba794]',
      border: 'border-[#27382f]',
      accent: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/80',
      cardBg: 'bg-[#19241e]',
      highlight: 'bg-emerald-500/25 text-emerald-200',
    },
  };

  const currentTheme = themeStyles[readerTheme];

  // Column width classes
  const widthClasses = {
    narrow: 'max-w-xl',
    normal: 'max-w-3xl',
    wide: 'max-w-4xl',
  };

  // Font family styles
  const fontStyle =
    fontFamily === 'serif'
      ? { fontFamily: "'Literata', 'Merriweather', 'Georgia', serif" }
      : fontFamily === 'sans'
      ? { fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }
      : { fontFamily: "'JetBrains Mono', monospace" };

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 flex flex-col ${currentTheme.bg} ${currentTheme.text} transition-colors duration-200`}
    >
      {/* Top Reading Controls Header */}
      <header
        className={`sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 h-14 border-b ${currentTheme.headerBg} backdrop-blur-md transition-colors`}
      >
        {/* Left: Book Meta & TOC */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setShowToc(!showToc)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border ${currentTheme.border} hover:opacity-85 transition-opacity shrink-0`}
            title="Оглавление и главы"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Оглавление</span>
            <span className="font-mono text-[10px] opacity-75">
              {currentChapterIdx + 1}/{readingData?.chapters.length || 1}
            </span>
          </button>

          <div className="min-w-0 truncate">
            <h1 className="text-xs sm:text-sm font-semibold truncate leading-tight">
              {book.название}
            </h1>
            <p className={`text-[11px] ${currentTheme.subtext} truncate hidden sm:block`}>
              {authorName || ('authorName' in book ? (book as any).authorName : '')} · {book.год_издания} г.
            </p>
          </div>
        </div>

        {/* Center: Night Light Quick Status Indicator */}
        <div className="hidden lg:flex items-center gap-2">
          {readerTheme === 'night-light' && (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Flame className="w-3 h-3 text-amber-400 animate-pulse" />
              <span>Режим «Ночной свет» активен</span>
            </div>
          )}
        </div>

        {/* Right: Reading Adjustments & Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Bookmark Button */}
          <button
            onClick={toggleBookmark}
            title={isCurrentChapterBookmarked ? 'Закладка сохранена' : 'Поставить закладку на главу'}
            className={`p-1.5 rounded-lg border transition-colors ${
              isCurrentChapterBookmarked
                ? `${currentTheme.accent}`
                : `${currentTheme.border} opacity-80 hover:opacity-100`
            }`}
          >
            {isCurrentChapterBookmarked ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>

          {/* Quick Search in Chapter */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            title="Поиск по тексту (Ctrl+F)"
            className={`p-1.5 rounded-lg border ${currentTheme.border} opacity-80 hover:opacity-100 transition-opacity`}
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Display & Comfort Settings Toggle */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            title="Настройки комфорта: шрифт, темы, ночной свет"
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border ${
              showSettings ? currentTheme.accent : currentTheme.border
            } hover:opacity-90 transition-all`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Комфорт</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Выйти из полноэкранного режима' : 'Полноэкранный режим чтения'}
            className={`p-1.5 rounded-lg border ${currentTheme.border} opacity-80 hover:opacity-100 transition-opacity hidden sm:flex`}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close Reader */}
          <button
            onClick={onClose}
            title="Закрыть читальный зал (Esc)"
            className={`p-1.5 rounded-lg border ${currentTheme.border} opacity-80 hover:opacity-100 hover:text-rose-400 transition-colors ml-1`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Progress Bar under header */}
      <div className="w-full h-1 bg-black/10 dark:bg-white/10 overflow-hidden">
        <div
          className="h-full bg-amber-500 transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Quick Search Bar Dropdown */}
      {showSearch && (
        <div className={`px-4 py-2 border-b ${currentTheme.headerBg} flex items-center gap-2`}>
          <Search className="w-4 h-4 opacity-60" />
          <input
            type="text"
            placeholder="Поиск по текущей главе..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`flex-1 bg-transparent text-xs sm:text-sm focus:outline-none ${currentTheme.text}`}
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs opacity-60 hover:opacity-100"
            >
              Очистить
            </button>
          )}
          <button
            onClick={() => setShowSearch(false)}
            className="text-xs opacity-60 hover:opacity-100"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Reading Container */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Table of Contents Drawer */}
        {showToc && (
          <aside
            className={`fixed sm:static inset-y-0 left-0 z-30 w-full sm:w-80 shrink-0 border-r ${currentTheme.headerBg} flex flex-col p-4 overflow-y-auto animate-in slide-in-from-left-4 duration-200 shadow-2xl`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider opacity-70">
                Оглавление книги
              </h2>
              <button
                onClick={() => setShowToc(false)}
                className="p-2 opacity-70 hover:opacity-100 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chapter List */}
            <div className="space-y-1">
              {readingData?.chapters.map((ch, idx) => {
                const isSelected = currentChapterIdx === idx;
                const hasBookmark = bookmarks.some(
                  (b) => b.bookId === book.id && b.chapterIdx === idx
                );

                return (
                  <button
                    key={ch.id}
                    onClick={() => {
                      setCurrentChapterIdx(idx);
                      setShowToc(false);
                      contentScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors flex items-start justify-between gap-2 ${
                      isSelected
                        ? currentTheme.accent
                        : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="leading-snug">
                      <div className="font-semibold">{ch.title}</div>
                      <div className={`text-[10px] ${currentTheme.subtext} mt-0.5`}>
                        {ch.paragraphs.length} абзацев
                      </div>
                    </div>
                    {hasBookmark && (
                      <Bookmark className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Saved Bookmarks List */}
            {bookmarks.filter((b) => b.bookId === book.id).length > 0 && (
              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="text-[11px] font-semibold opacity-70 mb-2 flex items-center gap-1.5">
                  <Bookmark className="w-3 h-3 text-amber-400" />
                  <span>Сохраненные закладки</span>
                </div>
                <div className="space-y-1.5">
                  {bookmarks
                    .filter((b) => b.bookId === book.id)
                    .map((bm) => (
                      <button
                        key={bm.id}
                        onClick={() => {
                          setCurrentChapterIdx(bm.chapterIdx);
                          setShowToc(false);
                          contentScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-full text-left p-2 rounded text-[11px] bg-black/5 dark:bg-white/5 hover:opacity-100 opacity-80 transition-opacity"
                      >
                        <div className="font-medium truncate">{bm.title}</div>
                        <div className={`text-[9px] ${currentTheme.subtext}`}>{bm.date}</div>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </aside>
        )}

        {/* Text Area */}
        <div
          ref={contentScrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 sm:py-12 scroll-smooth"
        >
          <div className={`${widthClasses[columnWidth]} mx-auto`}>
            {/* Book Title Header inside reader */}
            <div className="mb-10 text-center border-b border-current/15 pb-8">
              <div className={`text-xs font-medium uppercase tracking-widest ${currentTheme.subtext} mb-2`}>
                {readingData?.genre} · {readingData?.year}
              </div>
              <h2
                className="text-2xl sm:text-3xl font-bold tracking-tight mb-2"
                style={fontStyle}
              >
                {readingData?.title}
              </h2>
              <div className="text-sm sm:text-base opacity-80 mb-4" style={fontStyle}>
                {readingData?.author}
              </div>

              {readingData?.epigraph && (
                <div className="max-w-md mx-auto italic text-xs sm:text-sm opacity-70 border-l-2 border-amber-500/60 pl-3 py-1 my-4 text-left">
                  «{readingData.epigraph}»
                </div>
              )}

              {/* Night light hint if current mode */}
              {readerTheme === 'night-light' && (
                <div className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full bg-amber-500/10 text-amber-400/90 border border-amber-500/20 mt-2">
                  <Eye className="w-3 h-3 text-amber-400" />
                  <span>Цветовая гамма адаптирована для экранов с ночным светом и снижения усталости глаз</span>
                </div>
              )}
            </div>

            {/* Current Chapter Title */}
            {currentChapter && (
              <div className="mb-8">
                <h3
                  className="text-lg sm:text-xl font-bold mb-1"
                  style={fontStyle}
                >
                  {currentChapter.title}
                </h3>
                <div className={`text-xs ${currentTheme.subtext}`}>
                  Время чтения главы ~ {Math.max(2, Math.round(currentChapter.paragraphs.join(' ').length / 800))} мин.
                </div>
              </div>
            )}

            {/* Paragraphs */}
            {currentChapter ? (
              <div
                className="reader-content select-text transition-all leading-relaxed"
                style={{
                  ...fontStyle,
                  fontSize: `${fontSize}px`,
                  lineHeight: lineHeight,
                  textAlign: textAlign,
                }}
              >
                {currentChapter.paragraphs.map((para, pIdx) => {
                  // Highlight search matches
                  if (searchQuery.trim() && para.toLowerCase().includes(searchQuery.toLowerCase())) {
                    const regex = new RegExp(`(${searchQuery.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
                    const parts = para.split(regex);
                    return (
                      <p key={pIdx}>
                        {parts.map((part, i) =>
                          part.toLowerCase() === searchQuery.toLowerCase() ? (
                            <mark key={i} className={`rounded px-0.5 ${currentTheme.highlight}`}>
                              {part}
                            </mark>
                          ) : (
                            part
                          )
                        )}
                      </p>
                    );
                  }

                  return <p key={pIdx}>{para}</p>;
                })}
              </div>
            ) : (
              <div className="text-center py-12 opacity-60">Текст произведения загружается...</div>
            )}

            {/* Bottom Chapter Navigation */}
            {readingData && (
              <div className="mt-14 pt-8 border-t border-current/15 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  onClick={() => {
                    if (currentChapterIdx > 0) {
                      setCurrentChapterIdx((prev) => prev - 1);
                      contentScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  disabled={currentChapterIdx === 0}
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border ${currentTheme.border} text-xs font-medium transition-opacity disabled:opacity-30 disabled:pointer-events-none hover:opacity-90`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Предыдущая глава</span>
                </button>

                <div className={`text-xs ${currentTheme.subtext} font-mono tabular-nums`}>
                  Глава {currentChapterIdx + 1} из {readingData.chapters.length} · Прочитано {progress}%
                </div>

                <button
                  onClick={() => {
                    if (currentChapterIdx < readingData.chapters.length - 1) {
                      setCurrentChapterIdx((prev) => prev + 1);
                      contentScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  disabled={currentChapterIdx >= readingData.chapters.length - 1}
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border ${currentTheme.border} text-xs font-medium transition-opacity disabled:opacity-30 disabled:pointer-events-none hover:opacity-90`}
                >
                  <span>Следующая глава</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Settings / Comfort Drawer */}
        {showSettings && (
          <aside
            className={`fixed sm:static inset-y-0 right-0 z-30 w-full sm:w-80 shrink-0 border-l ${currentTheme.headerBg} p-5 overflow-y-auto animate-in slide-in-from-right-4 duration-200 shadow-2xl`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-amber-500" />
                <h2 className="text-xs font-bold uppercase tracking-wider">
                  Настройки комфорта
                </h2>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 opacity-70 hover:opacity-100 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1. Theme Presets (Designed for eye comfort & screen night light) */}
            <div className="mb-6">
              <label className="text-[11px] font-semibold opacity-70 block mb-2">
                Цветовой режим чтения:
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {/* Night Light (Warm Amber) */}
                <button
                  onClick={() => setReaderTheme('night-light')}
                  className={`w-full p-2.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${
                    readerTheme === 'night-light'
                      ? 'border-amber-500 bg-amber-500/15 text-amber-300 font-semibold ring-1 ring-amber-500/50'
                      : 'border-white/10 hover:bg-white/5 opacity-80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-[#181410] border border-amber-600 flex items-center justify-center">
                      <Flame className="w-2.5 h-2.5 text-amber-400" />
                    </div>
                    <div>
                      <div>Ночной свет (Теплый янтарь)</div>
                      <div className="text-[10px] opacity-70">
                        Идеален при включенном ночном свете монитора
                      </div>
                    </div>
                  </div>
                  {readerTheme === 'night-light' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </button>

                {/* Sepia (Book paper) */}
                <button
                  onClick={() => setReaderTheme('sepia')}
                  className={`w-full p-2.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${
                    readerTheme === 'sepia'
                      ? 'border-amber-700 bg-[#efe6d4] text-[#2e2417] font-semibold ring-1 ring-amber-600/50'
                      : 'border-white/10 hover:bg-white/5 opacity-80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-[#f8f3e8] border border-[#ded1ba]" />
                    <div>
                      <div>Книжная бумага (Сепия)</div>
                      <div className="text-[10px] opacity-70">Мягкий неотражающий фон книги</div>
                    </div>
                  </div>
                  {readerTheme === 'sepia' && <Check className="w-3.5 h-3.5 text-amber-800" />}
                </button>

                {/* Dark (OLED Velvet) */}
                <button
                  onClick={() => setReaderTheme('dark')}
                  className={`w-full p-2.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${
                    readerTheme === 'dark'
                      ? 'border-sky-500 bg-sky-500/15 text-sky-300 font-semibold ring-1 ring-sky-500/50'
                      : 'border-white/10 hover:bg-white/5 opacity-80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-[#111317] border border-neutral-700 flex items-center justify-center">
                      <Moon className="w-2.5 h-2.5 text-sky-400" />
                    </div>
                    <div>
                      <div>Ночной бархат (Тёмная)</div>
                      <div className="text-[10px] opacity-70">Глубокий тёмный без резких пересветов</div>
                    </div>
                  </div>
                  {readerTheme === 'dark' && <Check className="w-3.5 h-3.5 text-sky-400" />}
                </button>

                {/* Light Day */}
                <button
                  onClick={() => setReaderTheme('light')}
                  className={`w-full p-2.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${
                    readerTheme === 'light'
                      ? 'border-neutral-400 bg-white text-neutral-900 font-semibold ring-1 ring-neutral-400'
                      : 'border-white/10 hover:bg-white/5 opacity-80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-[#faf9f5] border border-neutral-300 flex items-center justify-center">
                      <Sun className="w-2.5 h-2.5 text-amber-600" />
                    </div>
                    <div>
                      <div>Дневной мягкий</div>
                      <div className="text-[10px] opacity-70">Светлый матовый фон без ослепления</div>
                    </div>
                  </div>
                  {readerTheme === 'light' && <Check className="w-3.5 h-3.5 text-amber-700" />}
                </button>

                {/* Emerald */}
                <button
                  onClick={() => setReaderTheme('emerald')}
                  className={`w-full p-2.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${
                    readerTheme === 'emerald'
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 font-semibold ring-1 ring-emerald-500/50'
                      : 'border-white/10 hover:bg-white/5 opacity-80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-[#121915] border border-emerald-700" />
                    <div>
                      <div>Лесной нефрит</div>
                      <div className="text-[10px] opacity-70">Успокаивающий зеленоватый спектр</div>
                    </div>
                  </div>
                  {readerTheme === 'emerald' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              </div>
            </div>

            {/* 2. Live Night Light Warmth Slider */}
            <div className="mb-6 p-3 rounded-xl border border-amber-500/30 bg-amber-500/10">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1 text-xs font-semibold text-amber-400">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Фильтр тепла (Ночной свет)</span>
                </div>
                <span className="text-xs font-mono tabular-nums text-amber-300 font-semibold">
                  {nightLightIntensity}%
                </span>
              </div>
              <p className="text-[10px] text-amber-200/80 mb-2 leading-relaxed">
                Дополнительное сглаживание синего излучения и подгонка под встроенный ночной свет системы
              </p>
              <input
                type="range"
                min="0"
                max="80"
                value={nightLightIntensity}
                onChange={(e) => setNightLightIntensity(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-amber-300/60 mt-1">
                <span>0% (нейтральный)</span>
                <span>40% (комфорт)</span>
                <span>80% (тёплый)</span>
              </div>
            </div>

            {/* 3. Font Family Selection */}
            <div className="mb-6">
              <label className="text-[11px] font-semibold opacity-70 block mb-2">
                Гарнитура шрифта:
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                <button
                  onClick={() => setFontFamily('serif')}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    fontFamily === 'serif'
                      ? currentTheme.accent
                      : 'border-white/10 hover:bg-white/5 opacity-80'
                  }`}
                  style={{ fontFamily: 'Literata, Georgia, serif' }}
                >
                  <div className="text-sm font-bold">Aa</div>
                  <div className="text-[10px]">Книжный</div>
                </button>

                <button
                  onClick={() => setFontFamily('sans')}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    fontFamily === 'sans'
                      ? currentTheme.accent
                      : 'border-white/10 hover:bg-white/5 opacity-80'
                  }`}
                  style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                >
                  <div className="text-sm font-bold">Aa</div>
                  <div className="text-[10px]">Гротеск</div>
                </button>

                <button
                  onClick={() => setFontFamily('mono')}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    fontFamily === 'mono'
                      ? currentTheme.accent
                      : 'border-white/10 hover:bg-white/5 opacity-80'
                  }`}
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                >
                  <div className="text-sm font-bold">Aa</div>
                  <div className="text-[10px]">Моно</div>
                </button>
              </div>
            </div>

            {/* 4. Font Size Slider */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold opacity-70">Размер текста:</span>
                <span className="text-xs font-mono tabular-nums opacity-90">{fontSize}px</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFontSize((prev) => Math.max(14, prev - 1))}
                  className="px-2 py-1 rounded border border-white/10 text-xs font-bold hover:bg-white/5"
                >
                  A-
                </button>
                <input
                  type="range"
                  min="14"
                  max="28"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="flex-1 accent-amber-500 cursor-pointer"
                />
                <button
                  onClick={() => setFontSize((prev) => Math.min(28, prev + 1))}
                  className="px-2 py-1 rounded border border-white/10 text-xs font-bold hover:bg-white/5"
                >
                  A+
                </button>
              </div>
            </div>

            {/* 5. Line Height & Width */}
            <div className="mb-6 space-y-4">
              <div>
                <label className="text-[11px] font-semibold opacity-70 block mb-1.5">
                  Межстрочный интервал:
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  {[
                    { val: 1.45, label: 'Компакт' },
                    { val: 1.75, label: 'Стандарт' },
                    { val: 2.1, label: 'Просторный' },
                  ].map((lh) => (
                    <button
                      key={lh.val}
                      onClick={() => setLineHeight(lh.val)}
                      className={`p-1.5 rounded-lg border text-center transition-all ${
                        lineHeight === lh.val
                          ? currentTheme.accent
                          : 'border-white/10 hover:bg-white/5 opacity-80'
                      }`}
                    >
                      {lh.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold opacity-70 block mb-1.5">
                  Ширина колонки:
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  {(['narrow', 'normal', 'wide'] as ReaderWidth[]).map((w) => (
                    <button
                      key={w}
                      onClick={() => setColumnWidth(w)}
                      className={`p-1.5 rounded-lg border text-center transition-all capitalize ${
                        columnWidth === w
                          ? currentTheme.accent
                          : 'border-white/10 hover:bg-white/5 opacity-80'
                      }`}
                    >
                      {w === 'narrow' ? 'Узкая' : w === 'normal' ? 'Книга' : 'Широкая'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold opacity-70 block mb-1.5">
                  Выравнивание:
                </label>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <button
                    onClick={() => setTextAlign('justify')}
                    className={`p-1.5 rounded-lg border text-center transition-all flex items-center justify-center gap-1 ${
                      textAlign === 'justify'
                        ? currentTheme.accent
                        : 'border-white/10 hover:bg-white/5 opacity-80'
                    }`}
                  >
                    <AlignJustify className="w-3.5 h-3.5" />
                    <span>По ширине</span>
                  </button>
                  <button
                    onClick={() => setTextAlign('left')}
                    className={`p-1.5 rounded-lg border text-center transition-all flex items-center justify-center gap-1 ${
                      textAlign === 'left'
                        ? currentTheme.accent
                        : 'border-white/10 hover:bg-white/5 opacity-80'
                    }`}
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                    <span>По левому краю</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Reset settings button */}
            <button
              onClick={() => {
                setReaderTheme('night-light');
                setFontSize(19);
                setLineHeight(1.75);
                setFontFamily('serif');
                setColumnWidth('normal');
                setTextAlign('justify');
                setNightLightIntensity(35);
              }}
              className="w-full py-2 rounded-lg border border-white/10 text-xs opacity-70 hover:opacity-100 flex items-center justify-center gap-1.5 transition-opacity"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Восстановить эталонный комфорт</span>
            </button>
          </aside>
        )}
      </div>

      {/* Reader Footer Info bar */}
      <footer
        className={`px-4 sm:px-6 h-8 border-t ${currentTheme.headerBg} flex items-center justify-between text-[11px] ${currentTheme.subtext} font-mono`}
      >
        <div className="flex items-center gap-3">
          <span>Книга #{book.id}</span>
          <span>·</span>
          <span className="hidden sm:inline">Фонд «БиблиоТех»</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Прогресс: {progress}%</span>
          <span>·</span>
          <span>{fontSize}px · {readerTheme === 'night-light' ? 'Ночной свет' : readerTheme}</span>
        </div>
      </footer>
    </div>
  );
};
