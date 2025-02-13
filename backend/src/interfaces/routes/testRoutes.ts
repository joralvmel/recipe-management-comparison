import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { UserModel } from '@infrastructure/repositories/userSchema';

const router = Router();

router.post(
  '/test-create-user',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        res.status(400).json({
          error: 'Missing required fields: name, email, or password',
        });
        return;
      }

      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const newUser = new UserModel({
        name,
        email,
        passwordHash,
      });

      const savedUser = await newUser.save();
      res.status(201).json(savedUser);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
