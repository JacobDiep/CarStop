import express from 'express';
import Product from '../models/productModel.js';
import nodeoutlook from 'nodejs-nodemailer-outlook';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const uploadRouter = express.Router();
const AUTH = {
	user: "group6a-467@outlook.com",
	pass: ",B3_pWR4,%53knB"
};

uploadRouter.post('/email', async (req, res) => {
	var action = req.body.action;
	var recepient = req.body.recepient;
	var cart = req.body.cart;

	console.log(cart);
	let items = cart.cartItems ? cart.cartItems : cart.orderItems;
	let qtyPs = await Product.find();
	for(let i = 0; i < items.length; i++) {
		let item = items[i];
		let id = Number(item.slug.split('part-')[1]) - 1;
		if(qtyPs[id]) {
			qtyPs[id].quantity -= item.quantity;
			await qtyPs[id].save();
		}
	}

	var content = "", title = "CarStop";
	switch(action) {
		case 'placeorder': 
			content = loadEmailHTML('OrderPlaced', {cart});
			title += " (Order Placed)";
		break;
		case 'deliverorder':
			content = loadEmailHTML('OrderDelivered', {cart});;
			title += " (Order Delivered)";
		break;
	}
	
	sendEmail(recepient, title, content);

	res.status(200).send("Email sent.");
});

// always pulls from /backend/emails/
function loadEmailHTML(fileName, injected={ cart: { cartItems:[] }},) {
	let cart = injected.cart;
	let items = cart.cartItems ? cart.cartItems : cart.orderItems;
	let emailPath = path.join(__dirname, `../emails/${fileName}`);
	let content = fs.readFileSync(emailPath, 'utf8');
	if(!content) return null;

	if(cart) {
		var products = ""; var totalPrice = 0;
		for(let i = 0; i < items.length; i++) {
			let p = items[i]; 
			let price = p.price * p.quantity;
			products += `<tr>
				<td width="65%" align="left" class="item">${p.name}</td>
				<td width="10%" align="left" class="item">${p.quantity}</td>
				<td width="25%" align="left" class="item">$${price.toFixed(2)}</td>
			</tr>`;
			totalPrice += price;
		}
		injected['purchasedList'] = products;
		injected['totalPrice'] = totalPrice.toFixed(2);
		injected['deliveryAddress'] = `${cart.shippingAddress.address}<br>${cart.shippingAddress.city}`
		injected['userName'] = parseName(cart.shippingAddress.fullName)	
	}
	
	let keys = Object.keys(injected);
	for(let i = 0; i < keys.length; i++) {
		let name = keys[i];
		if(name == 'cart') continue;
		content = content.replace(`{{${name}}}`, injected[name]);
	}

	return content;
}

function sendEmail(recepient, title, htmlBody) {
	nodeoutlook.sendEmail({
		auth: AUTH,
		from: 'group6a-467@outlook.com',
		to: recepient,
		subject: title,
		html: htmlBody,
		replyTo: recepient,
		onError: (e) => console.log(e),
		onSuccess: (i) => console.log(i)
	});
}

function parseName(name) {
	name = name.charAt(0).toUpperCase() + name.slice(1);
	name = name.split(' ')[0];
	return name;
}


export default uploadRouter;
