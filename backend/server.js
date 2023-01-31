import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import seedRouter from './routes/seedRoutes.js';
import productRouter from './routes/productRoutes.js';
import userRouter from './routes/userRoutes.js';
import orderRouter from './routes/orderRoutes.js';
import uploadRouter from './routes/uploadRoutes.js';
import SHChargeRouter from './routes/shRouter.js';

import productDB from './productDB.js';

import dotenv from 'dotenv';
dotenv.config()

const mPORT = 27017;
let url = `mongodb://127.0.0.1:${mPORT}/carstop`
mongoose.connect(url, (err, db) => {
	if(err) throw err;
	console.log("Database created.");
})

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/upload', uploadRouter);
app.use('/api/seed', seedRouter);
app.use('/api/products', productRouter);
app.use('/api/users', userRouter);
app.use('/api/orders', orderRouter);
app.use('/api/SHCharges', SHChargeRouter);

app.use((err, req, res, next) => {
	res.status(500).send({ message: err.message });
});

const _dirname = path.resolve();
app.use(express.static(path.join(_dirname, '/frontend/build')));

app.get('*', (req, res) => {
	res.sendFile(path.join(_dirname, '/frontend/build/index.html'));
});

const port = process.env.PORT || 5000;


var ProductDB = new productDB();
app.listen(port, async () => {
	await ProductDB.connect();
	app.ProductDB = ProductDB;
	console.log(`Backend served at http://localhost:${port}`);
});
