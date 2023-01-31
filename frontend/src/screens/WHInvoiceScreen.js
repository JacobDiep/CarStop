import axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import Card from 'react-bootstrap/Card';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { getError } from './utils';
import Button from 'react-bootstrap/Button';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, order: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'PAY_REQUEST':
      return { ...state, loadingPay: true };
    case 'PAY_SUCCESS':
      return { ...state, loadingPay: false, successPay: true };
    case 'PAY_FAIL':
      return { ...state, loadingPay: false };
    case 'PAY_RESET':
      return { ...state, loadingPay: false, successPay: false };
    case 'DELIVER_REQUEST':
      return { ...state, loadingDeliver: true };
    case 'DELIVER_SUCCESS':
      return { ...state, loadingDeliver: false, successDeliver: true };
    case 'DELIVER_FAIL':
      return { ...state, loadingDeliver: false };
    case 'DELIVER_RESET':
      return {
        ...state,
        loadingDeliver: false,
        successDeliver: false,
      };

    default:
      return state;
  }
}
var today = new Date();
export default function OrderScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;

  const params = useParams();
  const { id: orderId } = params;
  const navigate = useNavigate();

  const [
    {
      loading,
      error,
      order,
      successPay,
      successDeliver,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    order: {},
    error: '',
    successPay: false,
    loadingPay: false,
  });

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/orders/${orderId}`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };

    if (!userInfo) {
      return navigate('/login');
    }
    if (
      !order._id ||
      successPay ||
      successDeliver ||
      (order._id && order._id !== orderId)
    ) {
      fetchOrder();
      if (successPay) {
        dispatch({ type: 'PAY_RESET' });
      }
      if (successDeliver) {
        dispatch({ type: 'DELIVER_RESET' });
      }
    }
  }, [
    order,
    userInfo,
    orderId,
    navigate,
    successPay,
    successDeliver,
  ]);

  return loading ? (
    <LoadingBox></LoadingBox>
  ) : error ? (
    <MessageBox variant="danger">{error}</MessageBox>
  ) : (
    <div>
      <Helmet>
        <title>Invoice of {orderId}</title>
      </Helmet>
      <h1><Button
                    type="button"
                    variant="dark"
                    onClick={() => {
                      navigate(`/warehouse/orders/${order._id}`);
                    }}
                  >Go Back
        </Button></h1>
        <h1 className="my-3">Invoice</h1>
      <Row>
      <Col md={3}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title><h3>CarStop</h3></Card.Title>
              <Card.Text>
                <strong>Your one stop shop for car parts</strong><br />
                <strong>www.CarStop.net</strong><br />
                <br />
                123 Street St.<br />
                DeKalb, IL, 60115<br />
                Phone: 123-456-7890<br />
                FAX:  098-765-4321
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={5}>
        <Card className="mb-3">
            <Card.Body>
              <Card.Title>Ship to:</Card.Title>
              <Card.Text>
                {order.shippingAddress.fullName} <br />
                {order.shippingAddress.address},
                {order.shippingAddress.city}
                &nbsp;
              </Card.Text>
            </Card.Body>
          </Card>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Bill To:</Card.Title>
              <Card.Text>
              {order.shippingAddress.fullName} <br />
                {order.shippingAddress.address},
                {order.shippingAddress.city}
                &nbsp;
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={8}>
          <Card className="mb-3">
            <Card.Body>
              <Row>
                <Col md={5}><h5>Invoice Date</h5></Col>
                <Col md={5}><h5>Order #</h5></Col>
              </Row>
              <Row>
                <Col md={5}>{today.getFullYear()}-{(today.getMonth()+1)}-{today.getDate()}</Col>
                <Col md={5}>{orderId}</Col>
              </Row>
            </Card.Body>
          </Card>
          <Card className="mb-3">
            <Card.Body>
              <Row>
              <Col md={2}>
                   <strong> Order QTY</strong>
                </Col>
                <Col md={3}>
                    <strong>Item name</strong>
                </Col>
                <Col md={2}>
                   <strong> Item Price</strong>
                </Col>
                <Col md={2}>
                   <strong> Amount</strong>
                </Col>
              </Row>
              <ListGroup variant="flush">
                {order.orderItems.map((item) => (           
                    <Row >
                      <Card >
                        <Row>
                        <Col md={2}>
                          {item.quantity}
                        </Col>
                        <Col md={3}>
                          {item.name}
                        </Col>
                        <Col md={2}>
                          ${item.price}
                          </Col>
                          <Col md={2}>
                          ${item.price*item.quantity}
                          </Col>
                        </Row>
                      </Card>
                    </Row>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
          <Card >
            <Card.Body>
              <h2 style={{ float: 'right'}}>INVOICE TOTAL: ${order.totalPrice.toFixed(2)}</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}