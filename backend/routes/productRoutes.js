import express from 'express';
import Product from '../models/productModel.js';
import expressAsyncHandler from 'express-async-handler';
import { isAuth, isAdmin } from '../utils.js';

const productRouter = express.Router();

productRouter.get('/', async (req, res) => {
	var ProductDB = req.app.ProductDB;

	var pQuery = await ProductDB.getProducts();
	var products = await jsonizeProducts(pQuery);
	
	res.send(products);
});
async function jsonizeProducts(query) {
	var products = [];
	let qtyPs = await Product.find();

	for(let i = 0; i < query.length; i++) {
		let p = query[i];
		products.push({
			createdAt: Date.now(), 
			name: p.description,
			image: p.pictureURL,
			price: p.price,
			weight: p.weight,
			slug: `part-${p.number}`,
			countInStock: await getQty(qtyPs, p.number)
		});
	}
	return products;
}
async function getQty(qtys, productNum) {
	for(let i = 0; i < qtys.length; i++) {
		if(qtys[i].id == productNum) return qtys[i].quantity;
	}
	return null;
}


productRouter.get('/count', isAuth, expressAsyncHandler(async (req, res) => {
	var ProductDB = req.app.ProductDB;

	var pQuery = await ProductDB.getProducts();
	var products = await jsonizeProducts(pQuery);
	let countProducts = products.length;
	
	res.send({
		products,
		countProducts
	});
}));

productRouter.get('/search', expressAsyncHandler(async (req, res) => {
	const { query } = req;
	const searchQuery = query.query || '';

	var ProductDB = req.app.ProductDB;
	var pQuery = await ProductDB.getProducts();
	var products = await jsonizeProducts(pQuery);
	let countProducts = products.length;

	if(!searchQuery || searchQuery == 'all') {
		return res.send({ products, countProducts });
	}
	
	products = products.filter(p => {
		let des = p.name.toLocaleLowerCase();
		return des.includes(searchQuery.toLocaleLowerCase());
	});
	countProducts = products.length;

	res.send({ products, countProducts });
}));


// backend/routes/productRoutes.js (bottom function)
productRouter.get('/:id', async (req, res) => {
    var ProductDB = req.app.ProductDB;
    let pID = req.params.id.split('part-')[1];
    var product = await ProductDB.getProduct(pID);
    product = (await jsonizeProducts([product]))[0];

    if (product) { res.send(product); }
	else { res.status(404).send({ message: 'Product Not Found' }); }
});

productRouter.post('/:id/qty', isAuth, isAdmin,  expressAsyncHandler(async (req, res) => {
	let id = req.params.id;
	let qty = req.body.qty;
	if(qty != 0 && !qty) return res.status(400).send("You must provide a new quantity(qty)");

    let pID = Number(id);

	let qtyPs = await Product.find();
	let product = qtyPs[pID];

	if(!product) return res.status(400).send("Invalid product id");

	product.quantity = qty;
	await product.save();

	res.status(200).send(`quantity updated ${product.quantity}`)
}));

export default productRouter;