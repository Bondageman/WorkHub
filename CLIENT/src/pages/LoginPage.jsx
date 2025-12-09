import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // <--- Додали Link сюди
import api from '../api/axios';
import { Briefcase } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await api.post('/login', { email, password });
      
      const token = response.data.token;
      localStorage.setItem('token', token);
      
      navigate('/');
      
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Помилка входу');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-2xl">
        
        {/* Логотип */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-black mb-4">
            <Briefcase size={24} />
          </div>
          <h1 className="text-2xl font-bold">Вхід у JobHub</h1>
          <p className="text-gray-400">Раді бачити вас знову!</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-input border border-border rounded-xl p-3 text-white focus:border-white focus:outline-none transition"
              placeholder="name@company.com"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Пароль</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-input border border-border rounded-xl p-3 text-white focus:border-white focus:outline-none transition"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded-lg border border-red-500/20">
              {error}
            </div>
          )}

          <button 
            type="submit"
            className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition mt-2"
          >
            Увійти
          </button>
        </form>

        {/* Ось ця частина змінилася - тепер це посилання на реєстрацію */}
        <div className="mt-6 text-center text-sm text-gray-400">
          Ще немає акаунту? <Link to="/register" className="text-white underline cursor-pointer hover:text-gray-300">Зареєструватися</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;