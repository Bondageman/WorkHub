import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { UserPlus, Briefcase, User } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('job_seeker'); // 'job_seeker' або 'employer'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    // Поля для шукача
    firstName: '',
    lastName: '',
    // Поля для роботодавця
    companyName: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Формуємо дані для відправки
      const payload = {
        email: formData.email,
        password: formData.password,
        role: role,
        // Додаємо специфічні поля залежно від ролі
        ...(role === 'job_seeker' 
            ? { firstName: formData.firstName, lastName: formData.lastName } 
            : { companyName: formData.companyName }
        )
      };

      await api.post('/register', payload);
      
      alert('Реєстрація успішна! Тепер увійдіть.');
      navigate('/login'); // Перекидаємо на логін після успіху

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Помилка реєстрації');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-2xl animate-fadeIn">
        
        {/* Логотип */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-black mb-4">
            <UserPlus size={24} />
          </div>
          <h1 className="text-2xl font-bold">Створити акаунт</h1>
          <p className="text-gray-400">Приєднуйтесь до JobHub</p>
        </div>

        {/* Перемикач ролі */}
        <div className="flex bg-input p-1 rounded-xl mb-6 border border-border">
          <button
            type="button"
            onClick={() => setRole('job_seeker')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition ${role === 'job_seeker' ? 'bg-white text-black shadow' : 'text-gray-400 hover:text-gray-200'}`}
          >
            <User size={16} /> Шукач
          </button>
          <button
            type="button"
            onClick={() => setRole('employer')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition ${role === 'employer' ? 'bg-white text-black shadow' : 'text-gray-400 hover:text-gray-200'}`}
          >
            <Briefcase size={16} /> Роботодавець
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input 
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-input border border-border rounded-xl p-3 text-white focus:border-white focus:outline-none transition"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Пароль</label>
            <input 
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full bg-input border border-border rounded-xl p-3 text-white focus:border-white focus:outline-none transition"
              placeholder="••••••••"
            />
          </div>

          {/* Умовні поля */}
          {role === 'job_seeker' ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Ім'я</label>
                <input 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full bg-input border border-border rounded-xl p-3 text-white focus:border-white focus:outline-none transition"
                  placeholder="Іван"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Прізвище</label>
                <input 
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full bg-input border border-border rounded-xl p-3 text-white focus:border-white focus:outline-none transition"
                  placeholder="Петренко"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm text-gray-400 mb-1">Назва компанії</label>
              <input 
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                className="w-full bg-input border border-border rounded-xl p-3 text-white focus:border-white focus:outline-none transition"
                placeholder="Tech Solutions Inc."
              />
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded-lg border border-red-500/20">
              {error}
            </div>
          )}

          <button 
            type="submit"
            className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition mt-4"
          >
            Зареєструватися
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          Вже є акаунт? <Link to="/login" className="text-white underline cursor-pointer hover:text-gray-300">Увійти</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;