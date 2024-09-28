import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

export const useStoryStore = create((set) => ({
  stories: [],
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

    if (!token) {
      console.error('No token found');
      return;
    }

    try {
      const res = await fetch('api/story', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      // console.log('Response Status:', res.status);
      // console.log('Response Headers:', res.headers);

      // Check if the response is okay
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch stories');
      }

      const data = await res.json();
      console.log('API Response:', data);

      // Check if the expected data structure is present
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
}));
