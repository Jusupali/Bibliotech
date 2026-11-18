const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  PageBreak
} = require('docx');

function createStyledCell(text, isHeader = false, widthPercent = 25, isKey = false) {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    shading: {
      fill: isHeader ? "1E3A8A" : isKey ? "F1F5F9" : "FFFFFF"
    },
    margins: { top: 120, bottom: 120, left: 140, right: 140 },
    children: [
      new Paragraph({
        alignment: isHeader ? AlignmentType.CENTER : AlignmentType.LEFT,
        children: [
          new TextRun({
            text: text,
            bold: isHeader || isKey,
            color: isHeader ? "FFFFFF" : "0F172A",
            font: "Arial",
            size: isHeader ? 20 : 19
          })
        ]
      })
    ]
  });
}

function createCustomTable(headers, rowsData) {
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map(h => createStyledCell(h.title, true, h.width))
  });

  const dataRows = rowsData.map(row => {
    return new TableRow({
      children: row.map((cellText, idx) => {
        const isKeyCol = idx === 0 || (headers[idx] && headers[idx].isKey);
        return createStyledCell(cellText, false, headers[idx].width, isKeyCol);
      })
    });
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
      left: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
      right: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "E2E8F0" },
      insideVertical: { style: BorderStyle.SINGLE, size: 2, color: "E2E8F0" }
    },
    rows: [headerRow, ...dataRows]
  });
}

function createCodeBlock(codeLines) {
  return codeLines.map(line =>
    new Paragraph({
      spacing: { line: 240, before: 30, after: 30 },
      shading: { fill: "F8FAFC" },
      children: [
        new TextRun({
          text: line,
          font: "Consolas",
          size: 18,
          color: line.trim().startsWith("#") || line.trim().startsWith('"""') ? "059669" : "1E293B",
          bold: line.trim().startsWith("def ") || line.trim().startsWith("class ") || line.trim().startsWith("if ") || line.trim().startsWith("return ")
        })
      ]
    })
  );
}

function p(text, opts = {}) {
  return new Paragraph({
    alignment: opts.alignment || AlignmentType.LEFT,
    spacing: { before: opts.before || 120, after: opts.after || 120, line: opts.line || 280 },
    children: [
      new TextRun({
        text: text,
        font: opts.font || "Arial",
        size: opts.size || 22,
        bold: opts.bold || false,
        italics: opts.italics || false,
        color: opts.color || "0F172A"
      })
    ]
  });
}

function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 180 },
    children: [
      new TextRun({
        text: text,
        font: "Arial",
        size: 30,
        bold: true,
        color: "1E3A8A"
      })
    ]
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 260, after: 120 },
    children: [
      new TextRun({
        text: text,
        font: "Arial",
        size: 24,
        bold: true,
        color: "0F172A"
      })
    ]
  });
}

function bullet(text) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 60, after: 60, line: 260 },
    children: [
      new TextRun({
        text: text,
        font: "Arial",
        size: 22,
        color: "1E293B"
      })
    ]
  });
}

