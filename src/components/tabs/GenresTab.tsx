import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { Genre, EnrichedGenre } from '../../types/database';
import { Search, Plus, Tag, Edit2, Trash2, X, AlertCircle, BookOpen } from 'lucide-react';

interface GenresTabProps {
  onSelectGenreFilter: (genreId: number) => void;
}

export const GenresTab: React.FC<GenresTabProps> = ({ onSelectGenreFilter }) => {
  const { enrichedGenres, addGenre, updateGenre, deleteGenre } = useLibrary();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null);
  const [name, setName] = useState('');
  const [formError, setFormError] = useState('');

  const filteredGenres = enrichedGenres.filter((genre) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return genre.название.toLowerCase().includes(q) || String(genre.id) === q;
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingGenre(null);
    setName('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (genre: EnrichedGenre) => {
    setEditingGenre(genre);
    setName(genre.название);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveGenre = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Укажите название жанра.');
      return;
    }

    if (editingGenre) {
      updateGenre(editingGenre.id, { название: name.trim() });
    } else {
      addGenre({ название: name.trim() });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по названию жанра..."
            className="w-full text-xs rounded-lg border border-neutral-200 pl-9 pr-3 py-2 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
          />
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Добавить жанр</span>
        </button>
      </div>

      {/* Grid of genres */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredGenres.length === 0 ? (
          <div className="col-span-full py-12 text-center text-neutral-500 bg-white rounded-xl border border-neutral-200">
            <Tag className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-neutral-700">Жанры не найдены</p>
          </div>
        ) : (
          filteredGenres.map((genre) => (
            <div
              key={genre.id}
              className="p-4 bg-white rounded-xl border border-neutral-200 hover:border-neutral-300 shadow-xs transition-all flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-neutral-400">#{genre.id}</span>
                  <h4 className="text-sm font-semibold text-neutral-900">{genre.название}</h4>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(genre)}
                    title="Редактировать жанр"
                    className="p-1 text-neutral-400 hover:text-neutral-700 rounded transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Удалить жанр «${genre.название}»?`)) {
                        deleteGenre(genre.id);
                      }
                    }}
                    title="Удалить жанр"
                    className="p-1 text-neutral-400 hover:text-rose-600 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                <span className="font-mono tabular-nums text-neutral-500">
                  {genre.booksCount} наим. книг
                </span>
                <button
                  onClick={() => onSelectGenreFilter(genre.id)}
                  className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-800 font-medium hover:underline transition-colors"
                >
                  <BookOpen className="w-3 h-3" />
                  <span>Посмотреть книги</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
              <h3 className="text-base font-semibold text-neutral-900">
                {editingGenre ? 'Редактировать жанр' : 'Новый жанр'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGenre} className="p-6 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                  Название жанра (название)
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Исторический роман, Детектив..."
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
                  {editingGenre ? 'Сохранить' : 'Добавить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
