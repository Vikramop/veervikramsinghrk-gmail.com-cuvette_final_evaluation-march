import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import './Home.css';
import { useStoryStore } from '../store/story';
import { jwtDecode } from 'jwt-decode';
import EditStoryModal from '../components/EditStoryModal .jsx';
import Filters from '../components/Filters.jsx';

const Home = () => {
  const { fetchStory, stories, fetchFilteredStories } = useStoryStore();
  const [userShowAll, setUserShowAll] = useState(false);
  const [categoryShowAll, setCategoryShowAll] = useState({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryStories, setCategoryStories] = useState({
    userStories: [],
    Foods: [],
    Sports: [],
    Gaming: [],
    India: [],
    Animals: [],
    People: [],
  });

  const predefinedCategories = [
    'India',
    'Foods',
    'Sports',
    'Gaming',
    'People',
    'Animals',
  ];
  const handleCategorySelect = (category2) => {
    setSelectedCategory(category2);
  };
  const openEditModal = (story) => {
    setSelectedStory(story);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedStory(null);
  };

  useEffect(() => {
    fetchStory();
  }, [fetchStory]);

  useEffect(() => {
    if (stories.length) {
      const token = localStorage.getItem('token');
      if (token) {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken._id;

        const userStories = stories.filter((story) => story.userId === userId);
        const categorizedStories = {};

        stories.forEach((story) => {
          const category = story.category || 'Uncategorized';
          if (!categorizedStories[category]) {
            categorizedStories[category] = [];
          }
          categorizedStories[category].push(story);
        });

        setCategoryStories({ userStories, ...categorizedStories });
      }
    }
  }, [stories]);

  const handleUserShowMore = () => {
    setUserShowAll(!userShowAll);
  };

  const handleCategoryShowMore = (category) => {
    setCategoryShowAll((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

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
  const token = localStorage.getItem('token');

  return (
    <div>
      <Header />

      <div className="h-container">
        <Filters fetchFilteredStories={fetchFilteredStories} />

        <div className="filter-sec">
          {/* User's Stories */}
          <h4 className="category-heading">Your Stories</h4>
          <div
            className={
              categoryStories.userStories.length > 0 ? 'story-feed' : 'nofeed'
            }
          >
            {categoryStories.userStories.length > 0 ? (
              categoryStories.userStories
                .slice(0, userShowAll ? categoryStories.userStories.length : 4)
                .map((story) => (
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
                    <button
                      className="edit-btn"
                      onClick={() => openEditModal(story)}
                    >
                      Edit Story
                    </button>
                  </div>
                ))
            ) : (
              <p>No stories available</p>
            )}
          </div>
          {categoryStories.userStories.length > 4 && (
            <button onClick={handleUserShowMore} className="more-btn">
              {userShowAll ? 'Show Less' : 'Show More'}
            </button>
          )}

          {/* Stories by Categories */}
          {predefinedCategories.map((category) => {
            const stories = categoryStories[category] || [];
            return (
              <div key={category} className="category-container">
                <h4 className="category-heading">
                  Top Stories About {category}
                </h4>
                <div className={stories.length > 0 ? 'story-feed' : 'no-feed'}>
                  {stories.length > 0 ? (
                    stories
                      .slice(0, categoryShowAll[category] ? stories.length : 4)
                      .map((story) => (
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
                              <p className="story-description">
                                {story.description}
                              </p>
                            </div>
                          )}
                        </div>
                      ))
                  ) : (
                    <p>No stories available</p>
                  )}
                </div>
                {stories.length > 4 && (
                  <button
                    onClick={() => handleCategoryShowMore(category)}
                    className="more-btn"
                  >
                    {categoryShowAll[category] ? 'Show Less' : 'Show More'}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Edit Story Modal */}
        {isEditModalOpen && (
          <EditStoryModal onClose={closeEditModal} storyData={selectedStory} />
        )}
      </div>
    </div>
  );
};

export default Home;
