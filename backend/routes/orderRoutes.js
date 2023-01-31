import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';
import { isAuth, isAdmin, isEmployee } from '../utils.js';

const orderRouter = express.Router();

orderRouter.post('/', isAuth, expressAsyncHandler(async (req, res) => {
    const newOrder = new Order({
		orderItems: req.body.orderItems.map((x) => ({ ...x, product: x.slug.split('-')[1] })),
		shippingAddress: req.body.shippingAddress,
		paymentMethod: req.body.paymentMethod,
		itemsPrice: req.body.itemsPrice,
		shippingPrice: req.body.shippingPrice,
		taxPrice: req.body.taxPrice,
		totalPrice: req.body.totalPrice,
		user: req.user._id,
    });

    const order = await newOrder.save();
    res.status(201).send({ message: 'New Order Created', order });
}));

orderRouter.get('/', isAuth, (isEmployee || isAdmin), expressAsyncHandler(async (req, res) => {
    const orders = await Order.find().sort({ updatedAt: -1 });
    res.send(orders);
}));

orderRouter.put('/:id/status', isAuth, (isEmployee || isAdmin), expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).send({ message: 'Order Not Found' });

	order.status = req.body.action;
	if(order.status == "Delivered") order.deliveredAt = Date.now();

	await order.save();
	res.send({ message: `Order ${order.status}` });
}));

orderRouter.delete('/:id', isAuth, (isEmployee || isAdmin), expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).send({ message: 'Order Not Found' });

	await order.remove();
	res.send({ message: 'Order Deleted' });
}));

orderRouter.get('/summary', isAuth, (isEmployee || isAdmin), expressAsyncHandler(async (req, res) => {
    const orders = await Order.aggregate([{
        $group: {
			_id: null,
			numOrders: { $sum: 1 },
			totalSales: { $sum: '$totalPrice' },
        },
	}]);
    const users = await User.aggregate([{
        $group: {
			_id: null,
			numUsers: { $sum: 1 },
        },
	}]);
    const dailyOrders = await Order.aggregate([{
        $group: {
			_id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
			orders: { $sum: 1 },
			sales: { $sum: '$totalPrice' },
        }
      }, { $sort: { _id: 1 } }
    ]);

	var ProductDB = req.app.ProductDB;

	var pQuery = await ProductDB.getProducts();
	var products = await jsonizeProducts(pQuery);
	let productCount = products.length;

    res.send({ users, orders, dailyOrders, productCount });
  })
);

orderRouter.get('/mine', isAuth, expressAsyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.send(orders);
}));

orderRouter.get('/:id', isAuth, expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) { res.send(order); }
	else { res.status(404).send({ message: 'Order Not Found' }); }
}));

orderRouter.put('/:id/pay', isAuth, expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'email name');
    if (!order) return res.status(404).send({ message: 'Order Not Found' });

	order.isPaid = true;
	order.paidAt = Date.now();
	order.paymentResult = {
		id: req.body.id,
		status: req.body.status,
		update_time: req.body.update_time,
		email_address: req.body.email_address,
	};

	const updatedOrder = await order.save();

	res.send({ message: 'Order Paid', order: updatedOrder });
}));

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

export default orderRouter;