import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../types';

interface JwtPayload {
  id: string;
}

// Protect routes - verify token
export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'super_secret_jwt_token_key'
      ) as JwtPayload;

      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        res
          .status(401)
          .json({ success: false, message: 'Not authorized, user not found' });
        return;
      }

      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      res
        .status(401)
        .json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res
      .status(401)
      .json({ success: false, message: 'Not authorized, no token provided' });
  }
};

// Grant access to specific roles
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res
        .status(401)
        .json({ success: false, message: 'Not authorized, no user session' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
      return;
    }
    next();
  };
};
