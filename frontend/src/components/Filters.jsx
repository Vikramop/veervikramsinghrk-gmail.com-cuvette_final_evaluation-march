import React, { useRef, useState } from 'react';
import { useStoryStore } from '../store/story';

const Filters = ({ onCategorySelect }) => {
  const { fetchFilteredStories } = useStoryStore();
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [filterCategory, setFilterCategory] = useState(null);

  const filterRef = useRef(null);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - filterRef.current.offsetLeft);
    setScrollLeft(filterRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - filterRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    filterRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleCategoryClick = (filterCategory) => {
    setFilterCategory(filterCategory); // Update the selected category
    fetchFilteredStories(filterCategory);
    onCategorySelect(filterCategory); // Call the function to fetch stories
  };

  return (
    <div
      className="filter"
      ref={filterRef}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <div className="box1" onClick={() => handleCategoryClick('India')}>
        India
      </div>
      <div className="box2" onClick={() => handleCategoryClick('Sports')}>
        Sports
      </div>
      <div className="box3" onClick={() => handleCategoryClick('Gaming')}>
        Gaming
      </div>
      <div className="box4" onClick={() => handleCategoryClick('Food')}>
        Food
      </div>
      <div className="box5" onClick={() => handleCategoryClick('People')}>
        People
      </div>
      <div className="box6" onClick={() => handleCategoryClick('Animals')}>
        Animals
      </div>
    </div>
  );
};

export default Filters;
