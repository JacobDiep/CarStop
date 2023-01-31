import React, { useContext, useState, useEffect, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store } from '../Store';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import CheckoutHead from '../components/CheckoutHead';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getError } from './utils';
import LoadingBox from '../components/LoadingBox';
import Axios from 'axios';

const reducer = (state, action) => {
  switch (action.type) {
    case 'CREATE_REQUEST':
      return { ...state, loading: true };
    case 'CREATE_SUCCESS':
      return { ...state, loading: false };
    case 'CREATE_FAIL':
      return { ...state, loading: false };
    default:
      return state;
  }
};

export default function PlaceOrderScreen() {
  const navigate = useNavigate();
  const [{ loading }, dispatch] = useReducer(reducer, {
    loading: false,
  });


  const [shCharges, setShCharges] = useState([]);

  const getShippingPrice = ((items) => {
	let shippingPrice = 0;
	for(let i = 0; i < items.length; i++) {
		let item = items[i];
		let w = item.weight, q = item.quantity, p = item.price;
		let weightClass = getWeightClass(w * q);

		if(!weightClass) { shippingPrice = 0; break; }

		shippingPrice += (p * q) * (weightClass.shipCharge / 100);
	}

	return shippingPrice;
  });
  const getTaxPrice = ((items) => {
	let taxPrice = 0;
	for(let i = 0; i < items.length; i++) {
		let item = items[i];
		let w = item.weight, q = item.quantity, p = item.price;
		let weightClass = getWeightClass(w * q);

		if(!weightClass) { taxPrice = 0; break; }

		taxPrice += (p * q) * (weightClass.taxCharge / 100);
	}
	
	return taxPrice;
  });
  const getWeightClass = ((weight) => {
	if(!shCharges) return;
	for(let i = 0; i < shCharges.length; i++) {
		if(weight < shCharges[i].maxWeight) return shCharges[i];
	}
	return shCharges[shCharges.length - 1];
  });

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;

  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100; // 123.2345 => 123.23
  cart.itemsPrice = round2(
    cart.cartItems.reduce((a, c) => a + c.quantity * c.price, 0)
  );
//   cart.shippingPrice = cart.itemsPrice > 100 ? round2(0) : round2(20);
//   cart.taxPrice = round2(0.0 * cart.itemsPrice);
  cart.shippingPrice = getShippingPrice(cart.cartItems);
  cart.taxPrice = getTaxPrice(cart.cartItems);
  cart.totalPrice = cart.itemsPrice + cart.shippingPrice + cart.taxPrice;

  var PaymentMethod = localStorage.getItem('paymentMethod');
  var PaymentExpire = localStorage.getItem('expDate');
  var CVV = localStorage.getItem('CVV');

  

  const placeOrderHandler = async () => {
    try {
      dispatch({ type: 'CREATE_REQUEST' });

      const { data } = await Axios.post(
        '/api/orders',
        {
          orderItems: cart.cartItems,
          shippingAddress: cart.shippingAddress,
          paymentMethod: PaymentMethod,
          expDate: PaymentExpire,
          CVV: CVV,
          itemsPrice: cart.itemsPrice,
          shippingPrice: cart.shippingPrice,
          taxPrice: cart.taxPrice,
          totalPrice: cart.totalPrice,
        },
        {
          headers: {
            authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      let xhr = new XMLHttpRequest();
      xhr.open("POST", "http://blitz.cs.niu.edu/CreditCard/");
      xhr.setRequestHeader("Accept", "application/json");
      xhr.setRequestHeader("Content-Type", "application/json");
  
    //   xhr.onreadystatechange = function () {
    //   if (xhr.readyState === 4) {
    //       console.log(xhr.status);
    //     console.log(xhr.responseText);
    //   }};
  
      let transNum = getRndInteger(100,999) + "-" + getRndInteger(100000000,999999999) + "-" + getRndInteger(100,999)
      let dbd = `{
        "vendor": "CarStop",
        "trans": "${transNum}",
        "cc": "${PaymentMethod}",
        "name": "${cart.shippingAddress.fullName}", 
        "exp": "${PaymentExpire}", 
        "amount": "${cart.totalPrice}"
      }`;
  
      xhr.send(dbd);


	  Axios.post('/api/upload/email', {
		recepient: userInfo.email, cart, action: 'placeorder'
	  },
        {
          headers: {
            authorization: `Bearer ${userInfo.token}`,
          },
        }
      );

      ctxDispatch({ type: 'CART_CLEAR' });
      dispatch({ type: 'CREATE_SUCCESS' });
      localStorage.removeItem('cartItems');
      navigate(`/order/${data.order._id}`);
    } catch (err) {
      dispatch({ type: 'CREATE_FAIL' });
      toast.error(getError(err));
    }
  };
  function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
  }
  useEffect(() => {
    if (!PaymentMethod) {
      navigate('/payment');
    }

	(async () => {
		const res = await Axios.get(`/api/SHCharges/sh`, {
			headers: { authorization: `Bearer ${userInfo.token}` },
		});
		setShCharges(res.data);
	})();
	
  }, [userInfo, PaymentMethod, navigate]);
  return (
    <div>
      <CheckoutHead step1 step2 step3 step4></CheckoutHead>
      <Helmet>
        <title>Preview Order</title>
      </Helmet>
      <h1 className="my-3">Preview Order</h1>
      <Row>
        <Col md={8}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Shipping</Card.Title>
              <Card.Text>
                <strong>Name:</strong> {cart.shippingAddress.fullName} <br />
                <strong>Address: </strong> {cart.shippingAddress.address},
                {cart.shippingAddress.city},
              </Card.Text>
              <Link to="/shipping">Edit</Link>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Payment Information</Card.Title>
              <Card.Text>
                <strong>Card Number:</strong> {PaymentMethod} <br />
                <strong>Expiration Date:</strong> {PaymentExpire} <br />
                <strong>CVV:</strong> {CVV}
              </Card.Text>
              <Link to="/payment">Edit</Link>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body style={{ position: 'relative' }}>
              <Card.Title>Items</Card.Title>
              <Link style={{ position: 'absolute', top: '0.25em', right: '0.6em' }} to="/cart">Edit</Link>
              <ListGroup variant="flush">
                {cart.cartItems.map((item) => (
                  <ListGroup.Item key={item._id}>
                    <Row className="align-items-center">
                      <Col md={8}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="img-fluid rounded img-thumbnail"
                        ></img>{' '}
                        <span>{item.name}</span>
                      </Col>
                      <Col md={2}>
                        <span>{item.quantity}</span>
                      </Col>
                      <Col md={2}>USD ${item.price}</Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Order Summary</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Items</Col>
                    <Col>USD ${cart.itemsPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Shipping</Col>
                    <Col>USD ${cart.shippingPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Tax</Col>
                    <Col>USD ${cart.taxPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>
                      <strong> Order Total</strong>
                    </Col>
                    <Col>
                      <strong>USD ${cart.totalPrice.toFixed(2)}</strong>
                    </Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className="d-grid">
                    <Button
                      variant="outline-primary"
                      type="button"
                      onClick={placeOrderHandler}
                      disabled={cart.cartItems.length === 0}
                    >
                      Place Order
                    </Button>
                  </div>
                  {loading && <LoadingBox></LoadingBox>}
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}