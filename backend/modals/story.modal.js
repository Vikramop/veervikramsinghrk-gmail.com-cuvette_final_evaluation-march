import mongoose from 'mongoose';

const storySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  heading: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Gaming', 'People', 'Sports', 'Food', 'India', 'Animals'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  likes: {
    type: Number,
    default: 0,
  },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Track users who saved the story
});

// Optionally, add indexes for faster queries
storySchema.index({ userId: 1 });
storySchema.index({ category: 1 });
storySchema.index({ createdAt: -1 });

const Story = mongoose.model('Story', storySchema);

export default Story;
