import React, { useState, useEffect } from 'react';
import { X, User } from 'lucide-react';
import api from '../api/axios';

const UserProfileModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1. Ефект завантаження даних
  useEffect(() => {
    if (!isOpen) return; // Якщо закрито - не вантажимо

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get('/cabinet/me');
        setUserData(res.data);
      } catch (error) {
        console.error("Помилка профілю:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isOpen]);

  // 2. Умовний рендер (тільки після хуків!)
  if (!isOpen) return null;

  // Допоміжна функція рендеру профілю
  const renderProfileTab = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center gap-6">
        <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center border-2 border-gray-700 overflow-hidden">
           {userData?.profile?.profile_photo_url ? (
             <img src={userData.profile.profile_photo_url} alt="Profile" className="w-full h-full object-cover"/>
           ) : (
             <User size={40} className="text-gray-500" />
           )}
        </div>
        <button className="text-sm bg-input border border-border px-4 py-2 rounded-xl text-white hover:bg-gray-800 transition">
          Змінити фото
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-secondary">Ім'я</label>
          <input 
            defaultValue={userData?.profile?.first_name || ''}
            className="w-full bg-input border border-border rounded-xl p-3 text-white focus:outline-none focus:border-white transition" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-secondary">Прізвище</label>
          <input 
            defaultValue={userData?.profile?.last_name || ''}
            className="w-full bg-input border border-border rounded-xl p-3 text-white focus:outline-none focus:border-white transition" 
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-secondary">Email</label>
        <input 
          readOnly 
          value={userData?.profile?.email || ''} 
          className="w-full bg-input border border-border rounded-xl p-3 text-gray-500 cursor-not-allowed" 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="space-y-2">
          <label className="text-sm text-secondary">Телефон</label>
          <input 
             defaultValue={userData?.profile?.phone || ''}
             placeholder="+380..."
             className="w-full bg-input border border-border rounded-xl p-3 text-white focus:outline-none focus:border-white transition" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-secondary">Місто</label>
          <input 
             defaultValue={userData?.profile?.city || ''}
             className="w-full bg-input border border-border rounded-xl p-3 text-white focus:outline-none focus:border-white transition" 
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-secondary">Про себе</label>
        <textarea 
          defaultValue={userData?.profile?.about || ''}
          rows="4"
          className="w-full bg-input border border-border rounded-xl p-3 text-white focus:outline-none focus:border-white transition resize-none"
        ></textarea>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-card border border-border w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-xl font-bold text-white">Профіль користувача</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex px-6 border-b border-border gap-6 overflow-x-auto">
            {['profile', 'saved', 'settings'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 text-sm font-medium border-b-2 transition capitalize ${activeTab === tab ? 'border-white text-white' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
              >
                {tab === 'profile' ? 'Профіль' : tab === 'saved' ? 'Збережені' : 'Налаштування'}
              </button>
            ))}
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">
            {loading ? (
                <div className="text-center py-10 text-gray-500">Завантаження...</div>
            ) : (
                <>
                    {activeTab === 'profile' && renderProfileTab()}
                    
                    {activeTab === 'saved' && (
                        <div className="text-center py-10 text-gray-500">
                           {userData?.savedVacancies?.length > 0 ? (
                               <div className="space-y-4">
                                   {userData.savedVacancies.map(vac => (
                                       <div key={vac.id} className="bg-input p-4 rounded-xl text-left border border-border">
                                           <h3 className="font-bold text-white">{vac.title}</h3>
                                           <p className="text-sm text-gray-400">{vac.company_name}</p>
                                       </div>
                                   ))}
                               </div>
                           ) : "Немає збережених вакансій"}
                        </div>
                    )}

                    {activeTab === 'settings' && (
                         <div className="space-y-6">
                            <h3 className="font-bold text-lg text-white">Сповіщення</h3>
                            <div className="flex justify-between items-center bg-input p-4 rounded-xl border border-border">
                                <span className="text-gray-300">Отримувати email про нові вакансії</span>
                                <div className="w-12 h-6 bg-gray-700 rounded-full relative cursor-pointer">
                                    <div className="w-6 h-6 bg-white rounded-full absolute right-0"></div>
                                </div>
                            </div>
                         </div>
                    )}
                </>
            )}
        </div>

        <div className="p-6 border-t border-border flex justify-end gap-3">
             <button onClick={onClose} className="px-6 py-2.5 rounded-xl border border-border text-white hover:bg-gray-800 transition">
                 Закрити
             </button>
             <button className="bg-white text-black px-6 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition">
                 Зберегти зміни
             </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;