import React, { useState } from 'react';
import './Header.css';
import Modal from './Modal';
import { userAuthStore } from '../store/authStore.js';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalHeading, setModalHeading] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const { signup, login } = userAuthStore();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      await signup(userName, password);
      //   onSuccess();
      navigate('/'); // Navigate to the home page or wherever you want
      //   toast.success('Sign-up successful!');
      setPassword('');
      setUserName('');
    } catch (error) {
      console.error(error);
      //   toast.error('Sign-up failed. Please try again.');
    }
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    await login(userName, password);
    setPassword('');
    setUserName('');
  };

  return (
    <div className="container">
      <button
        className="reg-btn"
        onClick={() => {
          setModalHeading('Register');
          setShowModal(true);
        }}
      >
        Register Now
      </button>

      <button
        className="signin-btn"
        onClick={() => {
          setModalHeading('Login');
          setShowModal(true);
        }}
      >
        Sign In
      </button>

      {showModal && (
        <Modal
          heading={modalHeading}
          onClose={() => {
            setShowModal(false);
          }}
          onSubmit={modalHeading === 'Register' ? handleSignUp : handleLogin}
          userName={userName}
          setUserName={setUserName}
          password={password}
          setPassword={setPassword}
        />
      )}
    </div>
  );
};

export default Header;
