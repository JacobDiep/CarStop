import express from 'express';
import Product from '../models/productModel.js';
import data from '../data.js';
import User from '../models/userModel.js';
import SHCharge from '../models/shModel.js';

const seedRouter = express.Router();

seedRouter.get('/', async (req, res) => {
  await User.remove({});
  
  const createdUsers = await User.insertMany(data.users);
  res.send({ createdUsers });
});


seedRouter.get('/qty', async (req, res) => {
	var ProductDB = req.app.ProductDB;
	var pQuery = await ProductDB.getProducts();

	let products = [];
	for(let i = 0; i < pQuery.length; i++) {
		let p = pQuery[i];
		products.push({ id: p.number, quantity: (Math.floor(Math.random() * 100) + 1) });
	}

	await Product.remove({});
	const createdProducts = await Product.insertMany(products);
	res.send({ createdProducts });
});

seedRouter.get('/sh', async (req, res) => {
	await SHCharge.remove({});
	const createdSHCharges= await SHCharge.insertMany(data.SHCharge);
	res.send({ createdSHCharges });
});


export default seedRouter;
