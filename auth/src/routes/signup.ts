import jwt from 'jsonwebtoken';
import express, { NextFunction, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { requestValidationError } from '@bahy_tickets/common';
import { validateRequest } from '@bahy_tickets/common';
import { BadRequestError } from '@bahy_tickets/common';
import { User } from '../models/user';

const router = express.Router();

router.post(
  '/signup',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('password must be between 4 and 20 charachters')
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    console.log('Signup');
    const { email, password } = req.body;
    const currentUser = await User.findOne({ email });
    if (currentUser) {
      next(new BadRequestError('Email In Use'));
      return;
    }
    const user = User.build({ email, password });
    await user.save();

    // Generate JWT
    const userJwt = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_KEY!
    );

    // Store it in a session object
    req.session = {
      jwt: userJwt
    };

    res.status(201).send(user);
  }
);

export { router as signupRouter };
