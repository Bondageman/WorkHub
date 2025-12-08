import React from 'react';
import { Briefcase, MapPin, Clock, Bookmark } from 'lucide-react';

const JobCard = ({ vacancy }) => {
  // Захист від пустих даних, щоб не було білого екрану
  if (!vacancy) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 hover:border-gray-600 transition-colors flex flex-col h-full text-white">
      {/* Верх: Іконка та Тип */}
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 bg-input rounded-xl flex items-center justify-center text-white">
           <Briefcase size={24} />
        </div>
        <span className="bg-input text-white text-xs px-3 py-1 rounded-full border border-border">
          Вакансія
        </span>
      </div>

      {/* Заголовок */}
      <h3 className="text-xl font-bold mb-1">{vacancy.title}</h3>
      <p className="text-secondary text-sm mb-4">{vacancy.company_name || "Компанія"}</p>

      {/* Теги (статичні для прикладу) */}
      <div className="flex flex-wrap gap-2 mb-6">
        <span className="text-xs bg-input text-gray-300 px-3 py-1 rounded-lg border border-border">Full-time</span>
        <span className="text-xs bg-input text-gray-300 px-3 py-1 rounded-lg border border-border">Office</span>
      </div>

      {/* Опис */}
      <p className="text-gray-400 text-sm mb-6 line-clamp-2 flex-grow">
        {vacancy.description}
      </p>

      {/* Деталі */}
      <div className="flex items-center gap-4 text-xs text-gray-400 mb-6">
        <div className="flex items-center gap-1">
          <MapPin size={14} /> {vacancy.city || 'Віддалено'}
        </div>
        <div className="font-semibold text-white">
          ${vacancy.salary_min} - {vacancy.salary_max}
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <Clock size={14} /> 2 год тому
        </div>
      </div>

      {/* Кнопка */}
      <div className="mt-auto">
        <button className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-gray-200 transition">
          Подати заявку
        </button>
      </div>
    </div>
  );
};

export default JobCard;