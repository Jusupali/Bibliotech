import React, { useState, useRef, useEffect } from 'react';
import { useLibrary } from '../context/LibraryContext';
import { useTheme } from '../context/ThemeContext';
import { Book, EnrichedBook } from '../types/database';
import {
  Sparkles,
  Send,
  X,
  BookOpen,
  Plus,
  RefreshCw,
  Search,
  User,
  Flame,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Bot,
} from 'lucide-react';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBookReader: (book: Book | EnrichedBook) => void;
  onIssueBook: (bookId: number) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  source?: string;
  errorNote?: string;
  infoNote?: string;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  onOpenBookReader,
  onIssueBook,
}) => {
  const { enrichedBooks, authors, genres } = useLibrary();
  const { effectiveTheme } = useTheme();

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Здравствуйте! Я ваш ИИ-библиограф на базе Gemini AI. Я помогу найти любую книгу или автора в фонде библиотеки «БиблиоТех», порекомендую интересную литературу по жанру или расскажу о сюжете любого произведения. Что вас интересует?',
      timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Pass catalog context so Gemini can see live database items
      const catalogContext = {
        books: enrichedBooks.map((b) => ({
          id: b.id,
          title: b.название,
          authorName: b.authorName,
          genreName: b.genreName,
          available: b.доступно,
          quantity: b.количество,
          year: b.год_издания,
          location: b.location,
        })),
        authors: authors.map((a) => ({
          id: a.id,
          full_name: a.фио,
          country: a.страна,
        })),
        genres: genres.map((g) => ({
          id: g.id,
          name: g.название,
        })),
      };

      const response = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          catalogContext,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status}`);
      }

      const data = await response.json();

      const assistantMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'Ответ не получен.',
        timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        source: data.source,
        errorNote: data.errorNote,
        infoNote: data.infoNote,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('AI assistant error:', err);
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `Не удалось связаться с сервером Gemini API: ${err.message || 'Ошибка сети'}. Пожалуйста, повторите попытку.`,
        timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        source: 'error',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    '🔍 Найди автора Толстой',
    '📖 Найди книгу «Мастер и Маргарита»',
    '🚀 Посоветуй научную фантастику',
    '📦 Какие книги сейчас есть в наличии?',
    '🕯️ Что почитать вечером в режиме ночного света?',
  ];

  if (!isOpen) return null;

  // Render message with parsed action tags like [BOOK_ACTION:id:title]
  const renderMessageContent = (text: string) => {
    const bookActionRegex = /\[BOOK_ACTION:(\d+):([^\]]+)\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = bookActionRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index),
        });
      }

      const bookId = Number(match[1]);
      const bookTitle = match[2];
      const foundBook = enrichedBooks.find((b) => b.id === bookId);

      parts.push({
        type: 'book-action',
        bookId,
        bookTitle,
        book: foundBook,
      });

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex),
      });
    }

    return (
      <div className="space-y-3 leading-relaxed">
        {parts.map((p, idx) => {
          if (p.type === 'text') {
            return (
              <div key={idx} className="whitespace-pre-wrap text-xs sm:text-sm">
                {p.content}
              </div>
            );
          }

          if (p.type === 'book-action') {
            const b = p.book;
            return (
              <div
                key={idx}
                className="my-2.5 p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 truncate">
                      {b ? b.название : p.bookTitle}
                    </div>
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      {b ? `${b.authorName} · В наличии: ${b.доступно} из ${b.количество}` : 'Издание из фонда'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                  {b && (
                    <button
                      onClick={() => {
                        onOpenBookReader(b);
                        onClose();
                      }}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 shadow-xs transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Читать</span>
                    </button>
                  )}

                  {p.bookId !== undefined && (
                    <button
                      onClick={() => {
                        if (p.bookId !== undefined) {
                          onIssueBook(p.bookId);
                          onClose();
                        }
                      }}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Выдать</span>
                    </button>
                  )}
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl h-[100dvh] sm:h-[90vh] sm:max-h-[720px] bg-white dark:bg-neutral-900 rounded-none sm:rounded-2xl shadow-2xl border-0 sm:border border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="px-3.5 sm:px-5 py-3 sm:py-3.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/70 dark:bg-neutral-900/90 backdrop-blur-xs shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0 truncate">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">
                  ИИ-Библиограф «БиблиоТех»
                </h2>
                <span className="text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.2 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 shrink-0">
                  Gemini
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-neutral-500 dark:text-neutral-400 hidden sm:block truncate">
                Интеллектуальный поиск по авторам, книгам, сюжету и подбор рекомендаций
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => {
                setMessages([
                  {
                    id: 'welcome-reset',
                    sender: 'assistant',
                    text: 'Диалог очищен. Чем я могу помочь вам сейчас?',
                    timestamp: new Date().toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    }),
                  },
                ]);
              }}
              title="Очистить историю сообщений"
              className="p-2 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              title="Закрыть (Esc)"
              className="p-2 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-3 items-start ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                      : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
                  }`}
                >
                  {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                {/* Bubble */}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-2xs ${
                    isUser
                      ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded-tr-xs'
                      : 'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 rounded-tl-xs'
                  }`}
                >
                  {renderMessageContent(m.text)}

                  {/* Footnote if any info/error note */}
                  {m.infoNote && (
                    <div className="mt-2 pt-2 border-t border-current/15 text-[10px] opacity-75 flex items-center gap-1">
                      <HelpCircle className="w-3 h-3 shrink-0" />
                      <span>{m.infoNote}</span>
                    </div>
                  )}

                  {m.errorNote && (
                    <div className="mt-2 pt-2 border-t border-current/15 text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{m.errorNote}</span>
                    </div>
                  )}

                  <div className="text-[10px] opacity-60 text-right mt-1 font-mono">
                    {m.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-4 py-3 text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>ИИ анализирует фонд и подбирает ответ...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Bar */}
        <div className="px-4 py-2 border-t border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/50 overflow-x-auto flex gap-1.5 scrollbar-none shrink-0">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p.replace(/^[^\s]+\s/, ''))}
              className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-amber-500 hover:text-amber-700 dark:hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 shadow-2xs"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <footer className="p-3 sm:p-4 pb-safe border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Найди автора Толстой или книгу 1984..."
                disabled={isLoading}
                className="w-full text-base sm:text-sm pl-9 pr-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-3.5 sm:px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 disabled:opacity-40 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-1.5 shrink-0 min-h-[42px]"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Спросить</span>
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
};
