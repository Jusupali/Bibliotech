import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { EnrichedReader, Reader } from '../../types/database';
import {
  Search,
  Plus,
  User,
  Phone,
  Mail,
  Calendar,
  BookOpen,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  FileText,
} from 'lucide-react';

interface ReadersTabProps {
  onIssueToReader: (readerId: number) => void;
}

export const ReadersTab: React.FC<ReadersTabProps> = ({ onIssueToReader }) => {
  const {
    enrichedReaders,
    addReader,
    updateReader,
    deleteReader,
    enrichedLoans,
  } = useLibrary();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterActiveOnly, setFilterActiveOnly] = useState(false);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReader, setEditingReader] = useState<Reader | null>(null);
  const [selectedReaderCard, setSelectedReaderCard] = useState<EnrichedReader | null>(null);

  // Form State
  const [fio, setFio] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [regDate, setRegDate] = useState('');
  const [formError, setFormError] = useState('');

  const filteredReaders = enrichedReaders.filter((reader) => {
    if (filterActiveOnly && reader.activeLoansCount === 0) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matches =
        reader.фио.toLowerCase().includes(q) ||
        reader.телефон.toLowerCase().includes(q) ||
        reader.email.toLowerCase().includes(q) ||
        String(reader.id) === q;
      if (!matches) return false;
    }

    return true;
  });

  const handleOpenAdd = () => {
    setEditingReader(null);
    setFio('');
    setPhone('+7 (9');
    setEmail('');
    setRegDate(new Date().toISOString().slice(0, 10));
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (reader: EnrichedReader) => {
    setEditingReader(reader);
    setFio(reader.фио);
    setPhone(reader.телефон);
    setEmail(reader.email);
    setRegDate(reader.дата_регистрации);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveReader = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!fio.trim()) {
      setFormError('Укажите ФИО читателя.');
      return;
    }
    if (!phone.trim()) {
      setFormError('Укажите номер контактного телефона.');
      return;
    }

    if (editingReader) {
      updateReader(editingReader.id, {
        фио: fio.trim(),
        телефон: phone.trim(),
        email: email.trim(),
        дата_регистрации: regDate,
      });
    } else {
      addReader({
        фио: fio.trim(),
        телефон: phone.trim(),
        email: email.trim(),
        дата_регистрации: regDate || new Date().toISOString().slice(0, 10),
      });
    }

    setIsModalOpen(false);
  };

  // Reader loans for profile drawer/modal
  const readerLoans = selectedReaderCard
    ? enrichedLoans.filter((l) => l.читатель_id === selectedReaderCard.id)
    : [];

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по ФИО, телефону или email читателя..."
              className="w-full text-xs rounded-lg border border-neutral-200 pl-9 pr-3 py-2 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
            />
          </div>

          <label className="flex items-center gap-1.5 text-xs text-neutral-600 cursor-pointer select-none bg-neutral-100 hover:bg-neutral-200/80 px-2.5 py-1.5 rounded-lg transition-colors shrink-0">
            <input
              type="checkbox"
              checked={filterActiveOnly}
              onChange={(e) => setFilterActiveOnly(e.target.checked)}
              className="rounded border-neutral-300 text-amber-600 focus:ring-amber-500"
            />
            <span>С книгами на руках</span>
          </label>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Зарегистрировать читателя</span>
        </button>
      </div>

      {/* Mobile Responsive Cards View (< md) */}
      <div className="md:hidden space-y-3">
        {filteredReaders.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 p-6 text-center text-neutral-500">
            <User className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-neutral-700">Читатели не найдены</p>
            <p className="text-xs text-neutral-400 mt-1">
              Попробуйте изменить поисковый запрос
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Зарегистрировать читателя
            </button>
          </div>
        ) : (
          filteredReaders.map((reader) => (
            <div
              key={reader.id}
              className={`bg-white rounded-xl border p-4 space-y-3 shadow-xs transition-all ${
                reader.hasOverdueLoans ? 'border-rose-300 bg-rose-50/20' : 'border-neutral-200'
              }`}
            >
              {/* Header: ID + Loans Badge */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-neutral-400">
                  Билет #{reader.id}
                </span>

                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                    reader.hasOverdueLoans
                      ? 'bg-rose-100 text-rose-800 font-bold'
                      : reader.activeLoansCount > 0
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  <BookOpen className="w-3 h-3" />
                  <span>
                    {reader.activeLoansCount > 0
                      ? `${reader.activeLoansCount} на руках`
                      : 'Нет книг на руках'}
                  </span>
                  {reader.hasOverdueLoans && (
                    <span className="text-[10px] text-rose-600 font-bold ml-1">(!просрочка)</span>
                  )}
                </span>
              </div>

              {/* Reader Name */}
              <div>
                <h4 className="text-sm font-bold text-neutral-900 leading-snug">
                  {reader.фио}
                </h4>
                <div className="text-[11px] text-neutral-400 mt-0.5 font-mono">
                  Зарегистрирован: {reader.дата_регистрации}
                </div>
              </div>

              {/* Contacts with Direct Mobile Dial/Mail Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                {reader.телефон && (
                  <a
                    href={`tel:${reader.телефон}`}
                    className="flex items-center gap-1.5 p-2 rounded-lg bg-neutral-50 hover:bg-amber-50 text-neutral-700 hover:text-amber-900 border border-neutral-100 font-mono transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="truncate">{reader.телефон}</span>
                  </a>
                )}

                {reader.email && (
                  <a
                    href={`mailto:${reader.email}`}
                    className="flex items-center gap-1.5 p-2 rounded-lg bg-neutral-50 hover:bg-neutral-100 text-neutral-600 border border-neutral-100 transition-colors truncate"
                  >
                    <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="truncate">{reader.email}</span>
                  </a>
                )}
              </div>

              {/* Actions Row */}
              <div className="pt-2 border-t border-neutral-100 flex flex-wrap gap-2">
                <button
                  onClick={() => onIssueToReader(reader.id)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 rounded-lg shadow-xs transition-colors min-h-[40px]"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Выдать книгу</span>
                </button>

                <button
                  onClick={() => setSelectedReaderCard(reader)}
                  title="Электронный читательский формуляр"
                  className="inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors min-h-[40px]"
                >
                  <FileText className="w-4 h-4 text-neutral-500" />
                  <span>Билет</span>
                </button>

                <button
                  onClick={() => handleOpenEdit(reader)}
                  title="Редактировать читателя"
                  className="p-2 text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Удалить читателя «${reader.фио}»?`)) {
                      deleteReader(reader.id);
                    }
                  }}
                  title="Удалить читателя"
                  className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Readers Table (hidden on mobile < md) */}
      <div className="hidden md:block bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/70 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 font-mono">ID</th>
                <th className="py-3 px-4">ФИО читателя</th>
                <th className="py-3 px-4">Телефон</th>
                <th className="py-3 px-4 hidden md:table-cell">Email</th>
                <th className="py-3 px-4 hidden lg:table-cell">Дата регистрации</th>
                <th className="py-3 px-4 text-center">Книг на руках</th>
                <th className="py-3 px-4 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {filteredReaders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500">
                    <User className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-neutral-700">Читатели не найдены</p>
                    <p className="text-xs text-neutral-400 mt-1">
                      Попробуйте изменить поисковый запрос
                    </p>
                  </td>
                </tr>
              ) : (
                filteredReaders.map((reader) => {
                  return (
                    <tr
                      key={reader.id}
                      className={`hover:bg-neutral-50/70 transition-colors ${
                        reader.hasOverdueLoans ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      {/* ID */}
                      <td className="py-3 px-4 font-mono text-neutral-400 tabular-nums">
                        #{reader.id}
                      </td>

                      {/* Name */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-neutral-900">{reader.фио}</div>
                        <div className="text-[11px] text-neutral-500 md:hidden">
                          {reader.телефон}
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3 px-4 font-mono tabular-nums text-neutral-700">
                        {reader.телефон}
                      </td>

                      {/* Email */}
                      <td className="py-3 px-4 hidden md:table-cell text-neutral-600">
                        {reader.email || '—'}
                      </td>

                      {/* Reg date */}
                      <td className="py-3 px-4 hidden lg:table-cell font-mono text-neutral-500 tabular-nums">
                        {reader.дата_регистрации}
                      </td>

                      {/* Active loans count */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1 font-mono font-semibold tabular-nums">
                          <span
                            className={
                              reader.hasOverdueLoans
                                ? 'text-rose-600 font-bold'
                                : reader.activeLoansCount > 0
                                ? 'text-amber-800'
                                : 'text-neutral-500'
                            }
                          >
                            {reader.activeLoansCount} экз.
                          </span>
                          {reader.hasOverdueLoans && (
                            <span className="text-[10px] text-rose-600 font-sans font-normal ml-1">
                              (есть просрочка!)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {/* Issue book to this reader */}
                          <button
                            onClick={() => onIssueToReader(reader.id)}
                            title="Выдать книгу данному читателю"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Выдать</span>
                          </button>

                          {/* Reader Card / History */}
                          <button
                            onClick={() => setSelectedReaderCard(reader)}
                            title="Формуляр читателя (история)"
                            className="p-1 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEdit(reader)}
                            title="Редактировать анкету читателя"
                            className="p-1 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`Удалить читателя «${reader.фио}»?`)) {
                                deleteReader(reader.id);
                              }
                            }}
                            title="Удалить читателя"
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

      {/* Add / Edit Reader Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
              <h3 className="text-base font-semibold text-neutral-900">
                {editingReader ? 'Редактирование читателя' : 'Регистрация нового читателя'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReader} className="p-6 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                  ФИО читателя (фио)
                </label>
                <input
                  type="text"
                  required
                  value={fio}
                  onChange={(e) => setFio(e.target.value)}
                  placeholder="Иванов Иван Иванович"
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
                  placeholder="+7 (999) 000-00-00"
                  className="w-full text-sm rounded-lg border border-neutral-300 px-3 py-2 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                  Email адрес (email)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="reader@example.com"
                  className="w-full text-sm rounded-lg border border-neutral-300 px-3 py-2 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                  Дата регистрации (дата_регистрации)
                </label>
                <input
                  type="date"
                  required
                  value={regDate}
                  onChange={(e) => setRegDate(e.target.value)}
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
                  {editingReader ? 'Сохранить изменения' : 'Зарегистрировать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reader Profile / Card Modal */}
      {selectedReaderCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-base font-semibold text-neutral-900">
                  Формуляр читателя: {selectedReaderCard.фио}
                </h3>
                <p className="text-xs text-neutral-500">
                  {selectedReaderCard.телефон} · {selectedReaderCard.email || 'без email'} · Зарегистрирован {selectedReaderCard.дата_регистрации}
                </p>
              </div>
              <button
                onClick={() => setSelectedReaderCard(null)}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
                Список книг в абонементе (Всего записей: {readerLoans.length})
              </h4>
              <div className="max-h-72 overflow-y-auto space-y-2">
                {readerLoans.length === 0 ? (
                  <p className="text-xs text-neutral-400 py-6 text-center">
                    Читатель еще не брал книги в библиотеке.
                  </p>
                ) : (
                  readerLoans.map((loan) => (
                    <div
                      key={loan.id}
                      className="p-3 rounded-lg border border-neutral-200 bg-neutral-50/50 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-neutral-900">
                          {loan.book?.название || `Книга #${loan.книга_id}`}
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          {loan.author?.фио} · Выдано {loan.дата_выдачи} · Срок: {loan.срок_возврата}
                          {loan.дата_возврата && ` · Сдано: ${loan.дата_возврата}`}
                        </div>
                      </div>
                      <div>
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                            loan.статус === 'возвращена'
                              ? 'text-emerald-800 bg-emerald-100/60'
                              : loan.статус === 'просрочена'
                              ? 'text-rose-700 bg-rose-100/60'
                              : 'text-amber-800 bg-amber-100/60'
                          }`}
                        >
                          {loan.статус}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
              <button
                onClick={() => {
                  const id = selectedReaderCard.id;
                  setSelectedReaderCard(null);
                  onIssueToReader(id);
                }}
                className="px-3.5 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors"
              >
                + Выдать книгу этому читателю
              </button>

              <button
                onClick={() => setSelectedReaderCard(null)}
                className="px-4 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
