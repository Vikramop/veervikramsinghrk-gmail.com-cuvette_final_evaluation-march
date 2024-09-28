import React from 'react';
import './Modal.css';
import close from '../assets/close.jpg';
import { userAuthStore } from '../store/authStore.js';

const Modal = ({
  onClose,
  heading,
  onSubmit,
  userName,
  setUserName,
  password,
  setPassword,
  clearError,
}) => {
  const { error, isAuthenticated } = userAuthStore();

  const handleClose = () => {
    clearError();
    onClose();
  };

  return (
    <div className="modal-container">
      <div className="auth-modal">
        <button className="close-btn">
          <img src={close} onClick={handleClose} />
        </button>
        <p className="register">{heading}</p>
        <form onSubmit={onSubmit}>
          <div className="input-container">
            <label htmlFor="Username" className="label">
              Username
            </label>
            <input
              type="text"
              id="Username"
              placeholder="Username"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
          </div>
          <div className="input-container">
            <label htmlFor="password" className="label">
              password
            </label>
            <input
              type="password"
              id="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {isAuthenticated && <p>registed sucessufully</p>}
          {error && <p className="error-msg">{error}</p>}
          <button className="register-btn" type="submit">
            {heading}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Modal;
