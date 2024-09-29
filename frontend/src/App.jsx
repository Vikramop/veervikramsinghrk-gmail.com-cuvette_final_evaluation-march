import './App.css';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import { ToastContainer } from 'react-toastify';
import { useEffect } from 'react';
import { userAuthStore } from '../src/store/authStore.js';
import { Toaster } from 'react-hot-toast';
import BookmarkPage from './pages/BookmarkPage .jsx';
import Header from './components/Header.jsx';
import { useStoryStore } from './store/story.js';

function App() {
  const { checkAuth } = userAuthStore();
  const { fetchStory, clearStories } = useStoryStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  return (
    <div>
      <Toaster />
      <div>
        <Header fetchStory={fetchStory} clearStories={clearStories} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/bookmarks" element={<BookmarkPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
