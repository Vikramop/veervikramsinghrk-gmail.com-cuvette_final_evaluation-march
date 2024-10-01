import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';

export const useStoryStore = create((set, get) => ({
  stories: [],
  bookmarks: [],
  userStories: [],
  bookmarkedStories: [],
  setStories: (stories) => set({ stories }),

  createStory: async (formData) => {
    for (const story of formData) {
      if (
        !story.heading ||
        !story.description ||
        !story.image ||
        !story.category
      ) {
        return {
          success: false,
          message: 'Please fill in all fields for each slide.',
        };
      }
    }
    console.log('Form Data:', JSON.stringify(formData, null, 2));
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, message: 'Authorization token is missing.' };
    }

    const res = await fetch('api/story', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });
    if (!res.ok) {
      const errorData = await res.json();
      return {
        success: false,
        message: errorData.message || 'Failed to create story.',
      };
    }

    const data = await res.json();
    set((state) => ({ stories: [...state.stories, data.data] }));
    return { success: true, message: 'Story created sucessfully' };
  },

  fetchStory: async () => {
    const token = localStorage.getItem('token');
    console.log('token before fetch', token);

    try {
      const res = await fetch('/api/story', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '', // Set Authorization only if token exists
        },
      });

      // Check if the response is okay
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch stories');
      }

      const data = await res.json();
      console.log('API Response:', data);

      // If there is no token, fetch all stories
      if (!token) {
        // Assume data.data holds all stories when no token is present
        set({ stories: data.data, userStories: [] });
        console.log('Fetched all stories:', data.data);
        return;
      }

      // If token is present, filter user stories
      if (data.data) {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken._id; // Adjust according to your token's structure

        const userStories = data.data.filter(
          (story) => story.userId === userId
        );
        set({ stories: data.data, userStories }); // Store both all stories and user stories
        console.log('Fetched Stories:', data.data);
        console.log('User Stories:', userStories);
      } else {
        throw new Error('Invalid data structure');
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
    }
  },

  editStory: async (storyId, updatedData) => {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('No token found');
      return { success: false, message: 'No token found' };
    }

    try {
      const res = await fetch(`/api/story/${storyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      // Check if the response is okay
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to edit story');
      }

      const data = await res.json();

      const decodedToken = jwtDecode(token);
      const userIdFromToken = decodedToken._id;

      // Ensure data.data.userId exists before accessing it
      if (!data.data.userId) {
        throw new Error('User ID is missing from the edited story response.');
      }

      // Use toString to ensure type consistency
      if (data.data.userId.toString() !== userIdFromToken) {
        throw new Error('You are not allowed to edit this story');
      }

      // Update the local story state with the edited story
      set((state) => ({
        stories: state.stories.map((story) =>
          story._id === data.data._id ? data.data : story
        ),
        userStories: state.userStories.map((story) =>
          story._id === data.data._id ? data.data : story
        ),
      }));

      console.log('Edited Story:', data);
      return { success: true, message: 'Story updated successfully' };
    } catch (error) {
      console.error('Error editing story:', error);
      return { success: false, message: error.message || 'An error occurred' };
    }
  },

  fetchFilteredStories: async (category) => {
    console.log('Fetching stories for category:', category);
    const token = localStorage.getItem('token');

    try {
      // Check if the provided category is valid
      const validCategories = [
        'Gaming',
        'Animals',
        'Sports',
        'Food',
        'India',
        'People',
      ];

      if (!validCategories.includes(category)) {
        throw new Error('Invalid or missing category');
      }

      let userStories = [];
      let filteredStories = [];

      // Fetch filtered stories based on the category
      const res = await fetch(`/api/story/filter?category=${category}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }), // Add token if the user is logged in
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message || 'Failed to fetch filtered stories'
        );
      }

      const data = await res.json();

      // Handle the case when the user is logged in
      if (token) {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken._id; // Get the user ID from the token

        // Separate the user's own stories
        userStories = data.data.filter((story) => story.userId === userId);

        // Filter out the logged-in user's stories from the filtered ones
        filteredStories = data.data.filter((story) => story.userId !== userId);

        // Combine user stories and filtered stories: user stories first
        const combinedStories = [...userStories, ...filteredStories];

        // Update the store with the combined stories and user-specific stories
        set({
          stories: combinedStories,
          userStories,
        });

        console.log('Fetched Stories with User First:', combinedStories);
        console.log('User Stories:', userStories);
      } else {
        // If the user is not logged in, only show the filtered stories
        filteredStories = data.data;

        // Update the store with only filtered stories
        set({
          stories: filteredStories,
          userStories: [], // No user stories since the user is not logged in
        });

        console.log('Fetched Filtered Stories:', filteredStories);
      }

      return { success: true };
    } catch (error) {
      console.error('Error fetching stories:', error);
      return { success: false, message: error.message || 'An error occurred' };
    }
  },

  clearStories: () => {
    set({ stories: [] });
  },

  toggleBookmark: async (storyId) => {
    const token = localStorage.getItem('token');

    // Check if the user is logged in
    if (!token) {
      toast.error('Please log in to bookmark stories.');
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      const stories = get().stories;
      console.log('Current Stories:', stories); // Log current stories

      const story = stories.find((s) => s._id === storyId); // Find the story by ID
      console.log('Selected Story:', story);
      console.log('Story ID to toggle:', storyId);

      // Check if the story was found
      if (!story) {
        toast.error('Story not found.');
        return;
      }

      const isBookmarked = story.savedBy.includes(decodedToken._id); // Check if already bookmarked

      // Determine the URL and method based on whether it's a bookmark or unbookmark
      const url = isBookmarked
        ? `/api/story/bookmark/${storyId}`
        : '/api/story/bookmark';
      const method = isBookmarked ? 'DELETE' : 'POST';
      const body = isBookmarked ? null : JSON.stringify({ storyId }); // Send storyId only when bookmarking

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body,
      });

      const data = await res.json();

      // Check for server error
      if (!res.ok) {
        throw new Error(data.message || 'Failed to toggle bookmark');
      }

      // Update the state based on the result
      set((prev) => {
        const updatedStories = prev.stories.map((s) =>
          s._id === storyId
            ? {
                ...s,
                savedBy: isBookmarked
                  ? s.savedBy.filter((id) => id !== decodedToken._id) // Remove bookmark
                  : [...s.savedBy, decodedToken._id], // Add bookmark
              }
            : s
        );

        const updatedBookmarks = isBookmarked
          ? prev.bookmarks.filter((id) => id !== decodedToken._id) // Update bookmarks
          : [...prev.bookmarks, decodedToken._id];

        return {
          stories: updatedStories,
          bookmarks: updatedBookmarks, // Update bookmarks state directly
        };
      });

      toast.success(
        isBookmarked
          ? 'Bookmark removed successfully'
          : 'Story bookmarked successfully'
      );
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error(error.message || 'An error occurred while toggling bookmark');
    }
  },

  clearBookmarks: () => set({ bookmarks: [] }),

  getBookmarkedStories: async () => {
    const token = localStorage.getItem('token');

    // Check if the user is logged in
    if (!token) {
      toast.error('Please log in to view your bookmarked stories.');
      return;
    }

    try {
      const res = await fetch(`/api/story/bookmark/`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      // Check for server error
      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch bookmarked stories');
      }

      // Update the state with the fetched bookmarked stories
      set((prev) => ({
        ...prev,
        bookmarkedStories: data.data || [], // Assuming data contains an array of bookmarked stories
      }));

      // toast.success('Bookmarked stories fetched successfully');
    } catch (error) {
      console.error('Error fetching bookmarked stories:', error);
      toast.error(
        error.message || 'An error occurred while fetching bookmarked stories'
      );
    }
  },

  toggleLike: async (storyId) => {
    const token = localStorage.getItem('token');

    if (!token) {
      toast.error('Please log in to like stories.');
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      const stories = get().stories;

      const story = stories.find((s) => s._id === storyId);
      if (!story) {
        toast.error('Story not found.');
        return;
      }

      // Check if likedBy is defined and determine if the story is liked
      const isLiked = story.likedBy && story.likedBy.includes(decodedToken._id);

      const url = `/api/story/like/${storyId}`; // Use storyId in URL for DELETE
      const method = isLiked ? 'DELETE' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: method === 'POST' ? JSON.stringify({ storyId }) : null,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to toggle like');
      }

      set((prev) => ({
        stories: prev.stories.map((s) =>
          s._id === storyId
            ? {
                ...s,
                likedBy: isLiked
                  ? s.likedBy.filter((id) => id !== decodedToken._id)
                  : [...s.likedBy, decodedToken._id],
                likes: isLiked ? s.likes - 1 : s.likes + 1,
              }
            : s
        ),
      }));

      toast.success(isLiked ? 'Like removed' : 'Story liked');
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error(error.message || 'An error occurred while liking the story');
    }
  },

  getLikedStories: async () => {
    const token = localStorage.getItem('token');

    try {
      if (!token) {
        // Fetch all stories and their like counts (publicly accessible, no login required)
        const res = await fetch('/api/story/like', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Failed to fetch like counts');
        }

        // Assuming the response contains all stories and their like counts
        const storiesWithLikeCounts = data.data.map((story) => ({
          _id: story._id,
          likeCount: story.likes || 0, // Extract like counts, defaulting to 0 if not available
        }));

        console.log(
          'Like counts for all stories (logged out)',
          storiesWithLikeCounts
        );

        return {
          likedStories: [], // No liked stories when logged out
          likeCounts: storiesWithLikeCounts, // All stories' like counts
        };
      }

      // Logged-in user: Fetch liked stories and their like counts
      const res = await fetch('/api/story/like', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch liked stories');
      }

      const likedStories = data.data; // Assuming the API response has a 'data' property with liked stories
      const likeCounts = likedStories.map((story) => story.likes || 0); // Extract like counts, defaulting to 0 if not available

      console.log('Like counts for liked stories (logged in)', likeCounts);

      // Update the store with liked stories
      set((prev) => ({
        stories: prev.stories.map((s) => ({
          ...s,
          isLiked: likedStories.some((likedStory) => likedStory._id === s._id), // Check if the story is liked
        })),
      }));

      // toast.success('Liked stories fetched successfully');

      return {
        likedStories, // Liked stories for the logged-in user
        likeCounts, // Like counts for those stories
      };
    } catch (error) {
      console.error('Error fetching liked stories:', error);
      toast.error(
        error.message || 'An error occurred while fetching liked stories'
      );
      return { likedStories: [], likeCounts: [] }; // Return empty arrays on error
    }
  },

  shareStory: async (storyId) => {
    // console.log('storyIdssss', storyId);

    try {
      const res = await fetch(`/api/story/share/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ storyId }),
      });

      if (!res.ok) {
        throw new Error('Failed to share story');
      }

      const data = await res.json();
      return data; // Return the response data for further handling
    } catch (error) {
      console.error('Error sharing story:', error);
      throw new Error('An error occurred while sharing the story.'); // Throw an error for handling in UI
    }
  },
}));
