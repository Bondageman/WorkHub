import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react'; // Іконки
import api from '../api/axios';

const CreateVacancyModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    city: '',
    salary_min: '',
    salary_max: '',
    description: '',
  });

  // Стан для навичок (тегів)
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState([]);

  if (!isOpen) return null;

  // Обробка зміни полів
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Додавання навички при натисканні Enter або кнопки
  const addSkill = (e) => {
    e.preventDefault();
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  // Видалення навички
  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  // Відправка форми на сервер
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/vacancies', {
        ...formData,
        skills: skills // Відправляємо масив навичок
      });
      alert('Вакансію успішно створено!');
      onSuccess(); // Оновлюємо список вакансій на Dashboard
      onClose();   // Закриваємо вікно
    } catch (error) {
      console.error(error);
      alert('Помилка: ' + (error.response?.data?.message || 'Не вдалося створити вакансію'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-card border border-border w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Шапка */}
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-xl font-bold text-white">Створити оголошення</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Форма з прокруткою */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Назва та Компанія (компанія підтягнеться на бекенді) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Назва вакансії</label>
                <input 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange}
                  placeholder="напр. Junior React Developer"
                  required
                  className="w-full bg-input border border-border rounded-xl p-3 text-white focus:border-gray-500 focus:outline-none transition"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Місто</label>
                <input 
                  name="city" 
                  value={formData.city} 
                  onChange={handleChange}
                  placeholder="Київ / Віддалено"
                  className="w-full bg-input border border-border rounded-xl p-3 text-white focus:border-gray-500 focus:outline-none transition"
                />
              </div>
            </div>

            {/* Зарплата */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Зарплата від ($)</label>
                <input 
                  type="number" 
                  name="salary_min" 
                  value={formData.salary_min} 
                  onChange={handleChange}
                  placeholder="500"
                  className="w-full bg-input border border-border rounded-xl p-3 text-white focus:border-gray-500 focus:outline-none transition"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Зарплата до ($)</label>
                <input 
                  type="number" 
                  name="salary_max" 
                  value={formData.salary_max} 
                  onChange={handleChange}
                  placeholder="1500"
                  className="w-full bg-input border border-border rounded-xl p-3 text-white focus:border-gray-500 focus:outline-none transition"
                />
              </div>
            </div>

            {/* Опис */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Опис вакансії</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange}
                required
                rows="5"
                placeholder="Вимоги, обов'язки, умови роботи..."
                className="w-full bg-input border border-border rounded-xl p-3 text-white focus:border-gray-500 focus:outline-none transition resize-none"
              ></textarea>
            </div>

            {/* Навички (Теги) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Навички та технології</label>
              <div className="flex gap-2">
                <input 
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSkill(e)}
                  placeholder="Введіть навичку і натисніть Enter (напр. React)"
                  className="flex-1 bg-input border border-border rounded-xl p-3 text-white focus:border-gray-500 focus:outline-none transition"
                />
                <button 
                  type="button" 
                  onClick={addSkill}
                  className="bg-white text-black p-3 rounded-xl hover:bg-gray-200 transition"
                >
                  <Plus />
                </button>
              </div>
              
              {/* Список доданих тегів */}
              <div className="flex flex-wrap gap-2 mt-3">
                {skills.map(skill => (
                  <span key={skill} className="bg-gray-800 text-gray-200 px-3 py-1 rounded-lg text-sm flex items-center gap-2 border border-gray-700">
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-400">
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Футер кнопок */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-4">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-6 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 transition"
              >
                Скасувати
              </button>
              <button 
                type="submit" 
                className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition"
              >
                Опублікувати вакансію
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateVacancyModal;