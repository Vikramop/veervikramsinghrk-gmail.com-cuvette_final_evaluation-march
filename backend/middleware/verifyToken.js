import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  console.log('Authorization Header:', authHeader); // Debug
  console.log('Extracted Token:', token); // Debug

  if (!token)
    return res
      .status(401)
      .json({ success: false, message: 'unauthorized- no token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('decoded', decoded);

    if (!decoded)
      return res
        .status(401)
        .json({ success: false, message: 'Unauthorized - invlaid token' });
    req.userId = decoded._id;
    console.log('user id', req.userId);

    next();
  } catch (error) {
    console.log('Error in verifyToken', error);
    return res
      .status(401)
      .json({ success: false, message: 'Unauthorized - invalid token' });
  }
};

export const optionalVerifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded._id;
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
  }
  next(); // Move forward if token is not there
};
