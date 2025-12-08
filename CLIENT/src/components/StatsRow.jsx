import React from 'react';

const StatsRow = ({ total, vacancies, freelancers }) => {
  return (
    <div className="flex justify-center gap-8 md:gap-12 mb-10 text-center text-white">
      <div>
        <div className="text-2xl font-bold">{total || 0}</div>
        <div className="text-xs text-gray-400 uppercase tracking-wide">всього</div>
      </div>
      
      {/* Розділювач */}
      <div className="w-px bg-gray-800 h-10"></div> 
      
      <div>
        <div className="text-2xl font-bold">{vacancies || 0}</div>
        <div className="text-xs text-gray-400 uppercase tracking-wide">вакансій</div>
      </div>
      
      <div className="w-px bg-gray-800 h-10"></div>
      
      <div>
        <div className="text-2xl font-bold">{freelancers || 0}</div>
        <div className="text-xs text-gray-400 uppercase tracking-wide">фрілансерів</div>
      </div>
    </div>
  );
};

export default StatsRow;