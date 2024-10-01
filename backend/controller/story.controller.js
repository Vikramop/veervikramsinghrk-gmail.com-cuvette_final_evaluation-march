import Story from '../modals/story.modal.js';
import { User } from '../modals/user.modal.js';

const convertDurationToSeconds = (duration) => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const seconds = match[3] ? parseInt(match[3]) : 0;
  return hours * 3600 + minutes * 60 + seconds;
};

export const createStories = async (req, res) => {
  const stories = req.body;

  if (!stories || stories.length < 3 || stories.length > 6) {
    return res.status(400).json({
      success: false,
      message: 'You must provide between 3 and 6 stories.',
    });
  }

  const lastCategory = stories[stories.length - 1].category;

  for (const story of stories) {
    if (story.image && story.image.includes('youtube.com')) {
      const youtubeMatch = story.image.match(
        /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|shorts|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
      );
      if (youtubeMatch) {
        const videoId = youtubeMatch[1];

        try {
          const response = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=contentDetails&key=${process.env.YOUTUBE_API_KEY}`
          );
          const data = await response.json();

          if (data.items.length > 0) {
            const duration = data.items[0].contentDetails.duration;
            console.log('duration', duration);

            const durationInSeconds = convertDurationToSeconds(duration);
            console.log('durationInSeconds', durationInSeconds);

            if (durationInSeconds > 15) {
              return res.status(400).json({
                success: false,
                message:
                  'Video duration must be less than or equal to 15 seconds.',
              });
            }
          } else {
            return res.status(400).json({
              success: false,
              message: 'Invalid YouTube video ID.',
            });
          }
        } catch (error) {
          console.error('Error fetching YouTube video duration:', error);
          return res
            .status(500)
            .json({ success: false, message: 'Server Error' });
        }
      }
    }
  }

  const newStories = stories.map((story) => ({
    userId: req.userId,
    heading: story.heading,
    description: story.description,
    image: story.image,
    category: lastCategory,
  }));

  try {
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

export const getStories = async (req, res) => {
  const userId = req.userId;
  // console.log('userid for getttt', userId);

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
      data: {
        _id: story._id,
        heading: story.heading,
        description: story.description,
        image: story.image,
        category: story.category,
        userId: story.userId, // Include userId for validation
      },
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
      !['Gaming', 'Animals', 'Sports', 'Food', 'India', 'People'].includes(
        category
      )
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
  console.log('storyIdbs', storyId);

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

    // Check if the story is already bookmarked
    if (story.savedBy.includes(req.userId)) {
      return res
        .status(400)
        .json({ success: false, message: 'Story already bookmarked' });
    }

    story.savedBy.push(req.userId); // Add user to savedBy
    await story.save();

    res
      .status(200)
      .json({ success: true, message: 'Story bookmarked successfully' });
  } catch (error) {
    console.error('Error bookmarking story:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const removeBookmark = async (req, res) => {
  const { storyId } = req.params; // Get storyId from req.params

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

    // Remove the user ID from the savedBy array
    story.savedBy = story.savedBy.filter(
      (id) => id.toString() !== req.userId.toString()
    );
    await story.save();

    res
      .status(200)
      .json({ success: true, message: 'Story removed from bookmarks' });
  } catch (error) {
    console.error('Error removing bookmark:', error.message);
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

    const bookmarkedStories = await Story.find({ savedBy: req.userId });
    res.status(200).json({ success: true, data: bookmarkedStories });
  } catch (error) {
    console.error('Error fetching bookmarked stories:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const likeStory = async (req, res) => {
  const { storyId } = req.body; // Make sure you're receiving the storyId from the request body

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

    // Check if the user has already liked the story
    if (!story.likedBy.includes(user._id)) {
      story.likedBy.push(user._id); // Add the user to the likedBy array
      story.likes += 1; // Increment the like count
      await Promise.all([user.save(), story.save()]); // Save changes
      res.status(200).json({ success: true, message: 'Story liked' });
    } else {
      res.status(400).json({ success: false, message: 'Story already liked' });
    }
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

    // Check if the user has liked the story
    if (story.likedBy.includes(user._id)) {
      // Remove the user from the likedBy array
      story.likedBy = story.likedBy.filter(
        (id) => id.toString() !== user._id.toString()
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

// export const getLikedStories = async (req, res) => {
//   try {
//     // Find the user by their ID and populate likedStories
//     const user = await User.findById(req.userId).populate('likedStories');
//     if (!user) {
//       return res
//         .status(404)
//         .json({ success: false, message: 'User not found' });
//     }

//     // Find stories liked by the user
//     const likedStories = await Story.find({ likedBy: req.userId });

//     // Return the liked stories
//     res.status(200).json({ success: true, data: likedStories });
//   } catch (error) {
//     console.error('Error fetching liked stories:', error.message);
//     res.status(500).json({ success: false, message: 'Server Error' });
//   }
// };

export const getLikedStories = async (req, res) => {
  try {
    if (!req.userId) {
      // Case: User is NOT logged in
      const allStories = await Story.find({}); // Fetch all stories

      const storiesWithLikeCounts = allStories.map((story) => {
        return { _id: story._id, likeCount: story.likes }; // Return story _id and the 'likes' field directly
      });

      // Return all stories with their like counts
      return res
        .status(200)
        .json({ success: true, data: storiesWithLikeCounts });
    }

    // Case: User is logged in
    const user = await User.findById(req.userId).populate('likedStories');
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    // Fetch all stories and include whether the logged-in user has liked each
    const allStories = await Story.find({});

    const storiesWithLikeCounts = allStories.map((story) => {
      const isLikedByUser = user.likedStories.some((likedStory) =>
        likedStory._id.equals(story._id)
      );

      return { _id: story._id, likeCount: story.likes, isLikedByUser }; // Use the 'likes' field for like count and check if user liked it
    });

    // Return the stories with like counts and whether the user has liked each
    return res.status(200).json({ success: true, data: storiesWithLikeCounts });
  } catch (error) {
    console.error('Error fetching liked stories:', error.message);
    return res.status(500).json({ success: false, message: 'Server Error' });
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
