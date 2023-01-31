import express from 'express';
import bcrypt from 'bcryptjs';
import expressAsyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import { generateToken, isAuth, isAdmin, isEmployee } from '../utils.js';

const userRouter = express.Router();

userRouter.post('/signin', expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        res.send({
			_id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
			token: generateToken(user),
        });
        return;
      }
    }
    res.status(401).send({ message: 'Invalid email or password' });
}));

userRouter.get('/', isAuth, isAdmin, expressAsyncHandler(async (req, res) => {
    const users = await User.find({});
    res.send(users);
}));

userRouter.get('/:id', isAuth, (isEmployee || isAdmin), expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      res.send(user);
    } else {
      res.status(404).send({ message: 'User Not Found' });
    }
}));

userRouter.delete('/:id', isAuth, isAdmin, expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send({ message: 'User Not Found' });

	if (user.email === 'admin@example.com') {
		res.status(400).send({ message: 'Can Not Delete Admin User' });
		return;
	}
	await user.remove();
	res.send({ message: 'User Deleted' });
}));

userRouter.put('/:id', isAuth, isAdmin, expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send({ message: 'User Not Found' });

	user.name = req.body.name || user.name;
	user.email = req.body.email || user.email;
	user.role = req.body.role || user.role;

	const updatedUser = await user.save();
	res.send({ message: 'User Updated', user: updatedUser });
}));

userRouter.post('/signup', expressAsyncHandler(async (req, res) => {
    const newUser = new User({
		name: req.body.name,
		email: req.body.email,
		password: bcrypt.hashSync(req.body.password),
    });

    const user = await newUser.save();
	
    res.send({
		_id: user._id,
		name: user.name,
		email: user.email,
		role: user.role,
		token: generateToken(user),
    });
}));

userRouter.put('/profile', isAuth, expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
	if (!user) return res.status(404).send({ message: 'User Not Found' });

	user.name = req.body.name || user.name;
	user.email = req.body.email || user.email;
	
	if (req.body.password) {
		user.password = bcrypt.hashSync(req.body.password, 8);
	}

	const updatedUser = await user.save();
	res.send({
		_id: updatedUser._id,
		name: updatedUser.name,
		email: updatedUser.email,
		role: updatedUser.role,
		token: generateToken(updatedUser),
	});
}));
export default userRouter;
