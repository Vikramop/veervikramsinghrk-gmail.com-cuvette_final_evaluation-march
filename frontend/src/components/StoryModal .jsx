import React, { useEffect, useState } from 'react';
import share from '../assets/share.png';
import '../pages/Home.css';

// Reusable Story Modal
const StoryModal = ({
  stories,
  currentStoryId,
  onClose,
  isVideo,
  getYouTubeId,
  handleLikeClick,
  handleBookmarkClick,
  handleShareClick,
  likedStories,
  bookmarks,
  isLoggedIn,
}) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const storyIndex = stories.findIndex(
      (story) => story._id === currentStoryId
    );

    if (storyIndex !== -1) {
      setIndex(storyIndex);
    }
  }, [currentStoryId, stories]);

  const handleNext = () => {
    if (index < stories.length - 1) setIndex(index + 1);
  };

  const handlePrev = () => {
    if (index > 0) setIndex(index - 1);
  };

  const ProgressBar = () => {
    const totalStories = stories.length;
    const segmentWidth = totalStories === 0 ? '0px' : `${90 / totalStories}%`;
    return (
      <div className="progress-bar">
        {stories.map((_, i) => (
          <p
            key={i}
            className={`line ${i <= index ? 'active' : ''}`}
            style={{
              display: 'inline-block',
              width: segmentWidth,
              // height: '1px',

              borderColor: i <= index ? '#FFF' : '#a3a3a3c5',
              marginRight: '2px',
              borderRadius: '5px',
            }}
          />
        ))}
      </div>
    );
  };

  // Get the current story
  const currentStory = stories[index];
  const isLiked = likedStories.some(
    (likedStory) => likedStory._id === currentStoryId
  );
  const isBookmarked = bookmarks.includes(currentStoryId);
  const likeCount =
    likedStories.find((likedStory) => likedStory._id === currentStoryId)
      ?.likeCount || 0;

  return (
    <div className="story-card-over-container ">
      <div className="story-card-over ">
        {isVideo(currentStory.image) ? (
          currentStory.image.includes('youtube.com') ||
          currentStory.image.includes('youtu.be') ? (
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${getYouTubeId(
                currentStory.image
              )}`}
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
              className="background-video"
            />
          ) : (
            <video
              autoPlay
              loop
              muted
              className="background-video"
              src={currentStory.image}
              type="video/mp4"
            />
          )
        ) : (
          <div
            className="background-image"
            style={{
              backgroundImage: `url(${currentStory.image})`,
            }}
          >
            <div className="modal-header">
              <ProgressBar />
              <div className="modal-CS">
                <button onClick={onClose} className="modal-close-btn">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="#ffffff"
                  >
                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      {' '}
                      <path
                        d="M19 5L4.99998 19M5.00001 5L19 19"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>{' '}
                    </g>
                  </svg>
                </button>
                <button
                  className="modal-share"
                  onClick={() => handleShareClick(currentStoryId)}
                >
                  <img src={share} alt="Share" />
                </button>
              </div>
              <div className="story-modal-buttons">
                <button
                  onClick={() => handleBookmarkClick(currentStoryId)}
                  className="bookmarks"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    strokeWidth="2"
                    stroke={isBookmarked && isLoggedIn ? '#0000FF' : '#000'}
                    fill={isBookmarked && isLoggedIn ? '#0000FF' : '#FFF'}
                    viewBox="0 0 30 30"
                    width="30px"
                    height="30px"
                    className="svg"
                  >
                    <path d="M23,27l-8-7l-8,7V5c0-1.105,0.895-2,2-2h12c1.105,0,2,0.895,2,2V27z" />
                  </svg>
                </button>

                <button
                  onClick={() => handleLikeClick(currentStoryId)}
                  className={`like-btn ${isLiked ? 'liked' : ''}`}
                >
                  <svg
                    height="30px"
                    width="30px"
                    version="1.1"
                    id="Layer_1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                  >
                    <path
                      style={{
                        fill: isLiked && isLoggedIn ? '#FF5023' : '#FFFFFF',
                      }}
                      d="M373.029,43.886c-49.137,0-92.317,25.503-117.029,63.993
                c-24.712-38.489-67.891-63.993-117.029-63.993C62.22,43.886,0,106.105,0,182.857c0,90.699,67.291,141.41,134.583,194.073
                C194.493,423.816,256,468.114,256,468.114s61.509-44.298,121.417-91.184C444.709,324.267,512,273.556,512,182.857
                C512,106.105,449.78,43.886,373.029,43.886z"
                    />
                  </svg>
                  <span
                    className="count"
                    style={{ marginLeft: '8px', color: 'white' }}
                  >
                    {likeCount}
                  </span>
                </button>
              </div>
            </div>
            <div>
              <p className="story-heading">{currentStory.heading}</p>
              <p className="story-description">{currentStory.description}</p>
            </div>
          </div>
        )}
      </div>

      <div className="modal-footer">
        <button
          className="modal-prev-btn"
          onClick={handlePrev}
          disabled={index === 0}
        >
          <svg
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className="modal-svg"
          >
            <polyline
              fill="none"
              stroke="#FFF"
              strokeWidth="2"
              points="7 2 17 12 7 22"
              transform="matrix(-1 0 0 1 24 0)"
            />
          </svg>
        </button>

        <button
          className="modal-next-btn"
          onClick={handleNext}
          disabled={index === stories.length - 1}
        >
          <svg
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className="modal-svg"
          >
            <polyline
              fill="none"
              stroke="#FFF"
              strokeWidth="2"
              points="17 2 7 12 17 22"
              transform="matrix(-1 0 0 1 24 0)"
            />
          </svg>
        </button>
      </div>

      {/* Buttons Section */}
    </div>
  );
};

export default StoryModal;
