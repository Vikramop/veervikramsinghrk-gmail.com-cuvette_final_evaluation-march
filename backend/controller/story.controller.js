import Story from '../modals/story.modal.js';

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
  const { stories } = req.body; // Expecting an array of story objects

  // Validate the number of stories
  if (!stories || stories.length < 3 || stories.length > 6) {
    return res.status(400).json({
      success: false,
      message: 'You must provide between 3 and 6 stories.',
    });
  }

  // Prepare an array to store new stories
  const newStories = stories.map((story) => ({
    userId: req.userId, // Use the userId from the token
    heading: story.heading,
    description: story.description,
    image: story.image,
    category: story.category,
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
