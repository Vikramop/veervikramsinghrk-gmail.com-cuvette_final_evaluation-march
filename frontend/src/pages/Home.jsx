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
  const [filterCategory, setFilterCategory] = useState(null);
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
    setFilterCategory(filterCategory);
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
  // download

  const downloadStory = async (story) => {
    console.log('Story object:', story); // Log the story object to check its properties
    const { heading, description, image } = story; // Use 'image' instead of 'bgImage'

    // Check if image is defined
    if (!image) {
      alert('Background image URL is undefined. Please check your data.');
      return;
    }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    const img = new Image();
    img.crossOrigin = 'Anonymous'; // Ensure CORS is enabled for this image
    img.src = image; // Use the correct image property

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      context.drawImage(img, 0, 0);

      context.fillStyle = 'white';
      context.font = '50px Arial';
      context.fillText(heading, 50, 50);
      context.font = '30px Arial';
      context.fillText(description, 50, 100);

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `${heading}.png`;
      link.click();
    };

    img.onerror = (error) => {
      console.error('Error loading image:', error);
      toast.error('Failed to download');
    };
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
                <div>
                  <button onClick={handleUserShowMore} className="more-btn">
                    {userShowAll ? 'Show Less' : 'Show More'}
                  </button>
                </div>
              )}
            </>
          ) : null}

          <div className="filtered-stories-sec">
            {filterCategory && (
              <div
                onClick={() => {
                  openStoryModal(filterCategory);
                }}
              >
                <h4 className="category-heading">
                  Stories About {filterCategory}
                </h4>
                <div
                  className={
                    categoryStories[filterCategory]?.length > 0
                      ? 'story-feed'
                      : 'no-feed'
                  }
                >
                  {categoryStories[filterCategory]?.length > 0 ? (
                    categoryStories[filterCategory].map((story) => {
                      const isBookmarked = bookmarks.includes(story._id);

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
                            onClick={(event) => {
                              event.stopPropagation(); // Prevent the modal from opening
                              downloadStory(story);
                            }}
                            className="download-btn"
                          >
                            <svg
                              width="40px"
                              height="40px"
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
                                  d="M12.5535 16.5061C12.4114 16.6615 12.2106 16.75 12 16.75C11.7894 16.75 11.5886 16.6615 11.4465 16.5061L7.44648 12.1311C7.16698 11.8254 7.18822 11.351 7.49392 11.0715C7.79963 10.792 8.27402 10.8132 8.55352 11.1189L11.25 14.0682V3C11.25 2.58579 11.5858 2.25 12 2.25C12.4142 2.25 12.75 2.58579 12.75 3V14.0682L15.4465 11.1189C15.726 10.8132 16.2004 10.792 16.5061 11.0715C16.8118 11.351 16.833 11.8254 16.5535 12.1311L12.5535 16.5061Z"
                                  fill="#e0e8ff"
                                ></path>{' '}
                                <path
                                  d="M3.75 15C3.75 14.5858 3.41422 14.25 3 14.25C2.58579 14.25 2.25 14.5858 2.25 15V15.0549C2.24998 16.4225 2.24996 17.5248 2.36652 18.3918C2.48754 19.2919 2.74643 20.0497 3.34835 20.6516C3.95027 21.2536 4.70814 21.5125 5.60825 21.6335C6.47522 21.75 7.57754 21.75 8.94513 21.75H15.0549C16.4225 21.75 17.5248 21.75 18.3918 21.6335C19.2919 21.5125 20.0497 21.2536 20.6517 20.6516C21.2536 20.0497 21.5125 19.2919 21.6335 18.3918C21.75 17.5248 21.75 16.4225 21.75 15.0549V15C21.75 14.5858 21.4142 14.25 21 14.25C20.5858 14.25 20.25 14.5858 20.25 15C20.25 16.4354 20.2484 17.4365 20.1469 18.1919C20.0482 18.9257 19.8678 19.3142 19.591 19.591C19.3142 19.8678 18.9257 20.0482 18.1919 20.1469C17.4365 20.2484 16.4354 20.25 15 20.25H9C7.56459 20.25 6.56347 20.2484 5.80812 20.1469C5.07435 20.0482 4.68577 19.8678 4.40901 19.591C4.13225 19.3142 3.9518 18.9257 3.85315 18.1919C3.75159 17.4365 3.75 16.4354 3.75 15Z"
                                  fill="#e0e8ff"
                                ></path>{' '}
                              </g>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleBookmarkClick(story._id)}
                            className={`bookmarks ${
                              isBookmarked ? 'bookmarked' : ''
                            }`}
                          >
                            {/* Bookmark Icon */}
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <p style={{ textAlign: 'center' }}>No stories to show</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Stories by Categories */}
          {predefinedCategories
            .filter((category) => category !== filterCategory) // Exclude the selected filter category
            .map((category) => {
              const stories = categoryStories[category] || [];

              return (
                <div key={category} className="category-container">
                  <h4 className="category-heading">
                    Top Stories About {category}
                  </h4>
                  <div
                    className={stories.length > 0 ? 'story-feed' : 'no-feed'}
                  >
                    {stories.length > 0 ? (
                      stories
                        .slice(
                          0,
                          categoryShowAll[category] ? stories.length : 4
                        )
                        .map((story) => {
                          const isLiked = likedStories.some(
                            (likedStory) => likedStory._id === story._id
                          );

                          // Find the liked story object
                          const likedStory = likedStories.find(
                            (likedStory) => likedStory._id === story._id
                          );
                          const likeCount = likedStory
                            ? likedStory.likeCount
                            : 0; // Use the likeCount from likedStories

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
                                  <p className="story-heading">
                                    {story.heading}
                                  </p>
                                  <p className="story-description">
                                    {story.description}
                                  </p>
                                </div>
                              )}
                              {/*  button sec  */}
                              <button
                                onClick={(event) => {
                                  event.stopPropagation(); // Prevent the modal from opening
                                  downloadStory(story);
                                }}
                                className="download-btn"
                              >
                                <svg
                                  width="40px"
                                  height="40px"
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
                                      d="M12.5535 16.5061C12.4114 16.6615 12.2106 16.75 12 16.75C11.7894 16.75 11.5886 16.6615 11.4465 16.5061L7.44648 12.1311C7.16698 11.8254 7.18822 11.351 7.49392 11.0715C7.79963 10.792 8.27402 10.8132 8.55352 11.1189L11.25 14.0682V3C11.25 2.58579 11.5858 2.25 12 2.25C12.4142 2.25 12.75 2.58579 12.75 3V14.0682L15.4465 11.1189C15.726 10.8132 16.2004 10.792 16.5061 11.0715C16.8118 11.351 16.833 11.8254 16.5535 12.1311L12.5535 16.5061Z"
                                      fill="#e0e8ff"
                                    ></path>{' '}
                                    <path
                                      d="M3.75 15C3.75 14.5858 3.41422 14.25 3 14.25C2.58579 14.25 2.25 14.5858 2.25 15V15.0549C2.24998 16.4225 2.24996 17.5248 2.36652 18.3918C2.48754 19.2919 2.74643 20.0497 3.34835 20.6516C3.95027 21.2536 4.70814 21.5125 5.60825 21.6335C6.47522 21.75 7.57754 21.75 8.94513 21.75H15.0549C16.4225 21.75 17.5248 21.75 18.3918 21.6335C19.2919 21.5125 20.0497 21.2536 20.6517 20.6516C21.2536 20.0497 21.5125 19.2919 21.6335 18.3918C21.75 17.5248 21.75 16.4225 21.75 15.0549V15C21.75 14.5858 21.4142 14.25 21 14.25C20.5858 14.25 20.25 14.5858 20.25 15C20.25 16.4354 20.2484 17.4365 20.1469 18.1919C20.0482 18.9257 19.8678 19.3142 19.591 19.591C19.3142 19.8678 18.9257 20.0482 18.1919 20.1469C17.4365 20.2484 16.4354 20.25 15 20.25H9C7.56459 20.25 6.56347 20.2484 5.80812 20.1469C5.07435 20.0482 4.68577 19.8678 4.40901 19.591C4.13225 19.3142 3.9518 18.9257 3.85315 18.1919C3.75159 17.4365 3.75 16.4354 3.75 15Z"
                                      fill="#e0e8ff"
                                    ></path>{' '}
                                  </g>
                                </svg>
                              </button>
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
                    <div>
                      <button
                        onClick={() => handleCategoryShowMore(category)}
                        className="more-btn"
                      >
                        {categoryShowAll[category] ? 'Show Less' : 'Show More'}
                      </button>
                    </div>
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
