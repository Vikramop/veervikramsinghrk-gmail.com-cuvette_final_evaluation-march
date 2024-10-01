import './App.css';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import { useEffect } from 'react';
import { userAuthStore } from '../src/store/authStore.js';
import { Toaster } from 'react-hot-toast';
import BookmarkPage from './pages/BookmarkPage .jsx';

function App() {
  const { checkAuth } = userAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  return (
    <div>
      <Toaster />
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/bookmarks" element={<BookmarkPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
