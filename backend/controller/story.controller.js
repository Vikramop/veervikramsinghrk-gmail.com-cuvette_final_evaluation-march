import Story from '../modals/story.modal.js';
import { User } from '../modals/user.modal.js';

export const getStories = async (req, res) => {
  const userId = req.userId;

  try {
    let allStories;

    if (userId) {
      // If the user is logged in, fetch the user's stories first, followed by others
      const userStories = await Story.find({ userId });
      const otherStories = await Story.find({ userId: { $ne: userId } });
      allStories = [...userStories, ...otherStories];
    } else {
      // If the user is not logged in, fetch all stories
      allStories = await Story.find({});
    }

    res.status(200).json({
      success: true,
      message: 'Stories fetched successfully',
      data: allStories,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const createStories = async (req, res) => {
  const { stories } = req.body;

  if (!stories || stories.length < 3 || stories.length > 6) {
    return res.status(400).json({
      success: false,
      message: 'You must provide between 3 and 6 stories.',
    });
  }

  // Determine the category from the last story
  const lastCategory = stories[stories.length - 1].category;

  // Prepare an array to store new stories
  const newStories = stories.map((story) => ({
    userId: req.userId,
    heading: story.heading,
    description: story.description,
    image: story.image,
    category: lastCategory, // Set category to the last story's category
  }));

  try {
    // Save all new stories at once
    const savedStories = await Story.insertMany(newStories);
    res.status(201).json({
      success: true,
      message: 'Stories created successfully',
      data: savedStories,
    });
  } catch (error) {
    console.error('Error in Create Stories:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const deleteStory = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const story = await Story.findById(id);

    if (!story) {
      return res
        .status(404)
        .json({ success: false, message: 'Story not found' });
    }

    if (story.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this story',
      });
    }

    await story.deleteOne();
    return res
      .status(200)
      .json({ success: true, message: 'Story deleted successfully' });
  } catch (error) {
    console.error('Error deleting story:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updateStory = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const story = await Story.findById(id);

    if (!story) {
      return res
        .status(404)
        .json({ success: false, message: 'Story not found' });
    }

    if (story.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this story',
      });
    }

    const { heading, description, image, category } = req.body;

    if (heading) story.heading = heading;
    if (description) story.description = description;
    if (image) story.image = image;
    if (category) story.category = category;

    await story.save();

    return res.status(200).json({
      success: true,
      message: 'Story updated successfully',
      data: story,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const filterStoriesByCategory = async (req, res) => {
  const { category } = req.query;
  const userId = req.userId;

  try {
    if (
      !category ||
      !['gaming', 'news', 'sports', 'food', 'india', 'world'].includes(category)
    ) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid or missing category' });
    }

    let userStories = [];
    if (userId) {
      // Fetch all stories from the logged-in user, regardless of the category
      userStories = await Story.find({ userId });
    }

    // Fetch stories in the specified category
    const filteredStories = await Story.find({
      category,
      userId: { $ne: userId }, // Exclude the logged-in user's stories from this query
    });

    // Fetch remaining stories that are not from the logged-in user and not in the filtered category
    const remainingStories = await Story.find({
      category: { $ne: category }, // Exclude the filtered category
      userId: { $ne: userId }, // Exclude the logged-in user's stories
    });

    // Combine the stories in the desired order: user stories -> filtered stories -> remaining stories
    const allStories = [
      ...userStories,
      ...filteredStories,
      ...remainingStories,
    ];

    res.status(200).json({
      success: true,
      message: 'Stories fetched successfully',
      data: allStories,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const bookmarkStory = async (req, res) => {
  const { storyId } = req.body;

  try {
    const user = await User.findById(req.userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });

    // Check if the story is already bookmarked
    if (user.bookmarkedStories.includes(storyId)) {
      return res
        .status(400)
        .json({ success: false, message: 'Story already bookmarked' });
    }

    user.bookmarkedStories.push(storyId);
    await user.save();

    res
      .status(200)
      .json({ success: true, message: 'Story bookmarked successfully' });
  } catch (error) {
    console.error('Error bookmarking story:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getBookmarkedStories = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('bookmarkedStories');
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });

    res.status(200).json({ success: true, data: user.bookmarkedStories });
  } catch (error) {
    console.error('Error fetching bookmarked stories:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const removeBookmark = async (req, res) => {
  const { storyId } = req.params;

  try {
    const user = await User.findById(req.userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });

    user.bookmarkedStories = user.bookmarkedStories.filter(
      (id) => id.toString() !== storyId
    );
    await user.save();

    res
      .status(200)
      .json({ success: true, message: 'Story removed from bookmarks' });
  } catch (error) {
    console.error('Error removing bookmark:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const likeStory = async (req, res) => {
  const { storyId } = req.body;
  const userId = req.userId;

  if (!storyId) {
    return res
      .status(400)
      .json({ success: false, message: 'Story ID is required' });
  }

  try {
    const story = await Story.findById(storyId);

    if (!story) {
      return res
        .status(404)
        .json({ success: false, message: 'Story not found' });
    }

    // Check if the user has already liked the story
    if (story.likedBy.includes(userId)) {
      // User has already liked the story, so unlike it
      story.likes -= 1;
      story.likedBy = story.likedBy.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      // User has not liked the story yet, so like it
      story.likes += 1;
      story.likedBy.push(userId);
    }

    // Save the updated story
    await story.save();

    res.status(200).json({
      success: true,
      message: `Story ${
        story.likedBy.includes(userId) ? 'liked' : 'unliked'
      } successfully`,
      data: story,
    });
  } catch (error) {
    console.error('Error liking story:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const unlikeStory = async (req, res) => {
  const { storyId } = req.params;

  try {
    const user = await User.findById(req.userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });

    const story = await Story.findById(storyId);
    if (!story)
      return res
        .status(404)
        .json({ success: false, message: 'Story not found' });

    if (user.likedStories.includes(storyId)) {
      user.likedStories = user.likedStories.filter(
        (id) => id.toString() !== storyId
      );
      story.likes -= 1; // Decrement the like count
      await Promise.all([user.save(), story.save()]); // Save user and story changes
      res.status(200).json({ success: true, message: 'Story unliked' });
    } else {
      res.status(400).json({ success: false, message: 'Story not liked yet' });
    }
  } catch (error) {
    console.error('Error unliking story:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const shareStory = async (req, res) => {
  const { storyId } = req.body;

  try {
    const story = await Story.findById(storyId);
    if (!story) {
      return res
        .status(404)
        .json({ success: false, message: 'Story not found' });
    }

    // Generate a share link
    const shareLink = `${process.env.APP_URL}/stories/${storyId}`;

    res.status(200).json({
      success: true,
      message: 'Story shared successfully',
      shareLink,
    });
  } catch (error) {
    console.error('Error sharing story:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// include the stories of logged in user in below filters too

// export const filterStoriesByCategory = async (req, res) => {
//   const { category } = req.query;
//   const userId = req.userId;

//   try {
//     if (!category || !['gaming', 'news', 'sports', 'food', 'india', 'world'].includes(category)) {
//       return res.status(400).json({ success: false, message: 'Invalid or missing category' });
//     }

//     let userStories = [];
//     let filteredStories = [];

//     if (userId) {
//       userStories = await Story.find({ userId, category });
//       filteredStories = await Story.find({
//         category,
//         userId: { $ne: userId },
//       });
//     } else {
//       filteredStories = await Story.find({ category });
//     }

//     const remainingStories = await Story.find({
//       category: { $ne: category },
//       ...(userId && { userId: { $ne: userId } }),
//     });

//     const allStories = [...userStories, ...filteredStories, ...remainingStories];

//     res.status(200).json({
//       success: true,
//       message: 'Stories fetched successfully',
//       data: allStories,
//     });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: 'Server Error' });
//   }
// };
