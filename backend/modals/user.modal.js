import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    isAuth: {
      type: Boolean,
      default: false,
    },
    bookmarkedStories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Story',
      },
    ],
  },
  { timestamps: true }
);

export const User = mongoose.model('user', userSchema);
