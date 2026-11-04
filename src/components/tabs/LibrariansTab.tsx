import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { Librarian } from '../../types/database';
import { Search, Plus, ShieldCheck, Edit2, Trash2, X, AlertCircle, Phone, Briefcase } from 'lucide-react';

export const LibrariansTab: React.FC = () => {
  const { librarians, addLibrarian, updateLibrarian, deleteLibrarian, loans } = useLibrary();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLibrarian, setEditingLibrarian] = useState<Librarian | null>(null);

  // Form State
  const [fio, setFio] = useState('');
  const [position, setPosition] = useState('');
  const [phone, setPhone] = useState('');
  const [formError, setFormError] = useState('');

  const librariansWithStats = librarians.map((lib) => {
    const totalProcessedLoans = loans.filter((l) => l.библиотекарь_id === lib.id).length;
    return {
      ...lib,
      totalProcessedLoans,
    };
  });

  const filteredLibrarians = librariansWithStats.filter((lib) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        lib.фио.toLowerCase().includes(q) ||
        lib.должность.toLowerCase().includes(q) ||
        lib.телефон.toLowerCase().includes(q) ||
        String(lib.id) === q
      );
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingLibrarian(null);
    setFio('');
    setPosition('Библиотекарь 1 категории');
    setPhone('+7 (495) ');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (lib: Librarian) => {
    setEditingLibrarian(lib);
    setFio(lib.фио);
    setPosition(lib.должность);
    setPhone(lib.телефон);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveLibrarian = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!fio.trim()) {
      setFormError('Укажите ФИО сотрудника.');
      return;
    }
    if (!position.trim()) {
      setFormError('Укажите должность.');
      return;
    }
    if (!phone.trim()) {
      setFormError('Укажите контактный телефон.');
      return;
    }

    if (editingLibrarian) {
      updateLibrarian(editingLibrarian.id, {
        фио: fio.trim(),
        должность: position.trim(),
        телефон: phone.trim(),
      });
    } else {
      addLibrarian({
        фио: fio.trim(),
        должность: position.trim(),
        телефон: phone.trim(),
      });
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
            placeholder="Поиск по ФИО, должности или телефону..."
            className="w-full text-xs rounded-lg border border-neutral-200 pl-9 pr-3 py-2 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
          />
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Добавить сотрудника</span>
        </button>
      </div>

      {/* Mobile Responsive Cards View (< md) */}
      <div className="md:hidden space-y-3">
        {filteredLibrarians.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 p-6 text-center text-neutral-500">
            <ShieldCheck className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-neutral-700">Сотрудники не найдены</p>
            <p className="text-xs text-neutral-400 mt-1">
              Попробуйте изменить поисковый запрос
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Добавить сотрудника
            </button>
          </div>
        ) : (
          filteredLibrarians.map((lib) => (
            <div
              key={lib.id}
              className="bg-white rounded-xl border border-neutral-200 p-4 space-y-3 shadow-xs"
            >
              {/* Header: ID + Loans Count */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-neutral-400">
                  #{lib.id}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-900 font-mono">
                  {lib.totalProcessedLoans} оформленных выдач
                </span>
              </div>

              {/* Librarian Name & Role */}
              <div>
                <h4 className="text-sm font-bold text-neutral-900 leading-snug">
                  {lib.фио}
                </h4>
                <div className="text-xs text-amber-800 font-medium mt-0.5">
                  {lib.должность}
                </div>
              </div>

              {/* Phone with Direct Dial */}
              {lib.телефон && (
                <div className="pt-1">
                  <a
                    href={`tel:${lib.телефон}`}
                    className="inline-flex items-center gap-1.5 p-2 rounded-lg bg-neutral-50 hover:bg-amber-50 text-neutral-700 hover:text-amber-900 border border-neutral-100 font-mono text-xs transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{lib.телефон}</span>
                  </a>
                </div>
              )}

              {/* Actions Row */}
              <div className="pt-2 border-t border-neutral-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(lib)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors min-h-[40px]"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Редактировать</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Удалить сотрудника «${lib.фио}»?`)) {
                      deleteLibrarian(lib.id);
                    }
                  }}
                  title="Удалить сотрудника"
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
                <th className="py-3 px-4">ФИО сотрудника</th>
                <th className="py-3 px-4">Должность</th>
                <th className="py-3 px-4">Телефон</th>
                <th className="py-3 px-4 text-center">Оформлено выдач</th>
                <th className="py-3 px-4 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {filteredLibrarians.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500">
                    <ShieldCheck className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-neutral-700">Сотрудники не найдены</p>
                  </td>
                </tr>
              ) : (
                filteredLibrarians.map((lib) => {
                  return (
                    <tr key={lib.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono text-neutral-400 tabular-nums">
                        #{lib.id}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-neutral-900">{lib.фио}</div>
                      </td>

                      <td className="py-3 px-4 text-neutral-700">
                        {lib.должность}
                      </td>

                      <td className="py-3 px-4 font-mono tabular-nums text-neutral-600">
                        {lib.телефон}
                      </td>

                      <td className="py-3 px-4 text-center font-mono font-medium tabular-nums text-neutral-800">
                        {lib.totalProcessedLoans} операций
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(lib)}
                            title="Редактировать запись"
                            className="p-1 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Удалить библиотекаря «${lib.фио}»?`)) {
                                deleteLibrarian(lib.id);
                              }
                            }}
                            title="Удалить сотрудника"
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
                {editingLibrarian ? 'Редактирование сотрудника' : 'Регистрация сотрудника'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLibrarian} className="p-6 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                  ФИО сотрудника (фио)
                </label>
                <input
                  type="text"
                  required
                  value={fio}
                  onChange={(e) => setFio(e.target.value)}
                  placeholder="Соколова Надежда Юрьевна"
                  className="w-full text-sm rounded-lg border border-neutral-300 px-3 py-2 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                  Должность (должность)
                </label>
                <input
                  type="text"
                  required
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Главный библиограф, Заведующий..."
                  className="w-full text-sm rounded-lg border border-neutral-300 px-3 py-2 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                  Телефон (телефон)
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 (495) 000-00-00"
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
                  {editingLibrarian ? 'Сохранить изменения' : 'Зарегистрировать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
