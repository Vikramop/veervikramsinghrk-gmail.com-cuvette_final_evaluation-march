import express from 'express';
import {
  bookmarkStory,
  createStories,
  deleteStory,
  filterStoriesByCategory,
  getBookmarkedStories,
  getStories,
  likeStory,
  removeBookmark,
  shareStory,
  unlikeStory,
  updateStory,
} from '../controller/story.controller.js';
import { optionalVerifyToken, verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

router.get('/', optionalVerifyToken, getStories);

router.post('/', verifyToken, createStories);

router.delete('/:id', verifyToken, deleteStory);

router.put('/:id', verifyToken, updateStory);

router.get('/filter', optionalVerifyToken, filterStoriesByCategory);

router.post('/bookmark', verifyToken, bookmarkStory);
router.get('/bookmark', verifyToken, getBookmarkedStories);
router.delete('/bookmark', verifyToken, removeBookmark);

router.post('/like', verifyToken, likeStory);
router.delete('/like', verifyToken, unlikeStory);

router.post('/share', shareStory);

export default router;