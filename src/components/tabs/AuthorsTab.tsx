import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { Author, EnrichedAuthor } from '../../types/database';
import { Search, Plus, UserCheck, Edit2, Trash2, X, AlertCircle, BookOpen } from 'lucide-react';

export const AuthorsTab: React.FC = () => {
  const { enrichedAuthors, addAuthor, updateAuthor, deleteAuthor } = useLibrary();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);

  // Form State
  const [fio, setFio] = useState('');
  const [country, setCountry] = useState('');
  const [birthYear, setBirthYear] = useState<number>(1900);
  const [formError, setFormError] = useState('');

  const filteredAuthors = enrichedAuthors.filter((author) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matches =
        author.фио.toLowerCase().includes(q) ||
        author.страна.toLowerCase().includes(q) ||
        String(author.год_рождения).includes(q) ||
        String(author.id) === q;
      if (!matches) return false;
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingAuthor(null);
    setFio('');
    setCountry('Россия');
    setBirthYear(1950);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (author: EnrichedAuthor) => {
    setEditingAuthor(author);
    setFio(author.фио);
    setCountry(author.страна);
    setBirthYear(author.год_рождения);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveAuthor = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!fio.trim()) {
      setFormError('Укажите ФИО автора.');
      return;
    }
    if (!country.trim()) {
      setFormError('Укажите страну.');
      return;
    }
    if (!birthYear || birthYear < 0 || birthYear > new Date().getFullYear()) {
      setFormError('Укажите корректный год рождения.');
      return;
    }

    if (editingAuthor) {
      updateAuthor(editingAuthor.id, {
        фио: fio.trim(),
        страна: country.trim(),
        год_рождения: Number(birthYear),
      });
    } else {
      addAuthor({
        фио: fio.trim(),
        страна: country.trim(),
        год_рождения: Number(birthYear),
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по ФИО, стране или году рождения..."
            className="w-full text-xs rounded-lg border border-neutral-200 pl-9 pr-3 py-2 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
          />
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Добавить автора</span>
        </button>
      </div>

      {/* Mobile Responsive Cards View (< md) */}
      <div className="md:hidden space-y-3">
        {filteredAuthors.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 p-6 text-center text-neutral-500">
            <UserCheck className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-neutral-700">Авторы не найдены</p>
            <p className="text-xs text-neutral-400 mt-1">
              Попробуйте изменить поисковый запрос
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Добавить автора
            </button>
          </div>
        ) : (
          filteredAuthors.map((author) => (
            <div
              key={author.id}
              className="bg-white rounded-xl border border-neutral-200 p-4 space-y-3 shadow-xs"
            >
              {/* Header: ID + Books Count */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-neutral-400">
                  #{author.id}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-900 font-mono">
                  {author.booksCount} наим. в фонде
                </span>
              </div>

              {/* Author Name */}
              <div>
                <h4 className="text-sm font-bold text-neutral-900 leading-snug">
                  {author.фио}
                </h4>
                <div className="text-xs text-neutral-500 mt-0.5">
                  {author.страна} · родился в {author.год_рождения} г.
                </div>
              </div>

              {/* Titles in library */}
              {author.titles.length > 0 && (
                <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-100 text-xs">
                  <span className="text-[10px] text-neutral-400 block mb-0.5">
                    Книги в наличии:
                  </span>
                  <p className="text-neutral-700 leading-relaxed font-medium">
                    {author.titles.join(' · ')}
                  </p>
                </div>
              )}

              {/* Actions Row */}
              <div className="pt-2 border-t border-neutral-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(author)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors min-h-[40px]"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Редактировать</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Удалить автора «${author.фио}»?`)) {
                      deleteAuthor(author.id);
                    }
                  }}
                  title="Удалить автора"
                  className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Table (hidden on mobile < md) */}
      <div className="hidden md:block bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/70 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 font-mono">ID</th>
                <th className="py-3 px-4">ФИО автора</th>
                <th className="py-3 px-4">Страна</th>
                <th className="py-3 px-4">Год рождения</th>
                <th className="py-3 px-4">Книг в фонде</th>
                <th className="py-3 px-4 hidden md:table-cell">Произведения</th>
                <th className="py-3 px-4 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {filteredAuthors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500">
                    <UserCheck className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-neutral-700">Авторы не найдены</p>
                    <p className="text-xs text-neutral-400 mt-1">
                      Попробуйте изменить поисковый запрос
                    </p>
                  </td>
                </tr>
              ) : (
                filteredAuthors.map((author) => {
                  return (
                    <tr key={author.id} className="hover:bg-neutral-50/70 transition-colors">
                      {/* ID */}
                      <td className="py-3 px-4 font-mono text-neutral-400 tabular-nums">
                        #{author.id}
                      </td>

                      {/* Name */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-neutral-900">{author.фио}</div>
                      </td>

                      {/* Country */}
                      <td className="py-3 px-4 text-neutral-600">
                        {author.страна}
                      </td>

                      {/* Birth Year */}
                      <td className="py-3 px-4 font-mono text-neutral-600 tabular-nums">
                        {author.год_рождения} г.
                      </td>

                      {/* Books count */}
                      <td className="py-3 px-4 font-mono font-medium text-neutral-800 tabular-nums">
                        {author.booksCount} наим.
                      </td>

                      {/* Titles list */}
                      <td className="py-3 px-4 hidden md:table-cell text-neutral-500 max-w-xs truncate">
                        {author.titles.length > 0 ? author.titles.join(', ') : '—'}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(author)}
                            title="Редактировать автора"
                            className="p-1 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Удалить автора «${author.фио}»?`)) {
                                deleteAuthor(author.id);
                              }
                            }}
                            title="Удалить автора"
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
              <h3 className="text-base font-semibold text-neutral-900">
                {editingAuthor ? 'Редактирование автора' : 'Добавить автора в реестр'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAuthor} className="p-6 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                  ФИО автора (фио)
                </label>
                <input
                  type="text"
                  required
                  value={fio}
                  onChange={(e) => setFio(e.target.value)}
                  placeholder="Толстой Лев Николаевич"
                  className="w-full text-sm rounded-lg border border-neutral-300 px-3 py-2 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                  Страна (страна)
                </label>
                <input
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Россия, Великобритания, Франция..."
                  className="w-full text-sm rounded-lg border border-neutral-300 px-3 py-2 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                  Год рождения (год_рождения)
                </label>
                <input
                  type="number"
                  required
                  value={birthYear}
                  onChange={(e) => setBirthYear(Number(e.target.value))}
                  className="w-full text-sm rounded-lg border border-neutral-300 px-3 py-2 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-sm transition-colors"
                >
                  {editingAuthor ? 'Сохранить изменения' : 'Внести автора'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
