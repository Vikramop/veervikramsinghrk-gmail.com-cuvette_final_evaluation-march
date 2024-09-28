import { create } from 'zustand';

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
}));
