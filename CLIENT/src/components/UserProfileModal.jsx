import React, { useState, useEffect } from 'react';
import { X, User, Trash2, ExternalLink, Save } from 'lucide-react';
import api from '../api/axios';

const UserProfileModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [savedVacancies, setSavedVacancies] = useState([]);
  
  // Цей стейт зберігає дані форми для редагування
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    city: '',
    about: '',
    email: '', // Email зазвичай read-only
    profile_photo_url: '',
    // Налаштування (Boolean)
    notify_email_new_jobs: false,
    notify_email_status_change: false,
    show_profile_to_employers: false,
    allow_contact_from_recruiters: false
  });

  // Завантаження даних
  useEffect(() => {
    if (!isOpen) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get('/cabinet/me');
        const profile = res.data.profile || {};
        const saved = res.data.savedVacancies || [];

        setSavedVacancies(saved);
        
        // Заповнюємо форму даними з бази
        setFormData({
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          phone: profile.phone || '',
          city: profile.city || '',
          about: profile.about || '',
          email: profile.email || '', // Email береться з таблиці users, може бути в res.data.email або profile.email
          profile_photo_url: profile.profile_photo_url || '',
          // Конвертуємо 1/0 з MySQL в true/false для React
          notify_email_new_jobs: Boolean(profile.notify_email_new_jobs),
          notify_email_status_change: Boolean(profile.notify_email_status_change),
          show_profile_to_employers: Boolean(profile.show_profile_to_employers),
          allow_contact_from_recruiters: Boolean(profile.allow_contact_from_recruiters),
        });

      } catch (error) {
        console.error("Помилка завантаження:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isOpen]);

  // Обробка введення тексту
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Обробка перемикачів (Toggle)
  const handleToggle = (name) => {
    setFormData(prev => ({ ...prev, [name]: !prev[name] }));
  };

  // Збереження змін
  const handleSave = async () => {
    try {
      await api.put('/cabinet/update', formData);
      alert('Зміни збережено успішно!');
      onClose();
    } catch (error) {
      console.error(error);
      alert('Не вдалося зберегти зміни.');
    }
  };

  // Видалення збереженої вакансії
  const handleRemoveSaved = async (id) => {
    try {
      await api.delete(`/saved-vacancies/${id}`);
      // Видаляємо з інтерфейсу локально, щоб не перезавантажувати все
      setSavedVacancies(prev => prev.filter(v => v.id !== id));
    } catch (error) {
      console.error(error);
      alert('Помилка видалення.');
    }
  };

  if (!isOpen) return null;

  // --- ВНУТРІШНІ КОМПОНЕНТИ ВЛАДОК ---

  const renderProfileTab = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center gap-6">
        <div className="w-24 h-24 bg-neutral-900 rounded-full flex items-center justify-center border-2 border-neutral-800 overflow-hidden">
           {formData.profile_photo_url ? (
             <img src={formData.profile_photo_url} alt="Profile" className="w-full h-full object-cover"/>
           ) : (
             <User size={40} className="text-gray-500" />
           )}
        </div>
        <div className="flex flex-col gap-2">
            <h3 className="font-bold text-white">{formData.first_name} {formData.last_name}</h3>
            <button className="text-xs bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition">
            Змінити фото
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Ім'я</label>
          <input name="first_name" value={formData.first_name} onChange={handleChange} className="w-full bg-input border border-border rounded-xl p-3 text-white focus:outline-none focus:border-white transition" />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Прізвище</label>
          <input name="last_name" value={formData.last_name} onChange={handleChange} className="w-full bg-input border border-border rounded-xl p-3 text-white focus:outline-none focus:border-white transition" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-gray-400">Email</label>
        <input readOnly value={formData.email} className="w-full bg-input border border-border rounded-xl p-3 text-gray-500 cursor-not-allowed" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="space-y-2">
          <label className="text-sm text-gray-400">Телефон</label>
          <input name="phone" value={formData.phone} onChange={handleChange} placeholder="+380..." className="w-full bg-input border border-border rounded-xl p-3 text-white focus:outline-none focus:border-white transition" />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Місто</label>
          <input name="city" value={formData.city} onChange={handleChange} className="w-full bg-input border border-border rounded-xl p-3 text-white focus:outline-none focus:border-white transition" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-gray-400">Про себе</label>
        <textarea name="about" value={formData.about} onChange={handleChange} rows="4" className="w-full bg-input border border-border rounded-xl p-3 text-white focus:outline-none focus:border-white transition resize-none"></textarea>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-8 animate-fadeIn">
        
        {/* Блок Сповіщень */}
        <div className="space-y-4">
            <h3 className="font-bold text-lg text-white">Налаштування сповіщень</h3>
            <div className="bg-input rounded-xl border border-border overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-border">
                    <span className="text-gray-300">Email сповіщення про нові вакансії</span>
                    <button 
                        onClick={() => handleToggle('notify_email_new_jobs')}
                        className={`w-12 h-6 rounded-full relative transition-colors ${formData.notify_email_new_jobs ? 'bg-white' : 'bg-gray-700'}`}
                    >
                        <div className={`w-4 h-4 rounded-full absolute top-1 transition-all ${formData.notify_email_new_jobs ? 'right-1 bg-black' : 'left-1 bg-white'}`}></div>
                    </button>
                </div>
                <div className="flex justify-between items-center p-4">
                    <span className="text-gray-300">Сповіщення про зміну статусу заявки</span>
                    <button 
                        onClick={() => handleToggle('notify_email_status_change')}
                        className={`w-12 h-6 rounded-full relative transition-colors ${formData.notify_email_status_change ? 'bg-white' : 'bg-gray-700'}`}
                    >
                        <div className={`w-4 h-4 rounded-full absolute top-1 transition-all ${formData.notify_email_status_change ? 'right-1 bg-black' : 'left-1 bg-white'}`}></div>
                    </button>
                </div>
            </div>
        </div>

        {/* Блок Приватності */}
        <div className="space-y-4">
            <h3 className="font-bold text-lg text-white">Приватність</h3>
            <div className="bg-input rounded-xl border border-border overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-border">
                    <span className="text-gray-300">Показувати мій профіль роботодавцям</span>
                    <button 
                        onClick={() => handleToggle('show_profile_to_employers')}
                        className={`w-12 h-6 rounded-full relative transition-colors ${formData.show_profile_to_employers ? 'bg-white' : 'bg-gray-700'}`}
                    >
                        <div className={`w-4 h-4 rounded-full absolute top-1 transition-all ${formData.show_profile_to_employers ? 'right-1 bg-black' : 'left-1 bg-white'}`}></div>
                    </button>
                </div>
                <div className="flex justify-between items-center p-4">
                    <span className="text-gray-300">Дозволити контакт від рекрутерів</span>
                    <button 
                        onClick={() => handleToggle('allow_contact_from_recruiters')}
                        className={`w-12 h-6 rounded-full relative transition-colors ${formData.allow_contact_from_recruiters ? 'bg-white' : 'bg-gray-700'}`}
                    >
                        <div className={`w-4 h-4 rounded-full absolute top-1 transition-all ${formData.allow_contact_from_recruiters ? 'right-1 bg-black' : 'left-1 bg-white'}`}></div>
                    </button>
                </div>
            </div>
        </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-card border border-border w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-xl font-bold text-white">Профіль користувача</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 border-b border-border gap-6 overflow-x-auto">
            {['profile', 'saved', 'settings'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 text-sm font-medium border-b-2 transition capitalize whitespace-nowrap ${activeTab === tab ? 'border-white text-white' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
              >
                {tab === 'profile' ? 'Профіль' : tab === 'saved' ? 'Збережені' : 'Налаштування'}
              </button>
            ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">
            {loading ? (
                <div className="text-center py-10 text-gray-500">Завантаження...</div>
            ) : (
                <>
                    {activeTab === 'profile' && renderProfileTab()}
                    
                    {activeTab === 'saved' && (
                        <div className="animate-fadeIn">
                           {savedVacancies.length > 0 ? (
                               <div className="space-y-4">
                                   {savedVacancies.map(vac => (
                                       <div key={vac.id} className="bg-input p-4 rounded-xl flex justify-between items-center border border-border group">
                                           <div>
                                                <h3 className="font-bold text-white text-lg">{vac.title}</h3>
                                                <p className="text-sm text-gray-400">{vac.company_name}</p>
                                           </div>
                                           <div className="flex gap-3 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 bg-white text-black rounded-lg hover:bg-gray-200" title="Переглянути">
                                                    <ExternalLink size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleRemoveSaved(vac.id)}
                                                    className="p-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500 hover:text-white transition" 
                                                    title="Видалити"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                           </div>
                                       </div>
                                   ))}
                               </div>
                           ) : (
                               <div className="text-center py-10 text-gray-500">Немає збережених вакансій</div>
                           )}
                        </div>
                    )}

                    {activeTab === 'settings' && renderSettingsTab()}
                </>
            )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex justify-end gap-3">
             <button onClick={onClose} className="px-6 py-2.5 rounded-xl border border-border text-white hover:bg-gray-800 transition">
                 Закрити
             </button>
             <button 
                onClick={handleSave}
                className="bg-white text-black px-6 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition flex items-center gap-2"
             >
                 <Save size={18} />
                 Зберегти зміни
             </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;