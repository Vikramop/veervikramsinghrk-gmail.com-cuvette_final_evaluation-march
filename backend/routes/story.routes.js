import express from 'express';
import {
  createStories,
  deleteStory,
  getStories,
  updateStory,
} from '../controller/story.controller.js';
import { optionalVerifyToken, verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

router.get('/', optionalVerifyToken, getStories);

router.post('/', verifyToken, createStories);

router.delete('/:id', verifyToken, deleteStory);

router.put('/:id', verifyToken, updateStory);

export default router;
