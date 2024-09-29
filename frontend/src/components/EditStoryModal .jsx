import React, { useState, useEffect } from 'react';
import close from '../assets/close.jpg';
import './CreateStoryModal.css';
import { useStoryStore } from '../store/story';
import { toast } from 'react-hot-toast';

const EditStoryModal = ({ onClose, storyData }) => {
  // console.log('Modal opened with story data222:', storyData);
  const storyId = storyData._id;
  // console.log('storyId', storyId);
  const [tabs, setTabs] = useState(['Tab 1']);
  const [formData, setFormData] = useState([]);
  const [currentTab, setCurrentTab] = useState(0);

  const categories = ['Gaming', 'People', 'Sports', 'Food', 'India', 'Animals'];

  useEffect(() => {
    if (storyData.length > 0) {
      const initialData = storyData.map((story) => ({
        heading: story.heading || '',
        description: story.description || '',
        image: story.image || '',
        category: story.category || 'India',
      }));
      setFormData(initialData);
      setTabs(initialData.map((_, index) => `Tab ${index + 1}`)); // Initialize tabs based on story data length
    }
  }, [storyData]);

  const handleTabAdd = () => {
    const newTabIndex = tabs.length + 1;
    setTabs([...tabs, `Tab ${newTabIndex}`]);
    setFormData([
      ...formData,
      { heading: '', description: '', image: '', category: 'India' },
    ]); // Initialize new form data
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

    // Update the specific tab's form data
    setFormData((prev) => {
      const newData = [...prev];
      newData[currentTab] = { ...newData[currentTab], [name]: value };
      return newData;
    });
  };

  const { editStory } = useStoryStore();

  const handleEditStory = async () => {
    const incompleteStory = formData.some((story) => {
      // Check if at least one field is filled
      const isFilled =
        story.heading || story.description || story.image || story.category;
      return !isFilled; // Return true if no field is filled
    });

    if (incompleteStory) {
      toast.error('Please fill in at least one field for each story.');
      return;
    }

    const { success, message } = await editStory(storyId, formData[currentTab]);

    if (success) {
      // Immediately update formData to reflect the edited story
      setFormData((prevData) => {
        const updatedData = [...prevData];
        updatedData[currentTab] = {
          ...updatedData[currentTab],
          ...formData[currentTab], // Merge with the current form data
        };
        return updatedData;
      });

      toast.success('Story updated successfully!');
      onClose(); // Close the modal after successful edit
    } else {
      toast.error(message);
    }
  };

  return (
    <div className="modal-container">
      <div className="story-modal">
        <button className="close-btn" onClick={onClose}>
          <img src={close} alt="Close" />
        </button>
        <div className="tabs">
          {tabs.map((tab, index) => (
            <div
              key={index}
              className={`tab ${currentTab === index ? 'active' : ''}`}
              onClick={() => handleTabClick(index)}
            >
              {tab}
              {index >= 1 && ( // Allow deletion of tabs starting from the second one
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

        <form className="form-fields" onSubmit={handleEditStory}>
          <div className="input-container">
            <label htmlFor="heading" className="label">
              Heading :
            </label>
            <input
              type="text"
              name="heading"
              value={formData[currentTab]?.heading || ''}
              onChange={handleChange}
              placeholder="Heading"
            />
          </div>

          <div className="input-container">
            <label htmlFor="description" className="label">
              Description :
            </label>
            <textarea
              name="description"
              value={formData[currentTab]?.description || ''}
              onChange={handleChange}
              placeholder="Description"
              className="input"
              rows={5}
            />
          </div>

          <div className="input-container">
            <label htmlFor="image" className="label">
              Image :
            </label>
            <input
              type="text"
              name="image"
              value={formData[currentTab]?.image || ''}
              onChange={handleChange}
              placeholder="Image/Video URL"
            />
          </div>

          <div className="input-container">
            <label htmlFor="category" className="label">
              Category :
            </label>
            <select
              name="category"
              value={formData[currentTab]?.category || 'India'}
              onChange={handleChange}
              className="select-category"
            >
              <option value="" disabled>
                Select Category
              </option>
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

          <button className="post-btn" type="submit" onClick={handleEditStory}>
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditStoryModal;
