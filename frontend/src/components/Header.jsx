import React, { useEffect, useState } from 'react';
import './Header.css';
import Modal from './Modal';
import { userAuthStore } from '../store/authStore.js';
import { useNavigate } from 'react-router-dom';
import pic from '../assets/happy.jpg';
import CreateStoryModal from './CreateStoryModal .jsx';

const Header = () => {
  const [showModal, setShowModal] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [modalHeading, setModalHeading] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  const navigate = useNavigate();

  const { signup, login, isAuthenticated, user, logout } = userAuthStore();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      signup(userName, password);
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
    try {
      await login(userName, password);
      setPassword('');
      setUserName('');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="container">
      {isAuthenticated ? (
        <>
          <div className="header-items">
            <div className="book">
              <button className="bookmark-btn">Bookmarks</button>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                enableBackground="new 0 0 500 500"
                fill="#FFF"
                viewBox="0 0 30 30"
                width="25px"
                height="25px"
              >
                {' '}
                <path d="M23,27l-8-7l-8,7V5c0-1.105,0.895-2,2-2h12c1.105,0,2,0.895,2,2V27z" />
              </svg>
            </div>
            <button
              className="add-story-btn"
              onClick={() => {
                setShowStoryModal(true); // Show the new modal when button is clicked
              }}
            >
              Add Story
            </button>

            {/* Conditionally render the modal */}
            {showStoryModal && (
              <CreateStoryModal
                onClose={() => {
                  setShowStoryModal(false); // Close the modal when onClose is called
                }}
              />
            )}
            <img
              src={pic}
              // alt="Profile"
              className="profile-pic"
            />
            <div className="profile-section">
              <button className="hamburger-btn" onClick={toggleMenu}>
                <svg
                  width="35px"
                  height="35px"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 18L20 18"
                    stroke="#000000"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M4 12L20 12"
                    stroke="#000000"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M4 6L20 6"
                    stroke="#000000"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>
          {menuOpen && (
            <div className="menu-modal">
              <p>{user.userName}</p>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </>
      ) : (
        <div>
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
              onSubmit={
                modalHeading === 'Register' ? handleSignUp : handleLogin
              }
              userName={userName}
              setUserName={setUserName}
              password={password}
              setPassword={setPassword}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Header;
