import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Author,
  AuthUser,
  Book,
  BookLoan,
  EnrichedAuthor,
  EnrichedBook,
  EnrichedBookLoan,
  EnrichedGenre,
  EnrichedReader,
  Genre,
  Librarian,
  LoanStatus,
  Reader,
} from '../types/database';
import {
  initialAuthors,
  initialBooks,
  initialGenres,
  initialLibrarians,
  initialLoans,
  initialReaders,
} from '../data/initialData';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface LibraryContextType {
  // Raw entities
  authors: Author[];
  genres: Genre[];
  books: Book[];
  readers: Reader[];
  librarians: Librarian[];
  loans: BookLoan[];

  // Enriched entities with joins
  enrichedLoans: EnrichedBookLoan[];
  enrichedBooks: EnrichedBook[];
  enrichedReaders: EnrichedReader[];
  enrichedAuthors: EnrichedAuthor[];
  enrichedGenres: EnrichedGenre[];

  // Stats
  stats: {
    totalBookTitles: number;
    totalCopies: number;
    totalAvailable: number;
    totalIssued: number;
    totalOverdue: number;
    activeReadersCount: number;
    returnedLoansCount: number;
  };

  // Actions - Books
  addBook: (book: Omit<Book, 'id'>) => void;
  updateBook: (id: number, book: Partial<Book>) => void;
  deleteBook: (id: number) => { success: boolean; error?: string };

  // Actions - Authors
  addAuthor: (author: Omit<Author, 'id'>) => void;
  updateAuthor: (id: number, author: Partial<Author>) => void;
  deleteAuthor: (id: number) => { success: boolean; error?: string };

  // Actions - Genres
  addGenre: (genre: Omit<Genre, 'id'>) => void;
  updateGenre: (id: number, genre: Partial<Genre>) => void;
  deleteGenre: (id: number) => { success: boolean; error?: string };

  // Actions - Readers
  addReader: (reader: Omit<Reader, 'id'>) => void;
  updateReader: (id: number, reader: Partial<Reader>) => void;
  deleteReader: (id: number) => { success: boolean; error?: string };

  // Actions - Librarians
  addLibrarian: (librarian: Omit<Librarian, 'id'>) => void;
  updateLibrarian: (id: number, librarian: Partial<Librarian>) => void;
  deleteLibrarian: (id: number) => { success: boolean; error?: string };

  // Actions - Loans
  issueBook: (params: {
    книга_id: number;
    читатель_id: number;
    библиотекарь_id: number;
    дата_выдачи: string;
    срок_возврата: string;
  }) => { success: boolean; error?: string };
  returnBook: (loanId: number, returnDate?: string) => void;
  prolongLoan: (loanId: number, newDueDate: string) => void;
  deleteLoan: (loanId: number) => void;

  // Global utilities
  resetToDemo: () => void;
  exportDatabaseJSON: () => void;
  importDatabaseJSON: (jsonString: string) => boolean;

  // Authentication & Profile
  currentUser: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
  registerAuthUser: (data: {
    фио: string;
    email: string;
    телефон: string;
    role: 'librarian' | 'reader';
    должность?: string;
  }) => AuthUser;

  // Toasts
  toasts: ToastMessage[];
  dismissToast: (id: string) => void;
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'bibliosfera_library_v1_';

function getStoredOr<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to load ${key} from storage:`, e);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save ${key} to storage:`, e);
  }
}

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authors, setAuthors] = useState<Author[]>(() => getStoredOr('authors', initialAuthors));
  const [genres, setGenres] = useState<Genre[]>(() => getStoredOr('genres', initialGenres));
  const [books, setBooks] = useState<Book[]>(() => getStoredOr('books', initialBooks));
  const [readers, setReaders] = useState<Reader[]>(() => getStoredOr('readers', initialReaders));
  const [librarians, setLibrarians] = useState<Librarian[]>(() => getStoredOr('librarians', initialLibrarians));
  const [loans, setLoans] = useState<BookLoan[]>(() => getStoredOr('loans', initialLoans));
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() =>
    getStoredOr<AuthUser | null>('auth_user', null)
  );
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Persist changes
  useEffect(() => saveToStorage('authors', authors), [authors]);
  useEffect(() => saveToStorage('genres', genres), [genres]);
  useEffect(() => saveToStorage('books', books), [books]);
  useEffect(() => saveToStorage('readers', readers), [readers]);
  useEffect(() => saveToStorage('librarians', librarians), [librarians]);
  useEffect(() => saveToStorage('loans', loans), [loans]);
  useEffect(() => saveToStorage('auth_user', currentUser), [currentUser]);

  const showToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Author Map & Genre Map for fast joins
  const authorMap = useMemo(() => new Map(authors.map((a) => [a.id, a])), [authors]);
  const genreMap = useMemo(() => new Map(genres.map((g) => [g.id, g])), [genres]);
  const readerMap = useMemo(() => new Map(readers.map((r) => [r.id, r])), [readers]);
  const librarianMap = useMemo(() => new Map(librarians.map((l) => [l.id, l])), [librarians]);
  const bookMap = useMemo(() => new Map(books.map((b) => [b.id, b])), [books]);

  // Today reference (YYYY-MM-DD)
  const todayStr = useMemo(() => {
    const now = new Date();
    return now.toISOString().slice(0, 10);
  }, []);

  // Enriched loans with dynamic overdue logic
  const enrichedLoans: EnrichedBookLoan[] = useMemo(() => {
    return loans.map((loan) => {
      const book = bookMap.get(loan.книга_id);
      const author = book ? authorMap.get(book.автор_id) : undefined;
      const reader = readerMap.get(loan.читатель_id);
      const librarian = librarianMap.get(loan.библиотекарь_id);

      const dueDate = new Date(loan.срок_возврата);
      const todayDate = new Date(todayStr);
      const diffTime = dueDate.getTime() - todayDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const isUnreturned = loan.статус === 'на руках' || loan.статус === 'просрочена';
      const isOverdueCalc = isUnreturned && diffDays < 0;

      // Actual display status normalized
      const status: LoanStatus = loan.дата_возврата
        ? 'возвращена'
        : isOverdueCalc
        ? 'просрочена'
        : 'на руках';

      return {
        ...loan,
        статус: status,
        book,
        author,
        reader,
        librarian,
        isOverdueCalc,
        daysRemainingOrOverdue: diffDays,
      };
    }).sort((a, b) => {
      // Sort: overdue first, then active due soonest, then returned
      if (a.статус === 'просрочена' && b.статус !== 'просрочена') return -1;
      if (b.статус === 'просрочена' && a.статус !== 'просрочена') return 1;
      if (a.статус === 'на руках' && b.статус === 'возвращена') return -1;
      if (b.статус === 'на руках' && a.статус === 'возвращена') return 1;
      return b.id - a.id;
    });
  }, [loans, bookMap, authorMap, readerMap, librarianMap, todayStr]);

  // Enriched books
  const enrichedBooks: EnrichedBook[] = useMemo(() => {
    return books.map((book) => {
      const author = authorMap.get(book.автор_id);
      const genre = genreMap.get(book.жанр_id);
      const activeLoansCount = loans.filter(
        (l) => l.книга_id === book.id && (l.статус === 'на руках' || l.статус === 'просрочена')
      ).length;

      return {
        ...book,
        authorName: author ? author.фио : 'Неизвестный автор',
        genreName: genre ? genre.название : 'Без жанра',
        activeLoansCount,
      };
    });
  }, [books, authorMap, genreMap, loans]);

  // Enriched readers
  const enrichedReaders: EnrichedReader[] = useMemo(() => {
    return readers.map((reader) => {
      const readerLoans = enrichedLoans.filter((l) => l.читатель_id === reader.id);
      const activeLoansCount = readerLoans.filter(
        (l) => l.статус === 'на руках' || l.статус === 'просрочена'
      ).length;
      const hasOverdueLoans = readerLoans.some((l) => l.статус === 'просрочена');

      return {
        ...reader,
        activeLoansCount,
        totalLoansCount: readerLoans.length,
        hasOverdueLoans,
      };
    });
  }, [readers, enrichedLoans]);

  // Enriched authors
  const enrichedAuthors: EnrichedAuthor[] = useMemo(() => {
    return authors.map((author) => {
      const authorBooks = books.filter((b) => b.автор_id === author.id);
      return {
        ...author,
        booksCount: authorBooks.length,
        titles: authorBooks.map((b) => b.название),
      };
    });
  }, [authors, books]);

  // Enriched genres
  const enrichedGenres: EnrichedGenre[] = useMemo(() => {
    return genres.map((genre) => {
      const genreBooks = books.filter((b) => b.жанр_id === genre.id);
      return {
        ...genre,
        booksCount: genreBooks.length,
      };
    });
  }, [genres, books]);

  // Global aggregate stats
  const stats = useMemo(() => {
    const totalBookTitles = books.length;
    const totalCopies = books.reduce((acc, b) => acc + (Number(b.количество) || 0), 0);
    const totalAvailable = books.reduce((acc, b) => acc + (Number(b.доступно) || 0), 0);
    const totalIssued = totalCopies - totalAvailable;
    const totalOverdue = enrichedLoans.filter((l) => l.статус === 'просрочена').length;
    const activeReadersCount = new Set(
      enrichedLoans.filter((l) => l.статус === 'на руках' || l.статус === 'просрочена').map((l) => l.читатель_id)
    ).size;
    const returnedLoansCount = enrichedLoans.filter((l) => l.статус === 'возвращена').length;

    return {
      totalBookTitles,
      totalCopies,
      totalAvailable,
      totalIssued: totalIssued < 0 ? 0 : totalIssued,
      totalOverdue,
      activeReadersCount,
      returnedLoansCount,
    };
  }, [books, enrichedLoans]);

  // CRUD Actions - Books
  const addBook = (newBookData: Omit<Book, 'id'>) => {
    const nextId = books.length > 0 ? Math.max(...books.map((b) => b.id)) + 1 : 1;
    const newBook: Book = {
      ...newBookData,
      id: nextId,
      доступно: Number(newBookData.доступно) || Number(newBookData.количество) || 1,
      количество: Number(newBookData.количество) || 1,
    };
    setBooks((prev) => [...prev, newBook]);
    showToast('success', 'Книга добавлена', `«${newBook.название}» добавлена в каталог фонда.`);
  };

  const updateBook = (id: number, data: Partial<Book>) => {
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        const updated = { ...b, ...data };
        // Ensure available doesn't exceed total
        if (updated.доступно > updated.количество) {
          updated.доступно = updated.количество;
        }
        return updated;
      })
    );
    showToast('info', 'Данные книги обновлены', `Информация об издании успешно сохранена.`);
  };

  const deleteBook = (id: number) => {
    // Check foreign key constraint in loans
    const hasLoans = loans.some((l) => l.книга_id === id);
    if (hasLoans) {
      const err = 'Невозможно удалить: по данной книге зафиксированы операции выдачи в журнале.';
      showToast('error', 'Ошибка удаления', err);
      return { success: false, error: err };
    }
    const bookToDelete = books.find((b) => b.id === id);
    setBooks((prev) => prev.filter((b) => b.id !== id));
    showToast('info', 'Книга удалена', bookToDelete ? `«${bookToDelete.название}» списана из фонда.` : undefined);
    return { success: true };
  };

  // CRUD Actions - Authors
  const addAuthor = (authorData: Omit<Author, 'id'>) => {
    const nextId = authors.length > 0 ? Math.max(...authors.map((a) => a.id)) + 1 : 1;
    const newAuthor: Author = { ...authorData, id: nextId };
    setAuthors((prev) => [...prev, newAuthor]);
    showToast('success', 'Автор добавлен', `${newAuthor.фио} внесен в реестр авторов.`);
  };

  const updateAuthor = (id: number, data: Partial<Author>) => {
    setAuthors((prev) => prev.map((a) => (a.id === id ? { ...a, ...data } : a)));
    showToast('info', 'Данные автора обновлены');
  };

  const deleteAuthor = (id: number) => {
    // Check FK constraint in books
    const hasBooks = books.some((b) => b.автор_id === id);
    if (hasBooks) {
      const err = 'Невозможно удалить автора: в каталоге зарегистрированы книги этого автора.';
      showToast('error', 'Ошибка удаления', err);
      return { success: false, error: err };
    }
    setAuthors((prev) => prev.filter((a) => a.id !== id));
    showToast('info', 'Автор удален');
    return { success: true };
  };

  // CRUD Actions - Genres
  const addGenre = (genreData: Omit<Genre, 'id'>) => {
    const nextId = genres.length > 0 ? Math.max(...genres.map((g) => g.id)) + 1 : 1;
    const newGenre: Genre = { ...genreData, id: nextId };
    setGenres((prev) => [...prev, newGenre]);
    showToast('success', 'Жанр добавлен', `Жанр «${newGenre.название}» создан.`);
  };

  const updateGenre = (id: number, data: Partial<Genre>) => {
    setGenres((prev) => prev.map((g) => (g.id === id ? { ...g, ...data } : g)));
    showToast('info', 'Жанр обновлен');
  };

  const deleteGenre = (id: number) => {
    const hasBooks = books.some((b) => b.жанр_id === id);
    if (hasBooks) {
      const err = 'Невозможно удалить жанр: в фонде есть книги с данным жанром.';
      showToast('error', 'Ошибка удаления', err);
      return { success: false, error: err };
    }
    setGenres((prev) => prev.filter((g) => g.id !== id));
    showToast('info', 'Жанр удален');
    return { success: true };
  };

  // CRUD Actions - Readers
  const addReader = (readerData: Omit<Reader, 'id'>) => {
    const nextId = readers.length > 0 ? Math.max(...readers.map((r) => r.id)) + 1 : 1;
    const newReader: Reader = { ...readerData, id: nextId };
    setReaders((prev) => [...prev, newReader]);
    showToast('success', 'Читатель зарегистрирован', `${newReader.фио} добавлен в базу.`);
  };

  const updateReader = (id: number, data: Partial<Reader>) => {
    setReaders((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)));
    showToast('info', 'Данные читателя обновлены');
  };

  const deleteReader = (id: number) => {
    const hasActiveLoans = loans.some(
      (l) => l.читатель_id === id && (l.статус === 'на руках' || l.статус === 'просрочена')
    );
    if (hasActiveLoans) {
      const err = 'Невозможно удалить читателя: у него числятся не сданные книги!';
      showToast('error', 'Отказ в удалении', err);
      return { success: false, error: err };
    }
    setReaders((prev) => prev.filter((r) => r.id !== id));
    showToast('info', 'Читатель удален');
    return { success: true };
  };

  // CRUD Actions - Librarians
  const addLibrarian = (libData: Omit<Librarian, 'id'>) => {
    const nextId = librarians.length > 0 ? Math.max(...librarians.map((l) => l.id)) + 1 : 1;
    const newLib: Librarian = { ...libData, id: nextId };
    setLibrarians((prev) => [...prev, newLib]);
    showToast('success', 'Сотрудник добавлен', `${newLib.фио} зарегистрирован в системе.`);
  };

  const updateLibrarian = (id: number, data: Partial<Librarian>) => {
    setLibrarians((prev) => prev.map((l) => (l.id === id ? { ...l, ...data } : l)));
    showToast('info', 'Данные сотрудника обновлены');
  };

  const deleteLibrarian = (id: number) => {
    const hasLoans = loans.some((l) => l.библиотекарь_id === id);
    if (hasLoans) {
      const err = 'Невозможно удалить сотрудника: за ним числятся оформленные операции выдачи книг.';
      showToast('error', 'Ошибка удаления', err);
      return { success: false, error: err };
    }
    setLibrarians((prev) => prev.filter((l) => l.id !== id));
    showToast('info', 'Сотрудник удален');
    return { success: true };
  };

  // Issue Book action with automatic availability check & decrement
  const issueBook = (params: {
    книга_id: number;
    читатель_id: number;
    библиотекарь_id: number;
    дата_выдачи: string;
    срок_возврата: string;
  }) => {
    const book = books.find((b) => b.id === params.книга_id);
    if (!book) {
      showToast('error', 'Ошибка выдачи', 'Выбранная книга не найдена.');
      return { success: false, error: 'Книга не найдена' };
    }
    if (book.доступно <= 0) {
      showToast('error', 'Выдача невозможна', `Все экземпляры «${book.название}» сейчас находятся на руках.`);
      return { success: false, error: 'Нет свободных экземпляров книги' };
    }

    // Decrement available copies in book
    setBooks((prev) =>
      prev.map((b) => (b.id === params.книга_id ? { ...b, доступно: Math.max(0, b.доступно - 1) } : b))
    );

    const nextId = loans.length > 0 ? Math.max(...loans.map((l) => l.id)) + 1 : 1;
    const newLoan: BookLoan = {
      id: nextId,
      книга_id: params.книга_id,
      читатель_id: params.читатель_id,
      библиотекарь_id: params.библиотекарь_id,
      дата_выдачи: params.дата_выдачи,
      срок_возврата: params.срок_возврата,
      дата_возврата: null,
      статус: 'на руках',
    };

    setLoans((prev) => [newLoan, ...prev]);

    const reader = readers.find((r) => r.id === params.читатель_id);
    showToast(
      'success',
      'Книга успешно выдана',
      `«${book.название}» выдана читателю ${reader ? reader.фио : ''} до ${params.срок_возврата}.`
    );

    return { success: true };
  };

  // Return Book action with automatic availability increment
  const returnBook = (loanId: number, returnDate?: string) => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return;

    if (loan.статус === 'возвращена') {
      showToast('info', 'Книга уже возвращена', 'Данная запись уже закрыта.');
      return;
    }

    const actualReturnDate = returnDate || todayStr;

    // Increment available copies in book
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === loan.книга_id) {
          const newAvail = Math.min(b.количество, b.доступно + 1);
          return { ...b, доступно: newAvail };
        }
        return b;
      })
    );

    // Update loan record
    setLoans((prev) =>
      prev.map((l) =>
        l.id === loanId
          ? {
              ...l,
              дата_возврата: actualReturnDate,
              статус: 'возвращена',
            }
          : l
      )
    );

    const book = books.find((b) => b.id === loan.книга_id);
    showToast(
      'success',
      'Возврат принят',
      `Экземпляр книги «${book ? book.название : 'Книга'}» возвращен в фонд.`
    );
  };

  // Prolong loan
  const prolongLoan = (loanId: number, newDueDate: string) => {
    setLoans((prev) =>
      prev.map((l) => {
        if (l.id !== loanId) return l;
        return {
          ...l,
          срок_возврата: newDueDate,
          статус: 'на руках',
        };
      })
    );
    showToast('info', 'Срок продлен', `Новый срок возврата: ${newDueDate}`);
  };

  // Delete loan record
  const deleteLoan = (loanId: number) => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return;

    // If deleting an active loan, restore available count
    if (loan.статус === 'на руках' || loan.статус === 'просрочена') {
      setBooks((prev) =>
        prev.map((b) => {
          if (b.id === loan.книга_id) {
            return { ...b, доступно: Math.min(b.количество, b.доступно + 1) };
          }
          return b;
        })
      );
    }

    setLoans((prev) => prev.filter((l) => l.id !== loanId));
    showToast('info', 'Запись о выдаче удалена');
  };

  // Reset to initial demo database
  const resetToDemo = () => {
    setAuthors(initialAuthors);
    setGenres(initialGenres);
    setBooks(initialBooks);
    setReaders(initialReaders);
    setLibrarians(initialLibrarians);
    setLoans(initialLoans);
    showToast('info', 'База данных сброшена', 'Все 6 таблиц восстановлены к демонстрационному состоянию.');
  };

  // Export all 6 tables as JSON
  const exportDatabaseJSON = () => {
    const dbPayload = {
      exportedAt: new Date().toISOString(),
      schema: 'Library_Management_System_DBML',
      tables: {
        Книги: books,
        Авторы: authors,
        Жанры: genres,
        Читатели: readers,
        Библиотекари: librarians,
        Выдача_книг: loans,
      },
    };
    const blob = new Blob([JSON.stringify(dbPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `library_database_dump_${todayStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Экспорт завершен', 'Файл базы данных успешно сохранен.');
  };

  // Import JSON backup
  const importDatabaseJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data && data.tables) {
        if (Array.isArray(data.tables.Книги)) setBooks(data.tables.Книги);
        if (Array.isArray(data.tables.Авторы)) setAuthors(data.tables.Авторы);
        if (Array.isArray(data.tables.Жанры)) setGenres(data.tables.Жанры);
        if (Array.isArray(data.tables.Читатели)) setReaders(data.tables.Читатели);
        if (Array.isArray(data.tables.Библиотекари)) setLibrarians(data.tables.Библиотекари);
        if (Array.isArray(data.tables.Выдача_книг)) setLoans(data.tables.Выдача_книг);
        showToast('success', 'Импорт успешен', 'Все таблицы базы данных обновлены из файла.');
        return true;
      }
      showToast('error', 'Ошибка импорта', 'Неверная структура файла резервной копии.');
      return false;
    } catch (e) {
      showToast('error', 'Ошибка разбора JSON', 'Не удалось прочитать загруженный файл.');
      return false;
    }
  };

  // Auth actions
  const login = (user: AuthUser) => {
    setCurrentUser(user);
    showToast('success', `Добро пожаловать, ${user.фио}!`, `Вы вошли в систему как ${user.role === 'librarian' ? 'сотрудник библиотеки' : 'читатель'}.`);
  };

  const logout = () => {
    setCurrentUser(null);
    showToast('info', 'Вы вышли из учетной записи');
  };

  const registerAuthUser = (data: {
    фио: string;
    email: string;
    телефон: string;
    role: 'librarian' | 'reader';
    должность?: string;
  }): AuthUser => {
    if (data.role === 'reader') {
      const nextId = readers.length > 0 ? Math.max(...readers.map((r) => r.id)) + 1 : 1;
      const regDate = new Date().toISOString().slice(0, 10);
      const newReader: Reader = {
        id: nextId,
        фио: data.фио,
        телефон: data.телефон,
        email: data.email,
        дата_регистрации: regDate,
      };
      setReaders((prev) => [...prev, newReader]);
      const authUser: AuthUser = {
        id: nextId,
        фио: data.фио,
        email: data.email,
        телефон: data.телефон,
        role: 'reader',
        дата_регистрации: regDate,
      };
      setCurrentUser(authUser);
      showToast('success', 'Регистрация успешна!', `Читательский билет #${nextId} оформлен на имя ${data.фио}.`);
      return authUser;
    } else {
      const nextId = librarians.length > 0 ? Math.max(...librarians.map((l) => l.id)) + 1 : 1;
      const newLib: Librarian = {
        id: nextId,
        фио: data.фио,
        должность: data.должность || 'Библиотекарь',
        телефон: data.телефон,
      };
      setLibrarians((prev) => [...prev, newLib]);
      const authUser: AuthUser = {
        id: nextId,
        фио: data.фио,
        email: data.email,
        телефон: data.телефон,
        role: 'librarian',
        должность: data.должность || 'Библиотекарь',
      };
      setCurrentUser(authUser);
      showToast('success', 'Регистрация сотрудника завершена!', `Учетная запись сотрудника #${nextId} создана.`);
      return authUser;
    }
  };

  return (
    <LibraryContext.Provider
      value={{
        authors,
        genres,
        books,
        readers,
        librarians,
        loans,
        currentUser,
        login,
        logout,
        registerAuthUser,
        enrichedLoans,
        enrichedBooks,
        enrichedReaders,
        enrichedAuthors,
        enrichedGenres,
        stats,
        addBook,
        updateBook,
        deleteBook,
        addAuthor,
        updateAuthor,
        deleteAuthor,
        addGenre,
        updateGenre,
        deleteGenre,
        addReader,
        updateReader,
        deleteReader,
        addLibrarian,
        updateLibrarian,
        deleteLibrarian,
        issueBook,
        returnBook,
        prolongLoan,
        deleteLoan,
        resetToDemo,
        exportDatabaseJSON,
        importDatabaseJSON,
        toasts,
        dismissToast,
        showToast,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};
