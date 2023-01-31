import React, { useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import CheckoutHead from '../components/CheckoutHead';
import { Store } from '../Store';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

export default function PaymentMethodScreen() {
  const navigate = useNavigate();
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    cart: { shippingAddress, paymentInformation, expDate, CVV },
  } = state;

  const [paymentMethodName, setPaymentInformation] = useState(
    paymentInformation || 'Mobile Money'
  );

  const [expDateFull, setExpDate] = useState(
    expDate || ''
  );

  const [CVVFull, setCVV] = useState(
    CVV || ''
  );

  useEffect(() => {
    if (!shippingAddress.address) {
      navigate('/shipping');
    }
  }, [shippingAddress, navigate]);
  const submitHandler = (e) => {
    e.preventDefault();
    ctxDispatch({ type: 'SAVE_PAYMENT_METHOD', payload: paymentMethodName });
    localStorage.setItem('paymentMethod', paymentMethodName);
    ctxDispatch({ type: 'SAVE_EXP_DATE', payload: expDateFull });
    localStorage.setItem('expDate', expDateFull);
    ctxDispatch({ type: 'SAVE_CVV', payload: CVVFull });
    localStorage.setItem('CVV', CVVFull);
    navigate('/placeorder');
  };
  return (
    <div>
      <Helmet>
        <title>Payment Information</title>
      </Helmet>
      <CheckoutHead step1 step2 step3></CheckoutHead>
      <div className="container small-container">
        <h1 className="my-3">Payment Information</h1>
        <Form onSubmit={submitHandler}>
          <Form.Group className="mb-3" controlId="CCNum">
            <Form.Label>Card Number</Form.Label>
            <Form.Control
              defaultValue=""
              onChange={(e) => setPaymentInformation(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="ExpDate">
            <Form.Label>Expiration Date</Form.Label>
            <Form.Control
              defaultValue=""
              onChange={(e) => setExpDate(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="ExpDate">
            <Form.Label>CVV</Form.Label>
            <Form.Control
              defaultValue=""
              onChange={(e) => setCVV(e.target.value)}
              required
            />
          </Form.Group>
          <div className="mb-3">
            <Button variant="outline-primary" type="submit">
              Continue
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}