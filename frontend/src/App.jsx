import './App.css';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import { ToastContainer } from 'react-toastify';
import { useEffect } from 'react';
import { userAuthStore } from '../src/store/authStore.js';
import { Toaster } from 'react-hot-toast';

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
        </Routes>
      </div>
    </div>
  );
}

export default App;
