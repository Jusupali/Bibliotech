import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { Database, Key, Link2, Copy, Check, ArrowRight, Code, Terminal, Layers } from 'lucide-react';
import { LifecycleView } from '../LifecycleView';

export const SchemaTab: React.FC = () => {
  const { authors, genres, books, readers, librarians, loans } = useLibrary();
  const [copied, setCopied] = useState(false);
  const [schemaMode, setSchemaMode] = useState<'runsql' | 'ru' | 'sql'>('runsql');
  const [highlightedRef, setHighlightedRef] = useState<string | null>(null);
  const [subTab, setSubTab] = useState<'erd' | 'lifecycle'>('erd');

  const runSqlCode = `Table books {
  id int [pk, increment]
  title varchar(200)
  author_id int
  year_published int
  genre_id int
  publisher varchar(150)
  quantity int
  available int
  location varchar(100)
  arrival_date date
}

Table authors {
  id int [pk, increment]
  full_name varchar(150)
  country varchar(100)
  birth_year int
}

Table genres {
  id int [pk, increment]
  name varchar(100)
}

Table readers {
  id int [pk, increment]
  full_name varchar(150)
  phone varchar(20)
  email varchar(100)
  registration_date date
}

Table librarians {
  id int [pk, increment]
  full_name varchar(150)
  position varchar(100)
  phone varchar(20)
}

Table loans {
  id int [pk, increment]
  book_id int
  reader_id int
  librarian_id int
  issue_date date
  due_date date
  return_date date
  status varchar(50)
}

Ref: books.author_id > authors.id
Ref: books.genre_id > genres.id
Ref: loans.book_id > books.id
Ref: loans.reader_id > readers.id
Ref: loans.librarian_id > librarians.id`;

  const rawDBML = `Table Книги {
  id int [pk, increment]
  название varchar(200)
  автор_id int
  год_издания int
  жанр_id int
  издательство varchar(150)
  количество int
  доступно int
  location varchar(100)
  arrival_date date
}

Table Авторы {
  id int [pk, increment]
  фио varchar(150)
  страна varchar(100)
  год_рождения int
}

Table Жанры {
  id int [pk, increment]
  название varchar(100)
}

Table Читатели {
  id int [pk, increment]
  фио varchar(150)
  телефон varchar(20)
  email varchar(100)
  дата_регистрации date
}

Table Библиотекари {
  id int [pk, increment]
  фио varchar(150)
  должность varchar(100)
  телефон varchar(20)
}

Table Выдача_книг {
  id int [pk, increment]
  книга_id int
  читатель_id int
  библиотекарь_id int
  дата_выдачи date
  срок_возврата date
  дата_возврата date
  статус varchar(50)
}

Ref: Книги.автор_id > Авторы.id
Ref: Книги.жанр_id > Жанры.id
Ref: Выдача_книг.книга_id > Книги.id
Ref: Выдача_книг.читатель_id > Читатели.id
Ref: Выдача_книг.библиотекарь_id > Библиотекари.id`;

  const sqlDDL = `-- DDL Скрипт создания базы данных библиотеки (PostgreSQL / MySQL / SQLite)

CREATE TABLE authors (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    country VARCHAR(100) NOT NULL,
    birth_year INT
);

CREATE TABLE genres (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE readers (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    registration_date DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE librarians (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    position VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL
);

CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    author_id INT NOT NULL REFERENCES authors(id) ON DELETE RESTRICT,
    year_published INT NOT NULL,
    genre_id INT NOT NULL REFERENCES genres(id) ON DELETE RESTRICT,
    publisher VARCHAR(150) NOT NULL,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity >= 0),
    available INT NOT NULL DEFAULT 1 CHECK (available <= quantity AND available >= 0),
    location VARCHAR(100),
    arrival_date DATE DEFAULT CURRENT_DATE
);

CREATE TABLE loans (
    id SERIAL PRIMARY KEY,
    book_id INT NOT NULL REFERENCES books(id) ON DELETE RESTRICT,
    reader_id INT NOT NULL REFERENCES readers(id) ON DELETE RESTRICT,
    librarian_id INT NOT NULL REFERENCES librarians(id) ON DELETE RESTRICT,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    return_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'на руках'
);

-- Индексы для ускорения поиска и джойнов
CREATE INDEX idx_books_author ON books(author_id);
CREATE INDEX idx_books_genre ON books(genre_id);
CREATE INDEX idx_loans_reader ON loans(reader_id);
CREATE INDEX idx_loans_book ON loans(book_id);
CREATE INDEX idx_loans_status ON loans(status);`;

  const copyCode = () => {
    const textToCopy =
      schemaMode === 'runsql' ? runSqlCode : schemaMode === 'ru' ? rawDBML : sqlDDL;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const relations = [
    { id: 'b_a', from: 'books.author_id', to: 'authors.id', ruFrom: 'Книги.автор_id', ruTo: 'Авторы.id' },
    { id: 'b_g', from: 'books.genre_id', to: 'genres.id', ruFrom: 'Книги.жанр_id', ruTo: 'Жанры.id' },
    { id: 'l_b', from: 'loans.book_id', to: 'books.id', ruFrom: 'Выдача_книг.книга_id', ruTo: 'Книги.id' },
    { id: 'l_r', from: 'loans.reader_id', to: 'readers.id', ruFrom: 'Выдача_книг.читатель_id', ruTo: 'Читатели.id' },
    { id: 'l_lib', from: 'loans.librarian_id', to: 'librarians.id', ruFrom: 'Выдача_книг.библиотекарь_id', ruTo: 'Библиотекари.id' },
  ];

  return (
    <div className="space-y-6">
      {/* Subtab navigation */}
      <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl w-full sm:w-fit">
        <button
          onClick={() => setSubTab('erd')}
          className={`flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 text-xs font-semibold rounded-lg transition-all min-h-[38px] ${
            subTab === 'erd'
              ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-amber-600" />
          <span>Схема БД (ERD)</span>
        </button>

        <button
          onClick={() => setSubTab('lifecycle')}
          className={`flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 text-xs font-semibold rounded-lg transition-all min-h-[38px] ${
            subTab === 'lifecycle'
              ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-amber-600" />
          <span className="truncate">Жизненный цикл (ЖЦИС)</span>
        </button>
      </div>

      {subTab === 'lifecycle' ? (
        <LifecycleView />
      ) : (
        <>
          {/* Overview header */}
          <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-neutral-800" />
            <h3 className="text-base font-bold text-neutral-900">
              Архитектура реляционной базы данных (RunSQL / DBML)
            </h3>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            6 взаимосвязанных таблиц, 5 внешних ключей (Foreign Keys), поля локации фонда (<code className="text-amber-700 font-mono">location</code>) и даты поступления (<code className="text-amber-700 font-mono">arrival_date</code>).
          </p>
        </div>

        {/* Copy & View mode switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded-lg bg-neutral-100 p-0.5 text-xs font-medium text-neutral-600">
            <button
              onClick={() => setSchemaMode('runsql')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                schemaMode === 'runsql'
                  ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                  : 'hover:text-neutral-900'
              }`}
            >
              RunSQL (EN)
            </button>
            <button
              onClick={() => setSchemaMode('ru')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                schemaMode === 'ru'
                  ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                  : 'hover:text-neutral-900'
              }`}
            >
              DBML (RU)
            </button>
            <button
              onClick={() => setSchemaMode('sql')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                schemaMode === 'sql'
                  ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                  : 'hover:text-neutral-900'
              }`}
            >
              SQL DDL
            </button>
          </div>

          <button
            onClick={copyCode}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-lg shadow-xs transition-colors shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Скопировано!' : 'Копировать код'}</span>
          </button>
        </div>
      </div>

      {/* Relations Quick Bar */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">
          Внешние связи (Foreign Keys):
        </span>
        {relations.map((rel) => {
          const isHovered = highlightedRef === rel.id;
          const fromLabel = schemaMode === 'ru' ? rel.ruFrom : rel.from;
          const toLabel = schemaMode === 'ru' ? rel.ruTo : rel.to;

          return (
            <button
              key={rel.id}
              onMouseEnter={() => setHighlightedRef(rel.id)}
              onMouseLeave={() => setHighlightedRef(null)}
              onClick={() => setHighlightedRef(isHovered ? null : rel.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono transition-all ${
                isHovered
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white border border-neutral-200 text-neutral-700 hover:border-neutral-400'
              }`}
            >
              <Link2 className="w-3 h-3" />
              <span>{fromLabel}</span>
              <ArrowRight className="w-2.5 h-2.5 opacity-60" />
              <span>{toLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Visual Tables Schema Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Table 1: books */}
        <div
          className={`bg-white rounded-xl border transition-all overflow-hidden shadow-xs ${
            highlightedRef === 'b_a' || highlightedRef === 'b_g' || highlightedRef === 'l_b'
              ? 'ring-2 ring-amber-500 border-amber-500'
              : 'border-neutral-200'
          }`}
        >
          <div className="px-4 py-3 bg-neutral-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">
                Table {schemaMode === 'ru' ? 'Книги' : 'books'}
              </span>
            </div>
            <span className="text-[11px] font-mono bg-neutral-800 px-2 py-0.5 rounded text-neutral-300">
              {books.length} строк
            </span>
          </div>

          <div className="divide-y divide-neutral-100 text-xs font-mono">
            <div className="px-4 py-2 flex items-center justify-between bg-amber-50/40">
              <span className="font-semibold text-neutral-900 flex items-center gap-1">
                <Key className="w-3 h-3 text-amber-600" /> id
              </span>
              <span className="text-neutral-500 text-[11px]">int [pk, increment]</span>
            </div>
            <div className="px-4 py-2 flex items-center justify-between">
              <span className="text-neutral-800">{schemaMode === 'ru' ? 'название' : 'title'}</span>
              <span className="text-neutral-500 text-[11px]">varchar(200)</span>
            </div>
            <div className={`px-4 py-2 flex items-center justify-between ${highlightedRef === 'b_a' ? 'bg-amber-100 text-amber-900 font-bold' : ''}`}>
              <span className="flex items-center gap-1 text-amber-700 font-medium">
                <Link2 className="w-3 h-3" /> {schemaMode === 'ru' ? 'автор_id' : 'author_id'}
              </span>
              <span className="text-neutral-500 text-[11px]">&gt; {schemaMode === 'ru' ? 'Авторы.id' : 'authors.id'}</span>
            </div>
            <div className="px-4 py-2 flex items-center justify-between">
              <span className="text-neutral-800">{schemaMode === 'ru' ? 'год_издания' : 'year_published'}</span>
              <span className="text-neutral-500 text-[11px]">int</span>
            </div>
            <div className={`px-4 py-2 flex items-center justify-between ${highlightedRef === 'b_g' ? 'bg-amber-100 text-amber-900 font-bold' : ''}`}>
              <span className="flex items-center gap-1 text-amber-700 font-medium">
                <Link2 className="w-3 h-3" /> {schemaMode === 'ru' ? 'жанр_id' : 'genre_id'}
              </span>
              <span className="text-neutral-500 text-[11px]">&gt; {schemaMode === 'ru' ? 'Жанры.id' : 'genres.id'}</span>
            </div>
            <div className="px-4 py-2 flex items-center justify-between">
              <span className="text-neutral-800">{schemaMode === 'ru' ? 'издательство' : 'publisher'}</span>
              <span className="text-neutral-500 text-[11px]">varchar(150)</span>
            </div>
            <div className="px-4 py-2 flex items-center justify-between">
              <span className="text-neutral-800">{schemaMode === 'ru' ? 'количество' : 'quantity'}</span>
              <span className="text-neutral-500 text-[11px]">int</span>
            </div>
            <div className="px-4 py-2 flex items-center justify-between bg-emerald-50/20">
              <span className="text-emerald-800 font-medium">{schemaMode === 'ru' ? 'доступно' : 'available'}</span>
              <span className="text-neutral-500 text-[11px]">int</span>
            </div>
            {/* Added RunSQL fields */}
            <div className="px-4 py-2 flex items-center justify-between bg-blue-50/20">
              <span className="text-blue-900 font-medium">location</span>
              <span className="text-neutral-500 text-[11px]">varchar(100)</span>
            </div>
            <div className="px-4 py-2 flex items-center justify-between bg-blue-50/20">
              <span className="text-blue-900 font-medium">arrival_date</span>
              <span className="text-neutral-500 text-[11px]">date</span>
            </div>
          </div>
        </div>

        {/* Table 2: loans */}
        <div
          className={`bg-white rounded-xl border transition-all overflow-hidden shadow-xs ${
            highlightedRef === 'l_b' || highlightedRef === 'l_r' || highlightedRef === 'l_lib'
              ? 'ring-2 ring-amber-500 border-amber-500'
              : 'border-neutral-200'
          }`}
        >
          <div className="px-4 py-3 bg-amber-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">
                Table {schemaMode === 'ru' ? 'Выдача_книг' : 'loans'}
              </span>
            </div>
            <span className="text-[11px] font-mono bg-amber-950 px-2 py-0.5 rounded text-amber-200">
              {loans.length} строк
            </span>
          </div>

          <div className="divide-y divide-neutral-100 text-xs font-mono">
            <div className="px-4 py-2 flex items-center justify-between bg-amber-50/40">
              <span className="font-semibold text-neutral-900 flex items-center gap-1">
                <Key className="w-3 h-3 text-amber-600" /> id
              </span>
              <span className="text-neutral-500 text-[11px]">int [pk, increment]</span>
            </div>
            <div className={`px-4 py-2 flex items-center justify-between ${highlightedRef === 'l_b' ? 'bg-amber-100 text-amber-900 font-bold' : ''}`}>
              <span className="flex items-center gap-1 text-amber-700 font-medium">
                <Link2 className="w-3 h-3" /> {schemaMode === 'ru' ? 'книга_id' : 'book_id'}
              </span>
              <span className="text-neutral-500 text-[11px]">&gt; {schemaMode === 'ru' ? 'Книги.id' : 'books.id'}</span>
            </div>
            <div className={`px-4 py-2 flex items-center justify-between ${highlightedRef === 'l_r' ? 'bg-amber-100 text-amber-900 font-bold' : ''}`}>
              <span className="flex items-center gap-1 text-amber-700 font-medium">
                <Link2 className="w-3 h-3" /> {schemaMode === 'ru' ? 'читатель_id' : 'reader_id'}
              </span>
              <span className="text-neutral-500 text-[11px]">&gt; {schemaMode === 'ru' ? 'Читатели.id' : 'readers.id'}</span>
            </div>
            <div className={`px-4 py-2 flex items-center justify-between ${highlightedRef === 'l_lib' ? 'bg-amber-100 text-amber-900 font-bold' : ''}`}>
              <span className="flex items-center gap-1 text-amber-700 font-medium">
                <Link2 className="w-3 h-3" /> {schemaMode === 'ru' ? 'библиотекарь_id' : 'librarian_id'}
              </span>
              <span className="text-neutral-500 text-[11px]">&gt; {schemaMode === 'ru' ? 'Библиотекари.id' : 'librarians.id'}</span>
            </div>
            <div className="px-4 py-2 flex items-center justify-between">
              <span className="text-neutral-800">{schemaMode === 'ru' ? 'дата_выдачи' : 'issue_date'}</span>
              <span className="text-neutral-500 text-[11px]">date</span>
            </div>
            <div className="px-4 py-2 flex items-center justify-between">
              <span className="text-neutral-800">{schemaMode === 'ru' ? 'срок_возврата' : 'due_date'}</span>
              <span className="text-neutral-500 text-[11px]">date</span>
            </div>
            <div className="px-4 py-2 flex items-center justify-between">
              <span className="text-neutral-800">{schemaMode === 'ru' ? 'дата_возврата' : 'return_date'}</span>
              <span className="text-neutral-500 text-[11px]">date</span>
            </div>
            <div className="px-4 py-2 flex items-center justify-between">
              <span className="text-neutral-800">{schemaMode === 'ru' ? 'статус' : 'status'}</span>
              <span className="text-neutral-500 text-[11px]">varchar(50)</span>
            </div>
          </div>
        </div>

        {/* Table 3: readers */}
        <div
          className={`bg-white rounded-xl border transition-all overflow-hidden shadow-xs ${
            highlightedRef === 'l_r' ? 'ring-2 ring-amber-500 border-amber-500' : 'border-neutral-200'
          }`}
        >
          <div className="px-4 py-3 bg-neutral-900 text-white flex items-center justify-between">
            <span className="font-bold text-sm">
              Table {schemaMode === 'ru' ? 'Читатели' : 'readers'}
            </span>
            <span className="text-[11px] font-mono bg-neutral-800 px-2 py-0.5 rounded text-neutral-300">
              {readers.length} строк
            </span>
          </div>

          <div className="divide-y divide-neutral-100 text-xs font-mono">
            <div className="px-4 py-2 flex items-center justify-between bg-amber-50/40">
              <span className="font-semibold text-neutral-900 flex items-center gap-1">
                <Key className="w-3 h-3 text-amber-600" /> id
              </span>
              <span className="text-neutral-500 text-[11px]">int [pk, increment]</span>
            </div>
            <div className="px-4 py-2 flex items-center justify-between">
              <span className="text-neutral-800">{schemaMode === 'ru' ? 'фио' : 'full_name'}</span>
              <span className="text-neutral-500 text-[11px]">varchar(150)</span>
            </div>
            <div className="px-4 py-2 flex items-center justify-between">
              <span className="text-neutral-800">{schemaMode === 'ru' ? 'телефон' : 'phone'}</span>
              <span className="text-neutral-500 text-[11px]">varchar(20)</span>
            </div>
            <div className="px-4 py-2 flex items-center justify-between">
              <span className="text-neutral-800">email</span>
              <span className="text-neutral-500 text-[11px]">varchar(100)</span>
            </div>
            <div className="px-4 py-2 flex items-center justify-between">
              <span className="text-neutral-800">{schemaMode === 'ru' ? 'дата_регистрации' : 'registration_date'}</span>
              <span className="text-neutral-500 text-[11px]">date</span>
            </div>
          </div>
        </div>

        {/* Table 4: authors */}
        <div
          className={`bg-white rounded-xl border transition-all overflow-hidden shadow-xs ${
            highlightedRef === 'b_a' ? 'ring-2 ring-amber-500 border-amber-500' : 'border-neutral-200'
          }`}
        >
          <div className="px-4 py-3 bg-neutral-900 text-white flex items-center justify-between">
            <span className="font-bold text-sm">
              Table {schemaMode === 'ru' ? 'Авторы' : 'authors'}
            </span>
            <span className="text-[11px] font-mono bg-neutral-800 px-2 py-0.5 rounded text-neutral-300">
              {authors.length} строк
            </span>
          </div>

          <div className="divide-y divide-neutral-100 text-xs font-mono">
            <div className="px-4 py-2 flex items-center justify-between bg-amber-50/40">
              <span className="font-semibold text-neutral-900 flex items-center gap-1">
                <Key className="w-3 h-3 text-amber-600" /> id
              </span>
              <span className="text-neutral-500 text-[11px]">int [pk, increment]</span>
            </div>
            <div className="px-4 py-2 flex items-center justify-between">
              <span className="text-neutral-800">{schemaMode === 'ru' ? 'фио' : 'full_name'}</span>
              <span className="text-neutral-500 text-[11px]">varchar(150)</span>
            </div>
            <div className="px-4 py-2 flex items-center justify-between">
              <span className="text-neutral-800">{schemaMode === 'ru' ? 'страна' : 'country'}</span>
              <span className="text-neutral-500 text-[11px]">varchar(100)</span>
            </div>
            <div className="px-4 py-2 flex items-center justify-between">
              <span className="text-neutral-800">{schemaMode === 'ru' ? 'год_рождения' : 'birth_year'}</span>
              <span className="text-neutral-500 text-[11px]">int</span>
            </div>
          </div>
        </div>

        {/* Table 5: genres */}
        <div
          className={`bg-white rounded-xl border transition-all overflow-hidden shadow-xs ${
            highlightedRef === 'b_g' ? 'ring-2 ring-amber-500 border-amber-500' : 'border-neutral-200'
          }`}
        >
          <div className="px-4 py-3 bg-neutral-900 text-white flex items-center justify-between">
            <span className="font-bold text-sm">
              Table {schemaMode === 'ru' ? 'Жанры' : 'genres'}
            </span>
            <span className="text-[11px] font-mono bg-neutral-800 px-2 py-0.5 rounded text-neutral-300">
              {genres.length} строк
            </span>
          </div>

          <div className="divide-y divide-neutral-100 text-xs font-mono">
            <div className="px-4 py-2 flex items-center justify-between bg-amber-50/40">
              <span className="font-semibold text-neutral-900 flex items-center gap-1">
                <Key className="w-3 h-3 text-amber-600" /> id
              </span>
              <span className="text-neutral-500 text-[11px]">int [pk, increment]</span>
            </div>
            <div className="px-4 py-2 flex items-center justify-between">
              <span className="text-neutral-800">{schemaMode === 'ru' ? 'название' : 'name'}</span>
              <span className="text-neutral-500 text-[11px]">varchar(100)</span>
            </div>
          </div>
        </div>

        {/* Table 6: librarians */}
        <div
          className={`bg-white rounded-xl border transition-all overflow-hidden shadow-xs ${
            highlightedRef === 'l_lib' ? 'ring-2 ring-amber-500 border-amber-500' : 'border-neutral-200'
          }`}
        >
          <div className="px-4 py-3 bg-neutral-900 text-white flex items-center justify-between">
            <span className="font-bold text-sm">
              Table {schemaMode === 'ru' ? 'Библиотекари' : 'librarians'}
            </span>
            <span className="text-[11px] font-mono bg-neutral-800 px-2 py-0.5 rounded text-neutral-300">
              {librarians.length} строк
            </span>
          </div>

          <div className="divide-y divide-neutral-100 text-xs font-mono">
            <div className="px-4 py-2 flex items-center justify-between bg-amber-50/40">
              <span className="font-semibold text-neutral-900 flex items-center gap-1">
                <Key className="w-3 h-3 text-amber-600" /> id
              </span>
              <span className="text-neutral-500 text-[11px]">int [pk, increment]</span>
            </div>
            <div className="px-4 py-2 flex items-center justify-between">
              <span className="text-neutral-800">{schemaMode === 'ru' ? 'фио' : 'full_name'}</span>
              <span className="text-neutral-500 text-[11px]">varchar(150)</span>
            </div>
            <div className="px-4 py-2 flex items-center justify-between">
              <span className="text-neutral-800">{schemaMode === 'ru' ? 'должность' : 'position'}</span>
              <span className="text-neutral-500 text-[11px]">varchar(100)</span>
            </div>
            <div className="px-4 py-2 flex items-center justify-between">
              <span className="text-neutral-800">{schemaMode === 'ru' ? 'телефон' : 'phone'}</span>
              <span className="text-neutral-500 text-[11px]">varchar(20)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Raw Code Viewer for the selected mode */}
      <div className="bg-neutral-950 text-neutral-200 rounded-xl p-4 overflow-hidden border border-neutral-800">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-mono text-neutral-300">
              {schemaMode === 'runsql'
                ? 'runsql_schema.dbml (English specification with location & arrival_date)'
                : schemaMode === 'ru'
                ? 'library_schema_ru.dbml'
                : 'create_tables_ddl.sql'}
            </span>
          </div>
          <span className="text-[11px] text-neutral-500">6 tables · 5 foreign keys</span>
        </div>
        <pre className="text-xs font-mono leading-relaxed overflow-x-auto text-neutral-300 max-h-96">
          {schemaMode === 'runsql' ? runSqlCode : schemaMode === 'ru' ? rawDBML : sqlDDL}
        </pre>
      </div>
        </>
      )}
    </div>
  );
};
