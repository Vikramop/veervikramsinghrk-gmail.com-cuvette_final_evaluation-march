import React, { useEffect, useState } from 'react';
import share from '../assets/share.png';

// Reusable Story Modal
const StoryModal = ({
  stories,
  currentStoryId,
  onClose,
  isVideo,
  getYouTubeId,
}) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Find the index of the current story based on its ID
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
    const segmentWidth = totalStories === 0 ? '0px' : `${90 / totalStories}% `;
    return (
      <div className="progress-bar">
        {stories.map((_, i) => (
          <p
            key={i}
            className={`line ${i <= index ? 'active' : ''}`}
            style={{
              display: 'inline-block',
              width: segmentWidth,
              height: '2px',
              color: i <= index ? ' #D9D9D980' : '#ccc',
              marginRight: '2px',
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="story-card-over-container ">
      <div className="story-card-over ">
        {isVideo(stories[index].image) ? (
          stories[index].image.includes('youtube.com') ||
          stories[index].image.includes('youtu.be') ? (
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${getYouTubeId(
                stories[index].image
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
              src={stories[index].image}
              type="video/mp4"
            />
          )
        ) : (
          <div
            className="background-image"
            style={{
              backgroundImage: `url(${stories[index].image})`,
            }}
          >
            <div className="modal-header">
              <ProgressBar />
              <div className="modal-CS">
                <button onClick={onClose} className="modal-close-btn">
                  X
                </button>
              </div>
            </div>
            <div>
              <p className="story-heading">{stories[index].heading}</p>
              <p className="story-description">{stories[index].description}</p>
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
    </div>
  );
};

export default StoryModal;