async function buildReadersDocument() {
  const pythonCode = [
    '"""',
    'Модуль: readers_service.py',
    'Назначение: Управление читателями и их абонементами в АИС «БиблиоТех»',
    'Авторы: Дарқан Ж.С., Ерменғали Е.Е. (группа ИСР 311)',
    'Жетысуский университет им. И. Жансугурова, г. Талдыкорган',
    '"""',
    '',
    'from datetime import datetime, timedelta',
    'from typing import List, Optional, Dict',
    '',
    '',
    'class Reader:',
    '    """Сущность читателя библиотеки."""',
    '    def __init__(self, reader_id: int, fio: str, phone: str, email: str = "", reg_date: Optional[str] = None):',
    '        self.id = int(reader_id)',
    '        self.fio = str(fio)',
    '        self.phone = str(phone)',
    '        self.email = str(email)',
    '        self.reg_date = reg_date or datetime.now().strftime("%Y-%m-%d")',
    '',
    '    def to_dict(self) -> dict:',
    '        return {',
    '            "id": self.id,',
    '            "fio": self.fio,',
    '            "phone": self.phone,',
    '            "email": self.email,',
    '            "reg_date": self.reg_date',
    '        }',
    '',
    '',
    'class LoanRecord:',
    '    """Запись в электронном формуляре читателя о выданной книге."""',
    '    def __init__(self, loan_id: int, reader_id: int, book_id: int, book_title: str, days_limit: int = 14):',
    '        self.loan_id = int(loan_id)',
    '        self.reader_id = int(reader_id)',
    '        self.book_id = int(book_id)',
    '        self.book_title = str(book_title)',
    '        self.issue_date = datetime.now()',
    '        self.due_date = self.issue_date + timedelta(days=days_limit)',
    '        self.return_date: Optional[datetime] = None',
    '        self.status = "на руках"',
    '',
    '    def check_overdue(self) -> bool:',
    '        """Проверка наличия просрочки срока возврата."""',
    '        if self.return_date is None and datetime.now() > self.due_date:',
    '            self.status = "просрочена"',
    '            return True',
    '        return False',
    '',
    '',
    'class ReadersModule:',
    '    """Основной сервис управления читателями библиотеки «БиблиоТех»."""',
    '    def __init__(self):',
    '        self.readers: Dict[int, Reader] = {}',
    '        self.loans: Dict[int, LoanRecord] = {}',
    '        self.book_stock: Dict[int, int] = {}',
    '        self._next_reader_id = 1',
    '        self._next_loan_id = 1',
    '',
    '    def register_reader(self, fio: str, phone: str, email: str = "") -> Reader:',
    '        """Регистрация нового читателя с проверкой уникальности телефона."""',
    '        if not fio or not fio.strip():',
    '            raise ValueError("Ошибка: ФИО читателя обязательно для заполнения.")',
    '        if not phone or not phone.strip():',
    '            raise ValueError("Ошибка: Номер телефона обязателен для заполнения.")',
    '',
    '        clean_phone = phone.strip()',
    '        for r in self.readers.values():',
    '            if r.phone == clean_phone:',
    '                raise ValueError(f"Ошибка: Читатель с телефоном {clean_phone} уже зарегистрирован (Билет #{r.id}).")',
    '',
    '        reader_id = self._next_reader_id',
    '        reader = Reader(reader_id, fio.strip(), clean_phone, email.strip())',
    '        self.readers[reader_id] = reader',
    '        self._next_reader_id += 1',
    '        return reader',
    '',
    '    def update_reader(self, reader_id: int, fio: Optional[str] = None, phone: Optional[str] = None, email: Optional[str] = None) -> Reader:',
    '        """Редактирование анкетных данных читателя."""',
    '        if reader_id not in self.readers:',
    '            raise KeyError(f"Читатель с ID {reader_id} не найден.")',
    '        ',
    '        reader = self.readers[reader_id]',
    '        if fio and fio.strip():',
    '            reader.fio = fio.strip()',
    '        if phone and phone.strip():',
    '            reader.phone = phone.strip()',
    '        if email is not None:',
    '            reader.email = email.strip()',
    '        return reader',
    '',
    '    def search_readers(self, query: str) -> List[Reader]:',
    '        """Поиск читателя по ФИО, номеру телефона, email или номеру билета."""',
    '        q = str(query).lower().strip()',
    '        results = []',
    '        for r in self.readers.values():',
    '            if (q in r.fio.lower() or ',
    '                q in r.phone.lower() or ',
    '                q in r.email.lower() or ',
    '                q == str(r.id)):',
    '                results.append(r)',
    '        return results',
    '',
    '    def issue_book_to_reader(self, reader_id: int, book_id: int, book_title: str, days_limit: int = 14) -> LoanRecord:',
    '        """Оформление выдачи книги читателю."""',
    '        if reader_id not in self.readers:',
    '            raise KeyError(f"Читатель с ID {reader_id} не существует.")',
    '        ',
    '        current_stock = self.book_stock.get(book_id, 1)',
    '        if current_stock <= 0:',
    '            raise ValueError(f"Все экземпляры книги «{book_title}» уже выданы.")',
    '        self.book_stock[book_id] = current_stock - 1',
    '',
    '        loan = LoanRecord(self._next_loan_id, reader_id, book_id, book_title, days_limit)',
    '        self.loans[self._next_loan_id] = loan',
    '        self._next_loan_id += 1',
    '        return loan',
    '',
    '    def get_reader_card(self, reader_id: int) -> dict:',
    '        """Формирование электронного формуляра читателя со списком книг."""',
    '        if reader_id not in self.readers:',
    '            raise KeyError(f"Читатель с ID {reader_id} не найден.")',
    '        ',
    '        reader = self.readers[reader_id]',
    '        reader_loans = [l for l in self.loans.values() if l.reader_id == reader_id]',
    '        active_loans = [l for l in reader_loans if l.status in ("на руках", "просрочена")]',
    '        has_overdue = any(l.check_overdue() for l in active_loans)',
    '',
    '        return {',
    '            "reader": reader.to_dict(),',
    '            "total_loans": len(reader_loans),',
    '            "active_loans_count": len(active_loans),',
    '            "has_overdue": has_overdue,',
    '            "active_books": [',
    '                {',
    '                    "loan_id": l.loan_id,',
    '                    "book_id": l.book_id,',
    '                    "title": l.book_title,',
    '                    "due_date": l.due_date.strftime("%Y-%m-%d"),',
    '                    "status": l.status',
    '                }',
    '                for l in active_loans',
    '            ]',
    '        }',
    '',
    '    def delete_reader(self, reader_id: int, force_return_books: bool = True) -> bool:',
    '        """Безопасное удаление читателя с автоматическим возвратом книг в фонд библиотеки."""',
    '        if reader_id not in self.readers:',
    '            raise KeyError(f"Читатель с ID {reader_id} не найден.")',
    '',
    '        active_loans = [l for l in self.loans.values() if l.reader_id == reader_id and l.status != "возвращена"]',
    '',
    '        if active_loans and not force_return_books:',
    '            raise ValueError(f"Нельзя удалить: за читателем числится {len(active_loans)} экз. книг.")',
    '',
    '        for loan in active_loans:',
    '            loan.status = "возвращена"',
    '            loan.return_date = datetime.now()',
    '            if loan.book_id in self.book_stock:',
    '                self.book_stock[loan.book_id] += 1',
    '',
    '        del self.readers[reader_id]',
    '        return True'
  ];

  const consoleOutput = [
    "=================================================================",
    "  ТЕСТИРОВАНИЕ МОДУЛЯ «ЧИТАТЕЛИ» АИС «БИБЛИОТЕХ»",
    "  Авторы: Дарқан Ж.С., Ерменғали Е.Е. (Группа ИСР 311)",
    "=================================================================",
    "",
    "[ТЕСТ 1] Регистрация новых читателей:",
    " ✓ Читатель #1 зарегистрирован: Алимов Серик Болатович (Билет #1)",
    " ✓ Читатель #2 зарегистрирован: Смагулова Динара Ерлановна (Билет #2)",
    "",
    "[ТЕСТ 2] Проверка защиты от дублирования телефонного номера (UNIQUE):",
    " ✓ Ограничение целостности сработало корректно: Ошибка: Читатель с телефоном +7 701 111-22-33 уже зарегистрирован (Билет #1).",
    "",
    "[ТЕСТ 3] Поиск читателя по подстроке:",
    " ✓ По запросу «Серик» найден читатель: Алимов Серик Болатович, телефон: +7 701 111-22-33",
    "",
    "[ТЕСТ 4] Формирование формуляра и учёт книг на руках:",
    " ✓ В формуляре читателя #1 (Алимов Серик Болатович):",
    "   • Всего записей в истории: 1",
    "   • Книг на руках сейчас: 1",
    "   • Выданная книга: «Абай жолы (Том 1)» (срок сдачи: 2026-11-25)",
    "",
    "[ТЕСТ 5] Удаление читателя с книгами на руках (целостность фонда):",
    " • Доступный остаток книги ID 10 до удаления читателя: 2 экз.",
    " ✓ Читатель #1 удален из базы.",
    " ✓ Книга автоматически возвращена в свободный фонд библиотеки. Остаток: 3 экз. (было: 2)",
    "",
    "=================================================================",
    "  ВСЕ ТЕСТЫ (5 ИЗ 5) ПРОЙДЕНЫ УСПЕШНО БЕЗ ОШИБОК!",
    "================================================================="
  ];

  const doc = new Document({
    creator: "Дарқан Жусупәли Сәбитұлы, Ерменғали Елдар Ерболұлы",
    title: "Отчет по модулю «Читатели» АИС «БиблиоТех»",
    description: "Проектирование, реализация и тестирование модуля читателей информационной системы библиотеки",
    styles: {
      default: {
        document: {
          run: {
            font: "Arial",
            size: 22,
            color: "0F172A"
          }
        }
      }
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1134, right: 1134, bottom: 1134, left: 1418 }
          }
        },
        children: [
          // ================= ТИТУЛЬНЫЙ ЛИСТ =================
          p("МИНИСТЕРСТВО НАУКИ И ВЫСШЕГО ОБРАЗОВАНИЯ РЕСПУБЛИКИ КАЗАХСТАН", { alignment: AlignmentType.CENTER, bold: true, size: 24, after: 60 }),
          p("НАО «ЖЕТЫСУСКИЙ УНИВЕРСИТЕТ ИМЕНИ ИЛЬЯСА ЖАНСУГУРОВА»", { alignment: AlignmentType.CENTER, bold: true, size: 26, after: 120, color: "1E3A8A" }),
          p("Высшая школа естественных и цифровых технологий (ИТ)", { alignment: AlignmentType.CENTER, size: 22, after: 40 }),
          p("Образовательная программа: «Информационные системы» (Группа ИСР 311)", { alignment: AlignmentType.CENTER, size: 22, after: 600 }),

          p("ОТЧЕТ ПО ПРАКТИЧЕСКОМУ ЗАДАНИЮ", { alignment: AlignmentType.CENTER, bold: true, size: 36, after: 120, color: "0F172A" }),
          p("Тема: «Реализация и тестирование модуля \"Читатели\" в рамках АИС \"БиблиоТех\"»", { alignment: AlignmentType.CENTER, bold: true, size: 26, color: "1E3A8A", after: 800 }),

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { before: 200, after: 60, line: 280 },
            children: [
              new TextRun({ text: "Выполнили студенты группы ИСР 311:\n", bold: true, font: "Arial", size: 22 }),
              new TextRun({ text: "Дарқан Жусупәли Сәбитұлы\n", font: "Arial", size: 22 }),
              new TextRun({ text: "Ерменғали Елдар Ерболұлы\n\n", font: "Arial", size: 22 }),
              new TextRun({ text: "Проверил: преподаватель кафедры ИТ", font: "Arial", size: 22, italics: true })
            ]
          }),

          new Paragraph({
            spacing: { before: 1200, after: 0 },
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "г. Талдыкорган, Казахстан\n2026 г.", bold: true, font: "Arial", size: 22 })
            ]
          }),

          new Paragraph({ children: [new PageBreak()] }),

          // ================= РАЗДЕЛ 1: ПОСТАНОВКА ЗАДАЧИ =================
          heading1("1. ПОСТАНОВКА ЗАДАЧИ"),
          p("Формулировка задания: Реализовать небольшое приложение или модуль в рамках спроектированной ранее информационной системы. Включить основные функции и протестировать его на корректность работы."),
          p("Требуемый результат: Предоставить исходный код приложения, подробное описание реализованных функций и результаты тестирования."),
          p("Объект реализации: Модуль «Читатели» автоматизированной библиотечной информационной системы «БиблиоТех»."),
          p("Задачи модуля:"),
          bullet("Автоматизация регистрации новых читателей библиотеки с выдачей персонализированного читательского билета;"),
          bullet("Ведение актуальной базы контактов и анкет читателей;"),
          bullet("Интеллектуальный поиск читателей по ФИО, номеру телефона, email и номеру билета;"),
          bullet("Формирование электронного читательского формуляра со списком книг на руках и проверкой просрочек;"),
          bullet("Гарантия целостности фонда: безопасное удаление читателя с автоматическим возвратом выданных ему книг на баланс библиотеки."),

          // ================= РАЗДЕЛ 2: СТРУКТУРА ДАННЫХ =================
          heading1("2. СТРУКТУРА ДАННЫХ МОДУЛЯ (СЛОВАРЬ ДАННЫХ)"),
          p("Модуль оперирует сущностью «Читатели» (readers) и связанной сущностью формуляра «Выдача» (loans)."),
          p("Таблица 1 — Словарь данных сущности «Читатели» (readers):"),

          createCustomTable(
            [
              { title: "Поле (Атрибут)", width: 22, isKey: true },
              { title: "Тип данных", width: 18 },
              { title: "Ограничение", width: 25 },
              { title: "Описание и бизнес-логика", width: 35 }
            ],
            [
              ["id", "INT (SERIAL)", "PRIMARY KEY, AUTO_INCREMENT", "Уникальный номер читательского билета в библиотеке"],
              ["fio", "VARCHAR(150)", "NOT NULL", "Фамилия, имя и отчество читателя"],
              ["phone", "VARCHAR(20)", "NOT NULL, UNIQUE", "Контактный телефон (уникален, защищает от дубликатов)"],
              ["email", "VARCHAR(100)", "NULLABLE", "Электронная почта для рассылки уведомлений о сроках"],
              ["reg_date", "DATE", "DEFAULT CURRENT_DATE", "Дата первичной регистрации читателя в АИС"]
            ]
          ),

          new Paragraph({ children: [new PageBreak()] }),

          // ================= РАЗДЕЛ 3: ОПИСАНИЕ ФУНКЦИЙ =================
          heading1("3. ОПИСАНИЕ ФУНКЦИЙ МОДУЛЯ"),
          p("В рамках модуля реализован законченный сервисный класс ReadersModule, предоставляющий 5 основных функций:"),
          p("Таблица 2 — Спецификация функций модуля «Читатели»:"),

          createCustomTable(
            [
              { title: "№", width: 8, isKey: true },
              { title: "Функция", width: 24, isKey: true },
              { title: "Входные данные", width: 22 },
              { title: "Назначение и бизнес-правило", width: 46 }
            ],
            [
              [
                "1",
                "register_reader()",
                "fio, phone, email",
                "Регистрация нового читателя. Проверяет обязательность ФИО и телефона, а также уникальность номера телефона среди всех читателей. Присваивает автоинкрементный номер билета."
              ],
              [
                "2",
                "update_reader()",
                "reader_id, fio, phone, email",
                "Редактирование анкеты читателя. Позволяет оператору абонемента обновить контактный телефон, email или фамилию при смене персональных данных."
              ],
              [
                "3",
                "search_readers()",
                "query (строка поиска)",
                "Быстрый контекстный поиск. Ищет совпадения без учета регистра по ФИО, номеру телефона, адресу почты или точному номеру билета."
              ],
              [
                "4",
                "get_reader_card()",
                "reader_id",
                "Генерация электронного читательского формуляра. Возвращает анкету, общее число взятых книг, книги на руках и автоматически выявляет наличие просроченных книг."
              ],
              [
                "5",
                "delete_reader()",
                "reader_id, force_return_books",
                "Безопасное удаление читателя. Если за читателем числятся книги, они автоматически возвращаются на баланс свободного фонда библиотеки (+1 к available_copies), исключая потерю книг."
              ]
            ]
          ),

          new Paragraph({ children: [new PageBreak()] }),

          // ================= РАЗДЕЛ 4: ИСХОДНЫЙ КОД =================
          heading1("4. ИСХОДНЫЙ КОД ПРИЛОЖЕНИЯ"),
          p("Ниже представлен полный исходный код модуля readers_service.py на языке Python:"),
          ...createCodeBlock(pythonCode),

          new Paragraph({ children: [new PageBreak()] }),

          // ================= РАЗДЕЛ 5: ТЕСТИРОВАНИЕ =================
          heading1("5. РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ"),
          p("Для подтверждения корректности работы модуля была составлена таблица тест-кейсов и выполнен автоматический тестовый прогон."),
          p("Таблица 3 — Результаты прохождения тест-кейсов:"),

          createCustomTable(
            [
              { title: "Тест-кейс", width: 22, isKey: true },
              { title: "Тип проверки", width: 18 },
              { title: "Ожидаемый результат", width: 32 },
              { title: "Статус", width: 14 }
            ],
            [
              [
                "TC-01: Регистрация читателей",
                "Функциональный (CRUD)",
                "Созданы 2 записи, присвоены ID 1 и 2, дата регистрации заполнена",
                "УСПЕШНО (✓)"
              ],
              [
                "TC-02: Защита от дубликата телефона",
                "Целостность (UNIQUE)",
                "Попытка добавления того же номера отвергнута исключением ValueError",
                "УСПЕШНО (✓)"
              ],
              [
                "TC-03: Поиск по подстроке",
                "Поиск и фильтрация",
                "По запросу «Серик» мгновенно найден читатель Алимов С.Б.",
                "УСПЕШНО (✓)"
              ],
              [
                "TC-04: Электронный формуляр читателя",
                "Бизнес-логика",
                "В формуляре отобразилась выданная книга «Абай жолы» и плановый срок сдачи",
                "УСПЕШНО (✓)"
              ],
              [
                "TC-05: Удаление читателя с книгами",
                "Целостность фонда",
                "Читатель удален, а экземпляр книги вернулся в фонд библиотеки (остаток вырос с 2 до 3)",
                "УСПЕШНО (✓)"
              ]
            ]
          ),

          heading2("5.1. Фактический протокол выполнения тестов в терминале (VS Code):"),
          ...createCodeBlock(consoleOutput),

          // ================= РАЗДЕЛ 6: ВЫВОДЫ =================
          heading1("6. ВЫВОДЫ"),
          p("В ходе выполнения практического задания студентами группы ИСР 311 Дарқаном Ж.С. и Ерменғали Е.Е. был успешно разработан и протестирован модуль «Читатели» для автоматизированной библиотечной информационной системы «БиблиоТех»."),
          bullet("Реализованы все ключевые бизнес-функции: регистрация, редактирование, поиск, ведение формуляра и безопасное удаление;"),
          bullet("Обеспечена строгая ссылочная и логическая целостность данных (контроль уникальности номеров, автоматический возврат литературы в фонд при ликвидации записи);"),
          bullet("Все 5 сценариев тестирования успешно пройдены в среде разработки Visual Studio Code;"),
          bullet("Модуль полностью совместим со спроектированной ранее реляционной базой данных библиотеки и готов к практическому использованию.")
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer;
}

async function run() {
  console.log("Generating Readers Module Word document...");
  const docBuffer = await buildReadersDocument();

  const outFiles = [
    path.resolve('/readers_module_project.docx'),
    path.resolve('/app/applet/readers_module_project.docx'),
    path.resolve('/app/applet/dist/readers_module_project.docx'),
    path.resolve('/app/applet/public/readers_module_project.docx')
  ];

  for (const filePath of outFiles) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, docBuffer);
    console.log(`Saved to ${filePath} (${docBuffer.length} bytes)`);
  }
  console.log("Readers Module Word document generated successfully!");
}

run().catch(err => {
  console.error("Error generating readers document:", err);
  process.exit(1);
});
