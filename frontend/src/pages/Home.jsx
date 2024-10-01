import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import './Home.css';
import share from '../assets/share.png';
import { useStoryStore } from '../store/story';
import { jwtDecode } from 'jwt-decode';
import EditStoryModal from '../components/EditStoryModal .jsx';
import Filters from '../components/Filters';
import toast from 'react-hot-toast';
import StoryModal from '../components/StoryModal .jsx';

const Home = () => {
  const token = localStorage.getItem('token');

  const {
    fetchStory,
    stories,
    toggleBookmark,
    bookmarks,
    toggleLike,
    shareStory,
    getLikedStories,
  } = useStoryStore();
  const [likedStories, setLikedStories] = useState([]);
  const [likeCounts, setLikeCounts] = useState({});
  const [decodedToken, setDecodedToken] = useState(null);
  const [userShowAll, setUserShowAll] = useState(false);
  const [categoryShowAll, setCategoryShowAll] = useState({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentStoryId, setCurrentStoryId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const openStoryModal = (category, storyId) => {
    setSelectedCategory(category);
    setCurrentStoryId(storyId);
    setShowModal(true);
  };

  const closeStoryModal = () => {
    setShowModal(false);
  };
  const [categoryStories, setCategoryStories] = useState({
    userStories: [],
    Food: [],
    Sports: [],
    Gaming: [],
    India: [],
    Animals: [],
    People: [],
  });

  // const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');
  useEffect(() => {
    if (token) {
      const decoded = jwtDecode(token);
      setDecodedToken(decoded);
    }
  }, [token]);

  const predefinedCategories = [
    'Food',
    'India',
    'Sports',
    'Gaming',
    'People',
    'Animals',
  ];

  const handleCategorySelect = (filterCategory) => {
    setSelectedCategory(filterCategory);
  };

  const openEditModal = (story) => {
    setSelectedStory(story);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedStory(null);
  };

  const handleBookmarkClick = (storyId) => {
    console.log('Stories:', stories);
    console.log('Attempting to bookmark story with ID:', storyId);

    toggleBookmark(storyId).then(() => {
      console.log('Updated Bookmarks:', bookmarks);

      if (isLoggedIn) {
        const isBookmarked = bookmarks.includes(storyId);
        console.log('isBookmarked', isBookmarked);

        console.log(isBookmarked ? 'Bookmark removed' : 'Story bookmarked');
      } else {
        console.log('Please log in to bookmark this story.');
      }
    });
  };

  useEffect(() => {
    fetchStory();
  }, [fetchStory]);

  useEffect(() => {
    if (stories.length) {
      const token = localStorage.getItem('token');
      const categorizedStories = {};

      // Categorize all stories
      stories.forEach((story) => {
        const category = story.category || 'Uncategorized';
        if (!categorizedStories[category]) {
          categorizedStories[category] = [];
        }
        categorizedStories[category].push(story);
      });

      // If token exists, filter user stories
      if (token) {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken._id;

        const userStories = stories.filter((story) => story.userId === userId);

        // Set both user stories and categorized stories
        setCategoryStories({ userStories, ...categorizedStories });
      } else {
        // If no token, just set categorized stories with empty userStories
        setCategoryStories({ userStories: [], ...categorizedStories });
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

  const handleShareClick = async (storyId) => {
    try {
      // Call the store function to share the story
      const data = await shareStory(storyId);

      if (data.success) {
        // Use the Clipboard API to copy the link
        await navigator.clipboard.writeText(data.shareLink);

        // Optionally show a success message or use a toast
        toast.success('Link copied to clipboard!');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to share the story.');
      console.error('Error sharing story:', error);
    }
  };

  // ////////////////////////////////

  useEffect(() => {
    const fetchLikeCounts = async () => {
      try {
        const { likeCounts } = await getLikedStories(); // Fetch like counts from the backend
        console.log('Fetched like counts:', likeCounts); // Log the like counts for verification
        setLikeCounts(likeCounts); // Update the state with like counts
      } catch (error) {
        console.error('Error fetching like counts:', error); // Log any errors
      }
    };

    // Fetch story and like counts on component mount
    fetchStory(); // Fetch stories
    fetchLikeCounts(); // Fetch like counts regardless of user login
  }, [fetchStory]);

  useEffect(() => {
    const fetchDataFromBackend = async () => {
      try {
        // Fetch like counts for all users, regardless of login status
        const { likeCounts } = await getLikedStories();
        console.log('Fetched like counts for all stories:', likeCounts); // Log like counts

        setLikeCounts(likeCounts); // Set total like counts for each story

        // Fetch liked stories only if the user is logged in
        if (isLoggedIn) {
          const { likedStories } = await getLikedStories();
          console.log(
            'Fetched liked stories for logged-in user:',
            likedStories
          ); // Log liked stories
          const likedStoriesWithCounts = likedStories.map((story) => ({
            _id: story._id,
            likes: story.likes || 0, // Get the like count for each liked story
          }));
          console.log('Liked stories with counts:', likedStoriesWithCounts); // Log liked stories with their counts
          setLikedStories(likedStories); // Set liked stories for the logged-in user
        } else {
          setLikedStories([]); // Clear liked stories if not logged in
        }
      } catch (error) {
        console.error('Error fetching data from backend:', error);
        // Handle error (e.g., set error state, show a toast, etc.)
      }
    };

    fetchDataFromBackend();
  }, [isLoggedIn]);

  // useEffect(() => {
  //   const fetchLikedStoriesFromLocalStorage = () => {
  //     const storedLikes = localStorage.getItem('likedStories');
  //     const storedLikeCounts = localStorage.getItem('likeCounts');

  //     if (storedLikes) {
  //       setLikedStories(JSON.parse(storedLikes)); // Load liked stories from local storage
  //     }

  //     if (storedLikeCounts) {
  //       setLikeCounts(JSON.parse(storedLikeCounts)); // Load like counts from local storage
  //     }
  //   };

  //   fetchLikedStoriesFromLocalStorage();
  // }, []);

  const handleLikeClick = async (storyId) => {
    // Check if the user is logged in
    if (!isLoggedIn) {
      toast.error('Please log in to like stories.');
      return;
    }

    // Check if the story is currently liked by the user
    const isLiked = likedStories.some((story) => story._id === storyId);

    // Update liked stories and like counts based on current state
    setLikedStories((prevLikes) => {
      let newLikes;
      if (isLiked) {
        // If already liked, remove from liked stories
        newLikes = prevLikes.filter((story) => story._id !== storyId);
      } else {
        // If not liked, add to liked stories
        newLikes = [...prevLikes, { _id: storyId }];
      }
      // Persist liked stories to local storage
      localStorage.setItem('likedStories', JSON.stringify(newLikes));
      return newLikes;
    });

    setLikeCounts((prevCounts) => {
      const newCounts = { ...prevCounts };
      if (isLiked) {
        newCounts[storyId] = (newCounts[storyId] || 0) - 1;
        if (newCounts[storyId] <= 0) delete newCounts[storyId];
      } else {
        newCounts[storyId] = (newCounts[storyId] || 0) + 1;
      }
      console.log('Updated like counts:', newCounts); // Debugging line
      localStorage.setItem('likeCounts', JSON.stringify(newCounts));
      return newCounts;
    });

    // Call the toggleLike function (make sure it handles the backend update properly)
    await toggleLike(storyId, isLiked);
  };

  return (
    <div>
      <Header setLikedStories={setLikedStories} setLikeCounts={setLikeCounts} />
      <div className="h-container">
        <Filters onCategorySelect={handleCategorySelect} />

        <div className="filter-sec">
          {/* Conditionally show 'Your Stories' if token is present */}
          {token ? (
            <>
              <h4 className="category-heading">Your Stories</h4>
              <div
                className={
                  categoryStories.userStories.length > 0
                    ? 'story-feed'
                    : 'nofeed'
                }
              >
                {categoryStories.userStories.length > 0 ? (
                  categoryStories.userStories
                    .slice(
                      0,
                      userShowAll ? categoryStories.userStories.length : 4
                    )
                    .map((story) => {
                      const isBookmarked = bookmarks.includes(story._id);
                      // console.log('isBookmarked:', isBookmarked);
                      // console.log('story._id:', story._id);

                      // Check bookmark status for each story
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
                              <p className="story-description">
                                {story.description}
                              </p>
                            </div>
                          )}
                          <button
                            className="edit-btn"
                            onClick={() => openEditModal(story)}
                          >
                            Edit Story
                          </button>
                          <button
                            onClick={() => handleBookmarkClick(story._id)} // Call toggleBookmark with story ID
                            className={`bookmarks ${
                              isBookmarked ? 'bookmarked' : ''
                            }`}
                          >
                            <svg
                              // stroke="#FFFFF"
                              strokeWidth="2"
                              fill="#FFF"
                              height="30px"
                              width="30px"
                              version="1.1"
                              id="Layer_1"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 500 500"
                              className="svg"
                            >
                              <g>
                                <g>
                                  <path d="M70.715,0v512L256,326.715L441.285,512V0H70.715z M411.239,439.462L256,284.224L100.761,439.462V30.046h310.477V439.462z" />
                                </g>
                              </g>
                            </svg>
                          </button>
                        </div>
                      );
                    })
                ) : (
                  <p
                    style={{
                      textAlign: 'center',
                    }}
                  >
                    No stories available
                  </p>
                )}
              </div>
              {categoryStories.userStories.length > 4 && (
                <button onClick={handleUserShowMore} className="more-btn">
                  {userShowAll ? 'Show Less' : 'Show More'}
                </button>
              )}
            </>
          ) : null}

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
                      .map((story) => {
                        const isLiked = likedStories.some(
                          (likedStory) => likedStory._id === story._id
                        );

                        // Find the liked story object
                        const likedStory = likedStories.find(
                          (likedStory) => likedStory._id === story._id
                        );
                        const likeCount = likedStory ? likedStory.likeCount : 0; // Use the likeCount from likedStories

                        const isBookmarked = bookmarks.includes(story._id);

                        return (
                          <div
                            key={story._id}
                            className="story-card"
                            onClick={() => {
                              openStoryModal(category);
                            }}
                          >
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
                                style={{
                                  backgroundImage: `url(${story.image})`,
                                }}
                              >
                                <p className="story-heading">{story.heading}</p>
                                <p className="story-description">
                                  {story.description}
                                </p>
                              </div>
                            )}
                            {/*  button sec  */}
                            <button
                              onClick={(event) => {
                                event.stopPropagation(); // Prevent the modal from opening
                                handleBookmarkClick(story._id);
                              }}
                              className="bookmarks"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                strokeWidth="2"
                                stroke={
                                  isBookmarked && isLoggedIn
                                    ? '#0000FF'
                                    : '#000'
                                }
                                fill={
                                  isBookmarked && isLoggedIn
                                    ? '#0000FF'
                                    : '#FFF'
                                }
                                viewBox="0 0 30 30"
                                width="30px"
                                height="30px"
                                className="svg"
                              >
                                <path d="M23,27l-8-7l-8,7V5c0-1.105,0.895-2,2-2h12c1.105,0,2,0.895,2,2V27z" />
                              </svg>
                            </button>

                            <button
                              onClick={(event) => {
                                event.stopPropagation(); // Prevent the modal from opening
                                handleLikeClick(story._id); // Call toggleLike with story ID
                              }}
                              className={`like-btn ${isLiked ? 'liked' : ''}`} // Conditionally apply the 'liked' class
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
                                    fill:
                                      isLiked && isLoggedIn
                                        ? '#FF5023'
                                        : '#FFFFFF',
                                  }}
                                  d="M373.029,43.886c-49.137,0-92.317,25.503-117.029,63.993
                            c-24.712-38.489-67.891-63.993-117.029-63.993C62.22,43.886,0,106.105,0,182.857c0,90.699,67.291,141.41,134.583,194.073
                            C194.493,423.816,256,468.114,256,468.114s61.509-44.298,121.417-91.184C444.709,324.267,512,273.556,512,182.857
                            C512,106.105,449.78,43.886,373.029,43.886z"
                                />
                                <path
                                  style={{
                                    fill:
                                      isLiked && isLoggedIn
                                        ? '#D80027'
                                        : '#FFFFFF',
                                  }}
                                  d="M256,107.878c-24.712-38.489-67.891-63.993-117.029-63.993C62.22,43.886,0,106.105,0,182.857
                            c0,90.699,67.291,141.41,134.583,194.073C194.493,423.816,256,468.114,256,468.114S256,225.28,256,107.878z"
                                />
                              </svg>
                              <span
                                className="count"
                                style={{
                                  marginLeft: '8px',
                                  color: 'white',
                                }}
                              >
                                {likeCount}
                              </span>
                            </button>

                            <button className="share">
                              <img
                                src={share}
                                onClick={(event) => {
                                  event.stopPropagation(); // Prevent the modal from opening
                                  handleShareClick(story._id);
                                }}
                              />
                            </button>
                          </div>
                        );
                      })
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
      </div>

      {isEditModalOpen && (
        <EditStoryModal storyData={selectedStory} onClose={closeEditModal} />
      )}
      {showModal && selectedCategory && (
        <StoryModal
          stories={categoryStories[selectedCategory]}
          currentStoryId={currentStoryId}
          onClose={closeStoryModal}
          isVideo={isVideo}
          getYouTubeId={getYouTubeId}
          bookmarks={bookmarks}
          isLoggedIn={isLoggedIn}
          likedStories={likedStories}
          handleShareClick={handleShareClick}
          handleBookmarkClick={handleBookmarkClick}
          handleLikeClick={handleLikeClick}
        />
      )}
    </div>
  );
};

export default Home;
