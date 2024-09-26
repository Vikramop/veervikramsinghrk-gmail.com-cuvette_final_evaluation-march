import React, { useState } from 'react';
import close from '../assets/close.jpg';
import './CreateStoryModal.css';

const CreateStoryModal = ({ onClose }) => {
  const initialTabs = ['Slide 1', 'Slide 2', 'Slide 3'];
  const initialFormData = Array.from({ length: initialTabs.length }, () => ({
    heading: '',
    description: '',
    image: '',
    category: 'India',
  }));

  const [tabs, setTabs] = useState(initialTabs);
  const [formData, setFormData] = useState(initialFormData);
  const [currentTab, setCurrentTab] = useState(0);

  const categories = ['India', 'China', 'Food', 'World', 'Sport'];

  const handleTabAdd = () => {
    if (tabs.length < 6) {
      setTabs([...tabs, `Slide ${tabs.length + 1}`]);
      setFormData([
        ...formData,
        { heading: '', description: '', image: '', category: 'India' },
      ]);
    }
  };

  const handleTabDelete = (index) => {
    setTabs(tabs.filter((_, i) => i !== index));
    setFormData(formData.filter((_, i) => i !== index));
    if (currentTab >= tabs.length - 1) {
      setCurrentTab(tabs.length - 2); // Go to previous tab if the last one is deleted
    }
  };

  const handleTabClick = (index) => {
    setCurrentTab(index);
  };

  const handleNext = () => {
    if (currentTab < tabs.length - 1) {
      setCurrentTab(currentTab + 1);
    }
  };

  const handlePrevious = () => {
    if (currentTab > 0) {
      setCurrentTab(currentTab - 1);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedSlide = { ...prev[currentTab], [name]: value };
      const updatedData = [...prev];
      updatedData[currentTab] = updatedSlide;
      return updatedData;
    });
  };

  const handleSubmit = () => {
    // Post logic here
    console.log('Form Data:', formData);
  };

  return (
    <div className="modal-container">
      <div className="story-modal">
        <button className="close-btn" onClick={onClose}>
          <img src={close} />
        </button>
        <div className="tabs">
          {tabs.map((tab, index) => (
            <div
              key={index}
              className={`tab ${currentTab === index ? 'active' : ''}`}
              onClick={() => handleTabClick(index)}
            >
              {tab}
              {index >= 3 && (
                <span
                  className="cross"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTabDelete(index);
                  }}
                >
                  &times;
                </span>
              )}
            </div>
          ))}
          {tabs.length < 6 && (
            <div className="tab add-tab" onClick={handleTabAdd}>
              Add +
            </div>
          )}
        </div>

        <form className="form-fields">
          <div className="input-container">
            <label htmlFor="Username" className="label">
              Heading :
            </label>
            <input
              type="text"
              name="heading"
              value={formData[currentTab].heading}
              onChange={handleChange}
              placeholder="Heading"
            />
          </div>

          <div className="input-container">
            <label htmlFor="Username" className="label">
              Description :
            </label>
            <textarea
              name="description"
              value={formData[currentTab].description}
              onChange={handleChange}
              placeholder="Description"
              className="input"
              rows={5}
            />
          </div>

          <div className="input-container">
            <label htmlFor="Username" className="label">
              Image :
            </label>
            <input
              type="text"
              name="image"
              value={formData[currentTab].image}
              onChange={handleChange}
              placeholder="Image/Video URL"
            />
          </div>

          <div className="input-container">
            <label htmlFor="Username" className="label">
              Category :
            </label>
            <select
              name="category"
              value={formData[currentTab].category}
              onChange={handleChange}
              className="select-category"
            >
              <option value="" disabled>
                Select Category
              </option>{' '}
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </form>

        <div className="modal-actions">
          <div className="btns">
            <button
              className="prev-btn"
              onClick={handlePrevious}
              disabled={currentTab === 0}
            >
              Previous
            </button>
            <button
              className="next-btn"
              onClick={handleNext}
              disabled={currentTab === tabs.length - 1}
            >
              Next
            </button>
          </div>

          <button className="post-btn" onClick={handleSubmit}>
            Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateStoryModal;
