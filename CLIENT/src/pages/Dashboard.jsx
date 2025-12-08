import React, { useEffect, useState } from 'react';
import { Search, Plus, Filter, User } from 'lucide-react';
import api from '../api/axios';

// Імпорти компонентів
import StatsRow from '../components/StatsRow'; 
import JobCard from '../components/JobCard';
import CreateVacancyModal from '../components/CreateVacancyModal';
import UserProfileModal from '../components/UserProfileModal';

const Dashboard = () => {
  const [vacancies, setVacancies] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  
  // Стан для відкриття вікон
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);

  // Виносимо функцію завантаження, щоб передати її в модалку
  const loadData = async () => {
    try {
      const res = await api.get('/vacancies');
      setVacancies(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Помилка завантаження:", err);
    }
  };

  // Завантажуємо при першому відкритті
  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 relative">
      
      {/* 1. Header */}
      <header className="flex justify-between items-center mb-16 max-w-7xl mx-auto">
        <div className="text-2xl font-bold tracking-tight">JobHub</div>
        
        <div className="relative w-1/3 hidden md:block">
          <Search className="absolute left-4 top-3 text-gray-500 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Пошук..." 
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-2.5 pl-12 pr-4 text-white focus:outline-none focus:border-gray-500 transition"
          />
        </div>

        {/* Кнопка ПРОФІЛЮ */}
        <button 
          onClick={() => setProfileOpen(true)}
          className="w-10 h-10 bg-neutral-900 rounded-full flex items-center justify-center border border-neutral-800 hover:border-gray-600 transition"
        >
          <User className="text-gray-400 w-5 h-5" />
        </button>
      </header>

      {/* 2. Заголовок */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Знайди роботу мрії</h1>
        <p className="text-gray-400 text-lg">Платформа, де зустрічаються таланти</p>
      </div>

      {/* 3. Статистика */}
      <StatsRow total={vacancies.length + 5} vacancies={vacancies.length} freelancers={5} />

      {/* 4. Вкладки */}
      <div className="flex justify-between items-center mb-8 max-w-7xl mx-auto">
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('all')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition ${activeTab === 'all' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
          >
            Всі
          </button>
          <button 
             onClick={() => setActiveTab('vacancies')}
             className={`px-6 py-2 rounded-full text-sm font-medium transition ${activeTab === 'vacancies' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
          >
            Вакансії ({vacancies.length})
          </button>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 border border-neutral-800 rounded-full text-sm text-gray-400 hover:text-white transition">
          <Filter size={16} /> Фільтри
        </button>
      </div>

      {/* 5. Сітка вакансій */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto pb-20">
        {vacancies.length > 0 ? (
          vacancies.map(vacancy => (
            <JobCard key={vacancy.id} vacancy={vacancy} />
          ))
        ) : (
          <div className="col-span-3 text-center text-gray-500 py-10">
            Вакансій поки немає або йде завантаження...
          </div>
        )}
      </div>

      {/* 6. Кнопка (+) СТВОРИТИ */}
      <button 
        className="fixed bottom-10 right-10 w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer z-40 text-black"
        onClick={() => setCreateOpen(true)}
      >
        <Plus size={32} />
      </button>

      {/* === МОДАЛЬНІ ВІКНА === */}
      
      {/* Створення вакансії */}
      <CreateVacancyModal 
        isOpen={isCreateOpen} 
        onClose={() => setCreateOpen(false)}
        onSuccess={() => {
           loadData(); // Оновити список після створення
        }}
      />

      {/* Профіль користувача */}
      <UserProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setProfileOpen(false)}
      />

    </div>
  );
};

export default Dashboard;