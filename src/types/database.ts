/**
 * Database Entities supporting both RunSQL (English) and DBML (Russian) specifications:
 * 
 * Table books / Книги {
 *   id int [pk, increment]
 *   title / название varchar(200)
 *   author_id / автор_id int
 *   year_published / год_издания int
 *   genre_id / жанр_id int
 *   publisher / издательство varchar(150)
 *   quantity / количество int
 *   available / доступно int
 *   location varchar(100)        <-- from RunSQL
 *   arrival_date date            <-- from RunSQL
 * }
 * 
 * Table authors / Авторы { id, full_name / фио, country / страна, birth_year / год_рождения }
 * Table genres / Жанры { id, name / название }
 * Table readers / Читатели { id, full_name / фио, phone / телефон, email, registration_date / дата_регистрации }
 * Table librarians / Библиотекари { id, full_name / фио, position / должность, phone / телефон }
 * Table loans / Выдача_книг { id, book_id / книга_id, reader_id / читатель_id, librarian_id / библиотекарь_id, issue_date / дата_выдачи, due_date / срок_возврата, return_date / дата_возврата, status / статус }
 */

export interface Author {
  id: number;
  фио: string;
  страна: string;
  год_рождения: number;
  // Aliases for RunSQL
  full_name?: string;
  country?: string;
  birth_year?: number;
}

export interface Genre {
  id: number;
  название: string;
  // Alias for RunSQL
  name?: string;
}

export interface Book {
  id: number;
  название: string;
  автор_id: number;
  год_издания: number;
  жанр_id: number;
  издательство: string;
  количество: number;
  доступно: number;
  // RunSQL additions
  location?: string; // Местоположение в библиотеке: зал, стеллаж, полка
  arrival_date?: string; // Дата поступления в фонд (YYYY-MM-DD)
  // Aliases for RunSQL
  title?: string;
  author_id?: number;
  year_published?: number;
  genre_id?: number;
  publisher?: string;
  quantity?: number;
  available?: number;
}

export interface Reader {
  id: number;
  фио: string;
  телефон: string;
  email: string;
  дата_регистрации: string; // YYYY-MM-DD
  // Aliases for RunSQL
  full_name?: string;
  phone?: string;
  registration_date?: string;
}

export interface Librarian {
  id: number;
  фио: string;
  должность: string;
  телефон: string;
  // Aliases for RunSQL
  full_name?: string;
  position?: string;
  phone?: string;
}

export type LoanStatus = 'на руках' | 'возвращена' | 'просрочена';

export interface BookLoan {
  id: number;
  книга_id: number;
  читатель_id: number;
  библиотекарь_id: number;
  дата_выдачи: string; // YYYY-MM-DD
  срок_возврата: string; // YYYY-MM-DD
  дата_возврата: string | null; // YYYY-MM-DD or null if not returned
  статус: LoanStatus;
  // Aliases for RunSQL
  book_id?: number;
  reader_id?: number;
  librarian_id?: number;
  issue_date?: string;
  due_date?: string;
  return_date?: string | null;
  status?: string;
}

// Joined / Enriched representations for UI tables & details
export interface EnrichedBookLoan extends BookLoan {
  book?: Book;
  author?: Author;
  reader?: Reader;
  librarian?: Librarian;
  isOverdueCalc?: boolean;
  daysRemainingOrOverdue?: number;
}

export interface EnrichedBook extends Book {
  authorName: string;
  genreName: string;
  activeLoansCount: number;
}

export interface EnrichedReader extends Reader {
  activeLoansCount: number;
  totalLoansCount: number;
  hasOverdueLoans: boolean;
}

export interface EnrichedAuthor extends Author {
  booksCount: number;
  titles: string[];
}

export interface EnrichedGenre extends Genre {
  booksCount: number;
}

export type ActiveTab = 
  | 'loans'       // Выдача книг
  | 'books'       // Книги
  | 'reader'      // Читальный зал (Режим чтения)
  | 'readers'     // Читатели
  | 'authors'     // Авторы
  | 'genres'      // Жанры
  | 'librarians'  // Библиотекари
  | 'schema';     // ER-диаграмма

export interface AuthUser {
  id: number;
  фио: string;
  email: string;
  телефон: string;
  role: 'librarian' | 'reader';
  должность?: string;
  дата_регистрации?: string;
}
