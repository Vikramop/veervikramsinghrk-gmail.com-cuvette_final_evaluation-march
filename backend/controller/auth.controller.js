import { User } from '../modals/user.modal.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const signup = async (req, res) => {
  const { userName, password } = req.body;
  try {
    if (!userName || !password) {
      throw new Error(' All fields are required');
    }

    const userAlreadyExists = await User.findOne({ userName });
    console.log('user already exists', userAlreadyExists);
    if (userAlreadyExists) {
      return res.status(400).json({
        success: false,
        message: 'user already exists',
      });
    }
    const hashedPassword = await bcryptjs.hash(password, 10);

    const user = new User({
      userName,
      password: hashedPassword,
    });

    await user.save();
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

    res.status(201).json({
      sucess: true,
      message: 'user created successfully',
      user: {
        ...user._doc,
        password: undefined,
        token,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  const { userName, password } = req.body;
  try {
    const user = await User.findOne({ userName });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid Credentials' });
    }
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid Credentials' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      user: {
        ...user._doc,
        password: undefined,
        isAuth: true,
        token,
      },
    });
  } catch (error) {
    console.log('Error in login', error);
    res.status(400).json({
      success: false,
      message: error.message,
      user: { isAuth: false },
    });
  }
};

export const logout = async (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

export const checkAuth = async (req, res) => {
  try {
    console.log('req.userId:', req.userId); // Check the userId

    const user = await User.findById(req.userId);
    console.log('user', user);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log('Error in checkAuth', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
