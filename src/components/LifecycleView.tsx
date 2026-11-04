import React, { useState } from 'react';
import {
  Compass,
  FileCheck2,
  Layers,
  Code2,
  CheckCircle,
  Rocket,
  Wrench,
  Archive,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Download,
  Database,
  ShieldCheck,
  Eye,
  Flame,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';

interface StageData {
  id: number;
  title: string;
  shortDesc: string;
  status: 'Завершен' | 'В активной эксплуатации' | 'Спроектирован';
  statusColor: string;
  icon: React.ReactNode;
  goals: string[];
  projectSpecifics: string[];
  deliverables: string[];
  techDetails: string[];
}

export const LifecycleView: React.FC = () => {
  const [activeStageId, setActiveStageId] = useState<number | 'all'>('all');
  const [copied, setCopied] = useState(false);

  const stages: StageData[] = [
    {
      id: 1,
      title: '1. Планирование и анализ потребностей',
      shortDesc: 'Определение целей, назначения АИС, проблематики учета и ресурсов разработки',
      status: 'Завершен',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
      icon: <Compass className="w-5 h-5 text-amber-600" />,
      goals: [
        'Оцифровка процессов библиотечного фонда: переход от бумажных формуляров к централизованной информационной системе.',
        'Исключение потерь книг и неконтролируемых просрочек возврата изданий.',
        'Создание безопасного для зрения электронного читального зала для вечерней и ночной работы пользователей.',
      ],
      projectSpecifics: [
        'Анализ проблем традиционного учета: утеря бумажных карточек, отсутствие оперативной видимости остатков на полках («на руках» vs «в наличии»).',
        'Обоснование создания АИС «БиблиоТех» с поддержкой 6 связанных сущностей (Книги, Авторы, Жанры, Читатели, Библиотекари, Выдача).',
        'Определение ограничений: работа в веб-среде без установки тяжелого ПО, автономная работа с LocalStorage/JSON, высокая скорость отклика.',
      ],
      deliverables: [
        'Технико-экономическое обоснование (ТЭО) проекта «БиблиоТех».',
        'Паспорт информационной системы и календарный план реализации.',
        'Оценка рисков и выбор стека: React 19, TypeScript, Tailwind CSS, Vite.',
      ],
      techDetails: [
        'Срок реализации базовой версии: 2 спринта.',
        'Целевая аудитория: сотрудники абонемента, читатели библиотеки, администрация.',
      ],
    },
    {
      id: 2,
      title: '2. Сбор и анализ требований',
      shortDesc: 'Функциональные и нефункциональные требования к учету фонда, авторизации и чтению',
      status: 'Завершен',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
      icon: <FileCheck2 className="w-5 h-5 text-sky-600" />,
      goals: [
        'Формирование функциональных требований (FR) к учетным операциям и читательскому интерфейсу.',
        'Формирование нефункциональных требований (NFR): эргономика зрения, темы оформления, производительность.',
      ],
      projectSpecifics: [
        'FR-1 (Каталог фонда): Хранение книг с полями title, author_id, year_published, genre_id, publisher, quantity, available, location (место на полке), arrival_date (дата поступления).',
        'FR-2 (Контроль выдачи): Оформление выдачи читателю с декрементом available, автоматическим вычислением даты возврата (+14 дней) и фиксацией библиотекаря.',
        'FR-3 (Авторизация и профиль): Разделение ролей (Сотрудник библиотеки / Читатель) с заполнением личных данных (ФИО, телефон, email).',
        'FR-4 (Читальный зал): Режим чтения книг с адаптацией под системный ночной свет (Night Light) для комфорта глаз в темное время суток.',
        'FR-5 (Переключение тем): Поддержка светлой, темной, янтарной (ночной свет) и сепия тем интерфейса.',
        'NFR-1: Мгновенный отклик поиска и фильтрации без перезагрузки страниц (<50 мс).',
        'NFR-2: Целостность данных (Foreign Keys: запрет удаления автора при наличии книг в фонде).',
      ],
      deliverables: [
        'Спецификация требований к программному обеспечению (SRS).',
        'Таблица соответствия ролей и матрица прав доступа (RBAC: Librarian / Reader).',
        'User Stories и Use Case сценарии («Выдать книгу», «Принять возврат», «Читать при ночном свете»).',
      ],
      techDetails: [
        'Регламент хранения дат: формат ISO-8601 (YYYY-MM-DD).',
        'Требования доступности: контрастность по стандарту WCAG AA.',
      ],
    },
    {
      id: 3,
      title: '3. Проектирование',
      shortDesc: 'Разработка ER-модели базы данных, связей, UI/UX и архитектурных компонентов',
      status: 'Завершен',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
      icon: <Layers className="w-5 h-5 text-indigo-600" />,
      goals: [
        'Проектирование нормализованной реляционной модели данных (3NF).',
        'Разработка компонентной архитектуры фронтенда и структуры контекстов состояния.',
        'Дизайн пользовательских интерфейсов с соблюдением правил Anti-AI Slop и zero-pill дисциплины.',
      ],
      projectSpecifics: [
        'ER-диаграмма из 6 таблиц: books, authors, genres, readers, librarians, loans.',
        '5 внешних связей: books.author_id > authors.id, books.genre_id > genres.id, loans.book_id > books.id, loans.reader_id > readers.id, loans.librarian_id > librarians.id.',
        'Проектирование состояний выдачи: «на руках» (активна), «возвращена» (закрыта), «просрочена» (срок истек).',
        'Архитектура 3-зонного интерфейса: брендовая шапка, навигационная панель, рабочая область с карточками и таблицами.',
        'Проектирование модуля ночного света: калибровка цветовой температуры (warm umber #181410, золотистый крем #f5ebdd) и теплового фильтра.',
      ],
      deliverables: [
        'Схема базы данных в форматах RunSQL, DBML и стандартного SQL DDL.',
        'Диаграмма потоков данных (DFD) и схема переходов между вкладками.',
        'Прототипы интерфейса: Таблица фонда, Карточка выдачи, Читальный зал, Панель авторизации.',
      ],
      techDetails: [
        'Состояние приложения: React Context API (LibraryContext, ThemeContext).',
        'Хранилище: абстракция LocalStorage c JSON-сериализацией и защитой от повреждения данных.',
      ],
    },
    {
      id: 4,
      title: '4. Разработка',
      shortDesc: 'Программная реализация компонентов, логики БД, ридера и тем оформления',
      status: 'Завершен',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
      icon: <Code2 className="w-5 h-5 text-emerald-600" />,
      goals: [
        'Написание чистого, строго типизированного кода на TypeScript 5.8+ и React 19.',
        'Реализация CRUD-операций для всех 6 сущностей библиотеки с валидацией бизнес-правил.',
        'Создание специализированного BookReaderModal с оглавлением, закладками и ночным светом.',
      ],
      projectSpecifics: [
        'Создание ядра типов src/types/database.ts: поддержка полей RunSQL (location, arrival_date) и русских названий.',
        'Реализация бизнес-логики в src/context/LibraryContext.tsx: issueBook, returnBook, prolongLoan, importDatabaseJSON, exportDatabaseJSON.',
        'Реализация переключателя тем и ночного света в src/context/ThemeContext.tsx: плавный оверлей спектра, CSS-переменные.',
        'Создание аутентичной литературной базы src/data/bookTexts.ts (произведения Толстого, Булгакова, Достоевского, Стругацких, Оруэлла, Брэдбери).',
        'Разработка адаптивных компонентов: TopBar, BooksTab, LoansTab, ReadingRoomTab, AuthPanel, StatsBanner.',
      ],
      deliverables: [
        'Исходный код веб-приложения «БиблиоТех» в репозитории проекта.',
        'Конфигурационные файлы: package.json, tsconfig.json, vite.config.ts, metadata.json.',
        'Модуль резервного копирования и восстановления данных в JSON.',
      ],
      techDetails: [
        'Сборка Vite 6 + Tailwind CSS v4.',
        'Использование шрифтов Plus Jakarta Sans, Literata, Merriweather, JetBrains Mono.',
      ],
    },
    {
      id: 5,
      title: '5. Тестирование',
      shortDesc: 'Верификация логики выдачи, статический анализ типов, проверка тем и ночного света',
      status: 'Завершен',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
      icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
      goals: [
        'Проверка корректности работы всех функций, отсутствия критических ошибок и утечек памяти.',
        'Контроль строгой типизации TypeScript (tsc --noEmit) и проверка сборки (vite build).',
      ],
      projectSpecifics: [
        'Тестирование бизнес-правил остатка: при выдаче книги disponible уменьшается на 1; выдача блокируется при available = 0.',
        'Тестирование возврата: возврат книги увеличивает available на 1 и фиксирует return_date.',
        'Тестирование просрочек: автоматический пересчет статуса на «просрочена», если срок_возврата < текущая дата.',
        'Тестирование читального зала: проверка переключения 5 тем чтения, ползунка теплоты (0–80%), размера шрифта (14–28px), сохранения закладок.',
        'Тестирование глобального Theme Switcher: проверка корректной отрисовки во всех 4 темах (Светлая, Тёмная, Ночной свет, Сепия).',
      ],
      deliverables: [
        'Отчет об успешном прохождении статического анализа tsc (0 ошибок, 0 ворнингов).',
        'Успешный production-билд приложения (compile_applet: Success).',
        'Чек-лист регрессионного тестирования интерфейса и сценариев выдачи/возврата.',
      ],
      techDetails: [
        'Тестовые наборы: позитивные и негативные сценарии ввода номеров телефонов и email.',
        'Проверка валидации целостности при импорте сторонних JSON-файлов базы.',
      ],
    },
    {
      id: 6,
      title: '6. Внедрение',
      shortDesc: 'Развертывание веб-приложения на порту 3000, первоначальная загрузка фонда и запуск',
      status: 'Завершен',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
      icon: <Rocket className="w-5 h-5 text-purple-600" />,
      goals: [
        'Ввод информационной системы в эксплуатацию в рабочей среде.',
        'Первоначальное наполнение каталога демонстрационными записями фонда, читателей и сотрудников.',
        'Обеспечение доступности по постоянному веб-адресу для пользователей.',
      ],
      projectSpecifics: [
        'Развертывание контейнера приложения на платформе Google Cloud Run с dev-сервером Vite (порт 3000).',
        'Инициализация базы данных: 16 изданий художественной и научной литературы, 8 авторов, 7 жанров, читатели и библиотекари.',
        'Интеграция приветственной панели авторизации и регистрации на главной странице для быстрого старта новых пользователей.',
        'Публикация документации по ERD-схеме и жизненному циклу прямо в интерфейсе системы.',
      ],
      deliverables: [
        'Работающий веб-сервис АИС «БиблиоТех» (HTTP 200 OK на порту 3000).',
        'Инструкция пользователя по работе с каталогом и оформлению выдачи книг.',
        'Начальная база данных с возможностью отката к заводским настройкам (resetToDemo).',
      ],
      techDetails: [
        'Конфигурация сервера: 0.0.0.0:3000 с поддержкой быстрого горячего обновления.',
      ],
    },
    {
      id: 7,
      title: '7. Эксплуатация и сопровождение',
      shortDesc: 'Регулярная работа библиотеки, бэкапы JSON, контроль должников и оптимизация ридера',
      status: 'В активной эксплуатации',
      statusColor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
      icon: <Wrench className="w-5 h-5 text-amber-600" />,
      goals: [
        'Непрерывное обеспечение выполнения библиотечных процессов в штатном режиме.',
        'Резервное копирование данных для предотвращения потерь при сбоях оборудования.',
        'Своевременное выявление и устранение замечаний пользователей, добавление новых книг.',
      ],
      projectSpecifics: [
        'Ежедневные операции: регистрация новых читателей, оформление выдачи литературы, продление сроков пользования (+14 дней).',
        'Мониторинг фонда: отслеживание книг с нулевым остатком и оперативный контроль должников по статусу «просрочена».',
        'Резервное копирование: регулярная выгрузка базы данных в JSON-файл через кнопку «Экспорт» в верхней панели.',
        'Восстановление: загрузка архивной копии через кнопку «Импорт» в 1 клик.',
        'Пополнение читального зала: возможность загружать собственные тексты (.txt, .md) для чтения в режиме защиты зрения.',
      ],
      deliverables: [
        'Регламент ежедневного создания резервных копий БД.',
        'Журнал выданных и возвращенных изданий с временными метками.',
        'Обновления каталога фонда и профилей читателей.',
      ],
      techDetails: [
        'Мониторинг статуса приложения: проверка HTTP 200, отслеживание ошибок в консоли.',
        'Локальное сохранение состояния с версионированием ключей storage.',
      ],
    },
    {
      id: 8,
      title: '8. Вывод из эксплуатации',
      shortDesc: 'Регламент архивации данных, экспорт базы в открытые форматы и миграция на СУБД',
      status: 'Спроектирован',
      statusColor: 'bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700',
      icon: <Archive className="w-5 h-5 text-neutral-600" />,
      goals: [
        'Безопасное прекращение использования текущей версии системы при замене или модернизации.',
        'Полное сохранение исторической информации фонда, читателей и транзакций выдачи.',
      ],
      projectSpecifics: [
        'Сценарий вывода: плановый переход на корпоративную распределенную реляционную СУБД (PostgreSQL / Cloud SQL) при открытии филиальной сети.',
        'Процедура миграции: полная выгрузка данных в универсальный JSON и выполнение сгенерированного SQL DDL-скрипта (вкладка «Схема БД»).',
        'Аудит невозвращенных книг: формирование финального отчета по читателям с активными задолженностями перед закрытием системы.',
        'Архивирование: создание долговременной архивной копии состояния базы данных с фиксацией контрольной суммы (SHA-256).',
        'Окончательное отключение: деактивация веб-сервера и передача архивных реестров в архив библиотеки.',
      ],
      deliverables: [
        'Финальный архив базы данных библиотеки в форматах JSON и SQL Dump.',
        'Акт приема-передачи данных в новую информационную систему.',
        'Итоговый статистический отчет о деятельности АИС «БиблиоТех» за период эксплуатации.',
      ],
      techDetails: [
        'Совместимость схемы с PostgreSQL, MySQL и SQLite благодаря стандартному SQL DDL скрипту.',
      ],
    },
  ];

  const handleCopyReport = () => {
    const textReport = `# Жизненный цикл информационной системы «БиблиоТех»

${stages
  .map(
    (s) => `## ${s.title}
*Статус*: ${s.status}
*Назначение*: ${s.shortDesc}

### Основные задачи:
${s.goals.map((g) => `- ${g}`).join('\n')}

### Реализация в проекте «БиблиоТех»:
${s.projectSpecifics.map((p) => `- ${p}`).join('\n')}

### Артефакты и результаты этапа:
${s.deliverables.map((d) => `- ${d}`).join('\n')}
`
  )
  .join('\n---\n\n')}`;

    navigator.clipboard.writeText(textReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Методология ЖЦИС (Жизненный цикл ИС)</span>
            </div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              Жизненный цикл информационной системы «БиблиоТех»
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              Полное описание 8 классических этапов жизненного цикла информационной системы применительно к проекту автоматизированной библиотеки «БиблиоТех» — от зарождения идеи до регламента вывода из эксплуатации.
            </p>
          </div>

          <button
            onClick={handleCopyReport}
            className="flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-lg transition-colors w-full sm:w-auto shrink-0 shadow-2xs min-h-[40px]"
            title="Скопировать структурированный отчет по всем 8 этапам"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 dark:text-emerald-400">Скопировано в буфер!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-neutral-600" />
                <span>Скопировать отчет (Markdown)</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Stage Timeline Strip */}
        <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {stages.map((st) => (
            <button
              key={st.id}
              onClick={() => setActiveStageId(st.id === activeStageId ? 'all' : st.id)}
              className={`p-2 rounded-lg border text-left text-xs transition-all flex flex-col justify-between ${
                activeStageId === st.id
                  ? 'border-amber-500 bg-amber-50/80 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 font-semibold ring-1 ring-amber-500'
                  : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold opacity-60">Этап {st.id}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </div>
              <div className="text-[11px] leading-tight line-clamp-2">
                {st.title.replace(/^\d+\.\s*/, '')}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center justify-between gap-3 text-xs">
        <div className="text-neutral-500 dark:text-neutral-400 font-medium">
          {activeStageId === 'all'
            ? 'Отображаются все 8 этапов жизненного цикла'
            : `Выбран этап ${activeStageId} из 8`}
        </div>
        {activeStageId !== 'all' && (
          <button
            onClick={() => setActiveStageId('all')}
            className="text-amber-700 dark:text-amber-400 hover:underline font-medium"
          >
            Показать все этапы &rarr;
          </button>
        )}
      </div>

      {/* Stages Cards */}
      <div className="space-y-4">
        {stages
          .filter((st) => activeStageId === 'all' || activeStageId === st.id)
          .map((stage) => (
            <article
              key={stage.id}
              className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-xs transition-all hover:border-amber-500/40"
            >
              {/* Stage Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800/60 shrink-0">
                    {stage.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                      {stage.title}
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {stage.shortDesc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${stage.statusColor}`}
                  >
                    <CheckCircle className="w-3 h-3" />
                    <span>{stage.status}</span>
                  </span>
                </div>
              </div>

              {/* Stage Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 text-xs">
                {/* 1. Goals */}
                <div className="space-y-2">
                  <div className="font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                    <Compass className="w-3.5 h-3.5" />
                    <span>Цели и назначение этапа</span>
                  </div>
                  <ul className="space-y-1.5 text-neutral-600 dark:text-neutral-300">
                    {stage.goals.map((g, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                        <span className="text-amber-500 font-bold mt-0.5">•</span>
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 2. Specifics for BiblioTech */}
                <div className="space-y-2 md:col-span-1">
                  <div className="font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                    <Database className="w-3.5 h-3.5" />
                    <span>Реализация в «БиблиоТех»</span>
                  </div>
                  <ul className="space-y-1.5 text-neutral-600 dark:text-neutral-300">
                    {stage.projectSpecifics.map((p, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                        <span className="text-amber-500 font-bold mt-0.5">•</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 3. Deliverables */}
                <div className="space-y-2">
                  <div className="font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Артефакты и результаты</span>
                  </div>
                  <ul className="space-y-1.5 text-neutral-600 dark:text-neutral-300">
                    {stage.deliverables.map((d, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                        <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>

                  {stage.techDetails.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-400">
                      {stage.techDetails.map((td, i) => (
                        <div key={i} className="leading-snug">
                          {td}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
      </div>
    </div>
  );
};
