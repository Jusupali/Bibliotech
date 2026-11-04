import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Health check endpoints for Cloud Run and automated container monitors
app.get(['/health', '/api/health', '/_ah/health'], (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

const defaultAuthors = [
  { id: 1, фио: 'Толстой Лев Николаевич', full_name: 'Толстой Лев Николаевич', country: 'Россия', страна: 'Россия' },
  { id: 2, фио: 'Достоевский Федор Михайлович', full_name: 'Достоевский Федор Михайлович', country: 'Россия', страна: 'Россия' },
  { id: 3, фио: 'Булгаков Михаил Афанасьевич', full_name: 'Булгаков Михаил Афанасьевич', country: 'Россия', страна: 'Россия' },
  { id: 4, фио: 'Стругацкий Аркадий и Борис', full_name: 'Стругацкий Аркадий и Борис', country: 'СССР', страна: 'СССР' },
  { id: 5, фио: 'Джордж Оруэлл', full_name: 'Джордж Оруэлл', country: 'Великобритания', страна: 'Великобритания' },
  { id: 6, фио: 'Рэй Брэдбери', full_name: 'Рэй Брэдбери', country: 'США', страна: 'США' },
  { id: 7, фио: 'Чехов Антон Павлович', full_name: 'Чехов Антон Павлович', country: 'Россия', страна: 'Россия' },
  { id: 8, фио: 'Габриэль Гарсиа Маркес', full_name: 'Габриэль Гарсиа Маркес', country: 'Колумбия', страна: 'Колумбия' },
];

const defaultEnrichedBooks = [
  { id: 1, title: 'Война и мир (Том 1-2)', название: 'Война и мир (Том 1-2)', authorName: 'Толстой Лев Николаевич', genreName: 'Русская классика', available: 4, quantity: 5, year_published: 2021, год_издания: 2021, location: 'Зал классики, Стеллаж 1, Полка А' },
  { id: 2, title: 'Анна Каренина', название: 'Анна Каренина', authorName: 'Толстой Лев Николаевич', genreName: 'Русская классика', available: 3, quantity: 4, year_published: 2020, год_издания: 2020, location: 'Зал классики, Стеллаж 1, Полка Б' },
  { id: 3, title: 'Преступление и наказание', название: 'Преступление и наказание', authorName: 'Достоевский Федор Михайлович', genreName: 'Русская классика', available: 4, quantity: 6, year_published: 2022, год_издания: 2022, location: 'Зал классики, Стеллаж 2, Полка А' },
  { id: 4, title: 'Идиот', название: 'Идиот', authorName: 'Достоевский Федор Михайлович', genreName: 'Русская классика', available: 2, quantity: 3, year_published: 2019, год_издания: 2019, location: 'Зал классики, Стеллаж 2, Полка Б' },
  { id: 5, title: 'Мастер и Маргарита', название: 'Мастер и Маргарита', authorName: 'Булгаков Михаил Афанасьевич', genreName: 'Мистика и драма', available: 5, quantity: 5, year_published: 2023, год_издания: 2023, location: 'Зал классики, Стеллаж 3, Полка А' },
  { id: 6, title: 'Белая гвардия', название: 'Белая гвардия', authorName: 'Булгаков Михаил Афанасьевич', genreName: 'Русская классика', available: 2, quantity: 3, year_published: 2021, год_издания: 2021, location: 'Зал классики, Стеллаж 3, Полка Б' },
  { id: 7, title: 'Трудно быть богом', название: 'Трудно быть богом', authorName: 'Стругацкий Аркадий и Борис', genreName: 'Научная фантастика', available: 4, quantity: 4, year_published: 2022, год_издания: 2022, location: 'Зал фантастики, Стеллаж 1, Полка А' },
  { id: 8, title: 'Пикник на обочине', название: 'Пикник на обочине', authorName: 'Стругацкий Аркадий и Борис', genreName: 'Научная фантастика', available: 1, quantity: 3, year_published: 2020, год_издания: 2020, location: 'Зал фантастики, Стеллаж 1, Полка Б' },
  { id: 9, title: '1984', название: '1984', authorName: 'Джордж Оруэлл', genreName: 'Антиутопия', available: 2, quantity: 5, year_published: 2021, год_издания: 2021, location: 'Зал зарубежной литературы, Стеллаж 2, Полка А' },
  { id: 10, title: '451 градус по Фаренгейту', название: '451 градус по Фаренгейту', authorName: 'Рэй Брэдбери', genreName: 'Антиутопия', available: 3, quantity: 4, year_published: 2022, год_издания: 2022, location: 'Зал зарубежной литературы, Стеллаж 2, Полка Б' },
  { id: 11, title: 'Вишневый сад', название: 'Вишневый сад', authorName: 'Чехов Антон Павлович', genreName: 'Драматургия', available: 2, quantity: 3, year_published: 2018, год_издания: 2018, location: 'Зал классики, Стеллаж 4, Полка А' },
  { id: 12, title: 'Сто лет одиночества', название: 'Сто лет одиночества', authorName: 'Габриэль Гарсиа Маркес', genreName: 'Магический реализм', available: 3, quantity: 3, year_published: 2021, год_издания: 2021, location: 'Зал зарубежной литературы, Стеллаж 3, Полка А' },
];

// Helper for local intelligent library search fallback
function generateLocalSearchReply(
  query: string,
  catalog?: {
    books?: Array<{ id: number; title?: string; название?: string; authorName?: string; genreName?: string; location?: string; available?: number; quantity?: number; year_published?: number; год_издания?: number }>;
    authors?: Array<{ id: number; full_name?: string; фио?: string; country?: string; страна?: string }>;
    genres?: Array<{ id: number; name?: string; название?: string }>;
  }
): string {
  const q = query.toLowerCase().trim();
  const books = (catalog?.books && catalog.books.length > 0) ? catalog.books : defaultEnrichedBooks;
  const authors = (catalog?.authors && catalog.authors.length > 0) ? catalog.authors : defaultAuthors;

  // Extract keywords
  const stopWords = new Set(['найди', 'найти', 'автора', 'автор', 'книгу', 'книги', 'книга', 'про', 'о', 'в', 'и', 'пожалуйста', 'посоветуй', 'расскажи', 'какие', 'есть', 'ли', 'хочу', 'почитать']);
  const keywords = q
    .replace(/[«»"",.?!\-_—()]/g, ' ')
    .split(/\s+/)
    .filter((w) => !stopWords.has(w) && w.length >= 2);

  const searchWords = keywords.length > 0 ? keywords : [q];

  // Match author query
  const matchedAuthors = authors.filter((a) => {
    const name = (a.фио || a.full_name || '').toLowerCase();
    return searchWords.some((word) => name.includes(word));
  });

  // Match book query
  const matchedBooks = books.filter((b) => {
    const title = (b.название || b.title || '').toLowerCase();
    const author = (b.authorName || '').toLowerCase();
    const genre = (b.genreName || '').toLowerCase();
    return searchWords.some((word) => title.includes(word) || author.includes(word) || genre.includes(word));
  });

  if (matchedBooks.length > 0) {
    const lines = matchedBooks.slice(0, 5).map((b) => {
      const title = b.название || b.title;
      const author = b.authorName || 'Автор не указан';
      const avail = b.available ?? 0;
      const total = b.quantity ?? 0;
      const loc = b.location || 'Основной зал';
      return `📖 **«${title}»** — ${author}\n   • Наличие: **${avail} из ${total}** экз.\n   • Местоположение: ${loc}\n   • [BOOK_ACTION:${b.id}:${title}]`;
    });

    return `Здравствуйте! По вашему запросу «${query}» в фонде библиотеки «БиблиоТех» найдены следующие издания:\n\n${lines.join(
      '\n\n'
    )}\n\nВы можете открыть любое произведение в электронном читальном зале с ночным светом или оформить выдачу абонемента.`;
  }

  if (matchedAuthors.length > 0) {
    const a = matchedAuthors[0];
    const name = a.фио || a.full_name || 'Неизвестный автор';
    const authorBooks = books.filter((b) => (b.authorName || '').toLowerCase().includes(name.toLowerCase()));
    const bookLines = authorBooks.map((b) => `• «${b.название || b.title}» ([BOOK_ACTION:${b.id}:${b.название || b.title}])`);

    return `Найден автор: **${name}** (${a.страна || a.country || 'Россия'}).\n\nКниги этого автора в нашем фонде:\n${
      bookLines.length > 0 ? bookLines.join('\n') : 'Книг в наличии пока нет.'
    }`;
  }

  return `По вашему запросу «${query}» точных совпадений в каталоге не обнаружено. Вы можете попробовать ввести имя автора (например, «Толстой», «Булгаков», «Оруэлл») или ключевые слова из названия книги.`;
}

// Gemini AI Bibliographer Assistant Route
app.post('/api/gemini/assistant', async (req, res) => {
  try {
    const { message, catalogContext } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Поле "message" обязательно' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Check if API key is configured
    if (apiKey && apiKey.trim() && apiKey !== 'MY_GEMINI_API_KEY') {
      try {
        const ai = new GoogleGenAI({
          apiKey: apiKey.trim(),
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        // Prepare catalog prompt context
        const booksList = (catalogContext?.books && catalogContext.books.length > 0) ? catalogContext.books : defaultEnrichedBooks;
        const catalogSummary = booksList
          .slice(0, 25)
          .map(
            (b: any) =>
              `ID ${b.id}: «${b.название || b.title}», Автор: ${b.authorName}, Жанр: ${b.genreName}, Доступно: ${b.available}/${b.quantity}, Зал/Полка: ${b.location || 'Абонемент'}`
          )
          .join('\n');

        const systemInstruction = `Ты — умный ИИ-библиограф и литературный консультант библиотечной системы «БиблиоТех».
Твоя цель — помогать читателям и библиотекарям: находить книги и авторов, рекомендовать произведения по жанру, сюжету или настроению, рассказывать о наличии в фонде и давать полезные литературные справки.

Актуальные книги фонда библиотеки «БиблиоТех»:
${catalogSummary}

Правила ответа:
1. Отвечай вежливо, интеллигентно и структурированно на русском языке.
2. Если в твоем ответе упоминается конкретная книга из каталога фонда библиотеки, обязательно вставляй метку в формате [BOOK_ACTION:id:название книги], чтобы пользователь мог в один клик открыть её для чтения или выдать.
3. Если пользователь просит найти автора или книгу, четко опиши автора, годы, аннотацию и укажи книги автора в нашем фонде.
4. Ответ оформляй с аккуратным markdown-форматированием (жирный шрифт, списки).`;

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Превышено время ожидания ответа от Gemini')), 10000)
        );

        const generatePromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: message,
          config: {
            systemInstruction: systemInstruction,
          },
        });

        const response: any = await Promise.race([generatePromise, timeoutPromise]);

        res.json({
          reply: response.text || 'К сожалению, ответ от Gemini не содержит текста.',
          source: 'gemini',
        });
        return;
      } catch (geminiError: any) {
        console.error('Gemini API Error, falling back to local library index:', geminiError?.message || geminiError);
        // Fallback to intelligent local catalog search with helpful note
        const localReply = generateLocalSearchReply(message, catalogContext);
        res.json({
          reply: localReply,
          source: 'local-fallback',
          errorNote: `Gemini API: ${geminiError?.message || 'ошибка вызова'}. Использован интеллектуальный поиск по фонду.`,
        });
        return;
      }
    }

    // If GEMINI_API_KEY is not set yet
    const localReply = generateLocalSearchReply(message, catalogContext);
    res.json({
      reply: localReply,
      source: 'local-search',
      infoNote:
        'ИИ работает в режиме каталожного библиографа. Для подключения нейросети Gemini укажите GEMINI_API_KEY в панели Settings > Secrets.',
    });
  } catch (error: any) {
    console.error('Server error in /api/gemini/assistant:', error);
    res.status(500).json({ error: error.message || 'Внутренняя ошибка сервера' });
  }
});

async function startServer() {
  const distPath = path.resolve(__dirname, 'dist');
  const distExists = fs.existsSync(path.resolve(distPath, 'index.html'));
  const isProduction = process.env.NODE_ENV === 'production' || (distExists && process.env.npm_lifecycle_event !== 'dev');

  if (isProduction && distExists) {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[БиблиоТех] Сервер запущен на http://0.0.0.0:${PORT} (режим: ${isProduction && distExists ? 'production' : 'development'})`);
  });
}

startServer();
