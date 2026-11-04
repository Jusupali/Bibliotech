import React, { useState } from 'react';
import { useLibrary } from '../context/LibraryContext';
import { AuthUser } from '../types/database';
import {
  User,
  Lock,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  Sparkles,
} from 'lucide-react';

interface AuthPanelProps {
  onSuccess?: () => void;
  onSkip?: () => void;
}

export const AuthPanel: React.FC<AuthPanelProps> = ({ onSuccess, onSkip }) => {
  const { readers, librarians, login, registerAuthUser, showToast } = useLibrary();

  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [showPassword, setShowPassword] = useState(false);

  // Registration Form State (Личные данные)
  const [fio, setFio] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+7 (9');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'reader' | 'librarian'>('reader');
  const [position, setPosition] = useState('Библиотекарь 1 категории');
  const [birthDate, setBirthDate] = useState('');
  const [address, setAddress] = useState('');
  const [regError, setRegError] = useState('');

  // Login Form State
  const [loginQuery, setLoginQuery] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Handle Registration
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!fio.trim() || fio.trim().split(' ').length < 2) {
      setRegError('Пожалуйста, укажите полные фамилию и имя.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 8) {
      setRegError('Пожалуйста, укажите контактный номер телефона.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setRegError('Пожалуйста, укажите корректный email адрес.');
      return;
    }
    if (!password.trim() || password.length < 4) {
      setRegError('Пароль должен содержать не менее 4 символов.');
      return;
    }
    if (role === 'librarian' && !position.trim()) {
      setRegError('Укажите должность сотрудника библиотеки.');
      return;
    }

    try {
      const newUser = registerAuthUser({
        фио: fio.trim(),
        email: email.trim(),
        телефон: phone.trim(),
        role,
        должность: role === 'librarian' ? position.trim() : undefined,
      });

      if (onSuccess) onSuccess();
    } catch (err: any) {
      setRegError(err.message || 'Ошибка регистрации.');
    }
  };

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const query = loginQuery.trim().toLowerCase();
    if (!query) {
      setLoginError('Введите Email, телефон или ФИО.');
      return;
    }

    // Try finding in librarians first
    const foundLib = librarians.find(
      (l) =>
        l.фио.toLowerCase().includes(query) ||
        l.телефон.toLowerCase().includes(query)
    );

    if (foundLib) {
      const user: AuthUser = {
        id: foundLib.id,
        фио: foundLib.фио,
        email: `${foundLib.id}@bibliotech.local`,
        телефон: foundLib.телефон,
        role: 'librarian',
        должность: foundLib.должность,
      };
      login(user);
      if (onSuccess) onSuccess();
      return;
    }

    // Try finding in readers
    const foundReader = readers.find(
      (r) =>
        r.фио.toLowerCase().includes(query) ||
        r.email.toLowerCase().includes(query) ||
        r.телефон.toLowerCase().includes(query)
    );

    if (foundReader) {
      const user: AuthUser = {
        id: foundReader.id,
        фио: foundReader.фио,
        email: foundReader.email,
        телефон: foundReader.телефон,
        role: 'reader',
        дата_регистрации: foundReader.дата_регистрации,
      };
      login(user);
      if (onSuccess) onSuccess();
      return;
    }

    setLoginError('Пользователь с такими данными не найден. Проверьте правильность или пройдите регистрацию.');
  };

  // Quick Demo Login
  const handleQuickDemoLogin = (type: 'librarian' | 'reader') => {
    if (type === 'librarian' && librarians.length > 0) {
      const l = librarians[0];
      login({
        id: l.id,
        фио: l.фио,
        email: 'librarian@bibliotech.local',
        телефон: l.телефон,
        role: 'librarian',
        должность: l.должность,
      });
      if (onSuccess) onSuccess();
    } else if (readers.length > 0) {
      const r = readers[0];
      login({
        id: r.id,
        фио: r.фио,
        email: r.email,
        телефон: r.телефон,
        role: 'reader',
        дата_регистрации: r.дата_регистрации,
      });
      if (onSuccess) onSuccess();
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-2xl border border-neutral-200 shadow-xl overflow-hidden animate-in fade-in duration-200">
      {/* Top Banner / Branding */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-amber-950 p-6 text-white relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center font-bold text-base shadow-md">
              БТ
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">БиблиоТех</h2>
              <p className="text-xs text-amber-200/80">
                Автоматизированная библиотечная система
              </p>
            </div>
          </div>

          {onSkip && (
            <button
              onClick={onSkip}
              className="text-xs text-neutral-300 hover:text-white px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
            >
              Демо-режим &rarr;
            </button>
          )}
        </div>

        {/* Mode Switcher Tabs */}
        <div className="mt-6 flex rounded-lg bg-neutral-950/40 p-1 backdrop-blur-xs text-xs font-medium">
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-2 text-center rounded-md flex items-center justify-center gap-1.5 transition-all ${
              mode === 'register'
                ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Регистрация личных данных</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2 text-center rounded-md flex items-center justify-center gap-1.5 transition-all ${
              mode === 'login'
                ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Вход в систему</span>
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-6">
        {mode === 'register' ? (
          /* REGISTRATION FORM */
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">
                Анкета пользователя и личные данные
              </h3>
              <p className="text-xs text-neutral-500">
                Заполните данные для создания персонального профиля в единой базе библиотеки.
              </p>
            </div>

            {regError && (
              <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                Кто вы в библиотеке? (Роль)
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setRole('reader')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                    role === 'reader'
                      ? 'border-amber-600 bg-amber-50/60 ring-2 ring-amber-500/20 text-neutral-900'
                      : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-600'
                  }`}
                >
                  <BookOpen className={`w-4 h-4 mt-0.5 ${role === 'reader' ? 'text-amber-700' : 'text-neutral-400'}`} />
                  <div>
                    <div className="text-xs font-bold">Читатель</div>
                    <div className="text-[11px] text-neutral-500">
                      Абонемент, поиск книг, формуляр
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('librarian')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                    role === 'librarian'
                      ? 'border-amber-600 bg-amber-50/60 ring-2 ring-amber-500/20 text-neutral-900'
                      : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-600'
                  }`}
                >
                  <ShieldCheck className={`w-4 h-4 mt-0.5 ${role === 'librarian' ? 'text-amber-700' : 'text-neutral-400'}`} />
                  <div>
                    <div className="text-xs font-bold">Сотрудник библиотеки</div>
                    <div className="text-[11px] text-neutral-500">
                      Выдача, фонд, читатели
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* FIO */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                ФИО (Фамилия Имя Отчество) *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fio}
                  onChange={(e) => setFio(e.target.value)}
                  placeholder="Михайлов Артем Валерьевич"
                  className="w-full text-xs rounded-lg border border-neutral-300 pl-9 pr-3 py-2 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>
            </div>

            {/* Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                  Номер телефона *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+7 (999) 000-00-00"
                    className="w-full text-xs rounded-lg border border-neutral-300 pl-9 pr-3 py-2 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                  Email адрес *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full text-xs rounded-lg border border-neutral-300 pl-9 pr-3 py-2 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  />
                </div>
              </div>
            </div>

            {/* Position if Librarian */}
            {role === 'librarian' && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                  Должность сотрудника *
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="Заведующий отделом абонемента, Главный библиограф..."
                    className="w-full text-xs rounded-lg border border-neutral-300 pl-9 pr-3 py-2 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  />
                </div>
              </div>
            )}

            {/* Optional Personal Data: Birthdate & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                  Дата рождения (опционально)
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full text-xs rounded-lg border border-neutral-300 pl-9 pr-3 py-2 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                  Пароль учетной записи *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Придумайте пароль"
                    className="w-full text-xs rounded-lg border border-neutral-300 pl-9 pr-9 py-2 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                Адрес проживания (для читательского формуляра)
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="г. Москва, ул. Ленина, д. 10, кв. 4"
                className="w-full text-xs rounded-lg border border-neutral-300 px-3 py-2 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2.5 px-4 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <span>Зарегистрироваться и войти в БиблиоТех</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          /* LOGIN FORM */
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">
                Вход для зарегистрированных пользователей
              </h3>
              <p className="text-xs text-neutral-500">
                Введите ФИО, телефон или email, указанные при регистрации.
              </p>
            </div>

            {loginError && (
              <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                Email, телефон или ФИО
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={loginQuery}
                  onChange={(e) => setLoginQuery(e.target.value)}
                  placeholder="ivanov@example.com или Соколова или +7 (9..."
                  className="w-full text-xs rounded-lg border border-neutral-300 pl-9 pr-3 py-2 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                Пароль
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Введите пароль"
                  className="w-full text-xs rounded-lg border border-neutral-300 pl-9 pr-9 py-2 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <span>Войти в систему</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Quick Demo Access Bar */}
            <div className="mt-5 pt-4 border-t border-neutral-100">
              <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-2">
                Быстрый вход для тестирования:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('librarian')}
                  className="p-2 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-amber-50 hover:border-amber-200 text-left transition-colors"
                >
                  <div className="text-[11px] font-bold text-neutral-800 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-amber-700" /> Библиотекарь
                  </div>
                  <div className="text-[10px] text-neutral-500 truncate">
                    {librarians[0]?.фио || 'Соколова Н.Ю.'}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('reader')}
                  className="p-2 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-amber-50 hover:border-amber-200 text-left transition-colors"
                >
                  <div className="text-[11px] font-bold text-neutral-800 flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-amber-700" /> Читатель
                  </div>
                  <div className="text-[10px] text-neutral-500 truncate">
                    {readers[0]?.фио || 'Иванов И.И.'}
                  </div>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
