import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Ми імпортуємо тільки СТОРІНКИ.
// Зверни увагу на одну крапку ./ (це означає: шукай в папці src/pages)
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Коли заходимо на сайт (/) - показуємо Dashboard */}
        <Route path="/" element={<Dashboard />} />
        
        {/* Коли заходимо на /login - показуємо LoginPage */}
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;