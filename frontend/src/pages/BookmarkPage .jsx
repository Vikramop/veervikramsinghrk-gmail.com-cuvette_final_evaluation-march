// BookmarkPage.js
import React, { useEffect } from 'react';
import { useStoryStore } from '../store/story'; // Adjust the import path
import './Home.css'; // Make sure to install react-toastify

const BookmarkPage = () => {
  const { bookmarkedStories, getBookmarkedStories } = useStoryStore();
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;

  useEffect(() => {
    if (isLoggedIn) {
      getBookmarkedStories(); // Fetch bookmarked stories when the page loads
    }
  }, [isLoggedIn, getBookmarkedStories]);
  const isVideo = (url) => {
    const videoExtensions = /\.(mp4|webm|ogg)$/i;
    const youtubePattern =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/(shorts\/|watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})$/;

    return videoExtensions.test(url) || youtubePattern.test(url);
  };

  const getYouTubeId = (url) => {
    const match = url.match(
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:shorts\/|watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? match[1] : null; // Return the video ID if found
  };

  return (
    <div className="bookmark-container">
      <h2>Your Bookmarked Stories</h2>

      <div className="bookmarkz">
        {bookmarkedStories.length > 0 ? (
          bookmarkedStories.map((story) => {
            return (
              <div key={story._id} className="story-card">
                {isVideo(story.image) ? (
                  story.image.includes('youtube.com') ||
                  story.image.includes('youtu.be') ? (
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${getYouTubeId(
                        story.image
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
                      src={story.image}
                      type="video/mp4"
                    />
                  )
                ) : (
                  <div
                    className="background-image"
                    style={{ backgroundImage: `url(${story.image})` }}
                  >
                    <p className="story-heading">{story.heading}</p>
                    <p className="story-description">{story.description}</p>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p>No bookmarked stories found.</p>
        )}
      </div>
    </div>
  );
};

export default BookmarkPage;
