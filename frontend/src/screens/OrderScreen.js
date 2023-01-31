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
import { toast } from 'react-toastify';
import Button from 'react-bootstrap/Button';
import Axios from 'axios';


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
	  case 'SHIP_REQUEST':
		return { ...state, loadingShippd: true };
	  case 'SHIP_SUCCESS':
		return { ...state, loadingShippd: false, successShippd: true };
	  case 'SHIP_FAIL':
		return { ...state, loadingShippd: false };
	  case 'SHIP_RESET':
		return {
		  ...state,
		  loadingShippd: false,
		  successShippd: false,
		};
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
      loadingDeliver,
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


  async function shipOrderHandler() {
    try {
      dispatch({ type: 'SHIP_REQUEST' });
      const { data } = await axios.put(`/api/orders/${order._id}/status`,
	    {
	  	  action: 'Shipped'
	    },
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: 'SHIP_SUCCESS', payload: data });
      toast.success('Order has been shipped!');
	  window.location.reload(false);
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: 'SHIP_FAIL' });
    }
  }

  async function deliverOrderHandler() {
    try {
      dispatch({ type: 'DELIVER_REQUEST' });
	
	  let user = await axios.get(`/api/users/${order.user}`, {
		headers: { authorization: `Bearer ${userInfo.token}` }
	  });
	  user = user.data;

      const { data } = await axios.put(`/api/orders/${order._id}/status`,
        {
			action: 'Delivered'
		},
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: 'DELIVER_SUCCESS', payload: data });
      toast.success('Order is delivered!');
	  window.location.reload(false);

    console.log(order);
    let cart = order;
    Axios.post('/api/upload/email', {
      recepient: user.email, cart, action: 'deliverorder'
      },
          {
            headers: {
              authorization: `Bearer ${userInfo.token}`,
            },
          }
        );
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: 'DELIVER_FAIL' });
    }
  }

  const getStatusColor = ((status) => {
	switch(status) {
		case 'Processing': return 'danger';
		case 'Shipped': return 'warning';
		case 'Delivered': return 'success';
		default: return 'secondary';
	}
  });

  const orderColor = getStatusColor(order.status);
  const statusValid = orderColor !== 'secondary';
  const wasDelivered = order.status === 'Delivered';

  return loading ? (
    <LoadingBox></LoadingBox>
  ) : error ? (
    <MessageBox variant="danger">{error}</MessageBox>
  ) : (
    <div>
      <Helmet>
        <title>Order {orderId}</title>
      </Helmet>
      <h1 className="my-3">Order {orderId}</h1>
      {userInfo.role === 'admin' && (
                    <h5><Button
                        variant="dark"
                        type="button"
                        onClick={() => {
                          navigate(`/admin/orders`);
                        }}
                      >
                        Go Back
                        </Button></h5>
                )}
      {userInfo.role === 'customer' && (
                    <h5><Button
                        variant="dark"
                        type="button"
                        onClick={() => {
                          navigate(`/orderhistory`);
                        }}
                      >
                        Go to Order History
                        </Button></h5>
                )}
	  {userInfo.role === 'employee' && (
                    <div><Row>
						<Col md={2}>
							<Button type="button" variant="dark" onClick={() => {
								navigate(`/warehouse/orders`);
							}}>←</Button>
						</Col>
					</Row>
					<Row>
						<br/>
					</Row>
					<Row style={{ marginBottom: '1em' }}>
					<Col>
						<Button type="button" variant="dark" onClick={() => {
							navigate(`/warehouse/orders/${order._id}/packinglist`);
						}}>View Packing List</Button>
					</Col>
					<Col>
						<Button type="button" variant="dark" onClick={() => {
							navigate(`/warehouse/orders/${order._id}/invoice`);
						}}>View Invoice</Button>
					</Col>
				  </Row></div>
                )}
      <Row>
        <Col md={8}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Shipping</Card.Title>
              <Card.Text>
                <strong>Name:</strong> {order.shippingAddress.fullName} <br />
                <strong>Address: </strong> {order.shippingAddress.address},
                {order.shippingAddress.city}
              </Card.Text>
              <MessageBox id="statusMsg" variant={orderColor}>
                  {wasDelivered ? `Delivered at ${order.deliveredAt}` : (statusValid ? order.status : "Something went wrong...")}
              </MessageBox>
            </Card.Body>
          </Card>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Payment</Card.Title>
              <Card.Text>
                <strong>Card Ending With:</strong> {"*" + order.paymentMethod.slice(-4)}
              </Card.Text>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Items</Card.Title>
              <ListGroup variant="flush">
                {order.orderItems.map((item) => (
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
                      <Col md={1}>
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
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Order Summary</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Items</Col>
                    <Col>USD ${order.itemsPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Shipping</Col>
                    <Col>USD ${order.shippingPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Tax</Col>
                    <Col>USD ${order.taxPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>
                      <strong> Order Total</strong>
                    </Col>
                    <Col>
                      <strong>USD ${order.totalPrice.toFixed(2)}</strong>
                    </Col>
                  </Row>
                </ListGroup.Item>
				{userInfo.role === 'employee' && order.isPaid && order.status !== 'Delivered' && (
                  <ListGroup.Item>
                    {loadingDeliver && <LoadingBox></LoadingBox>}
                    <div className="d-grid">
					  <Button variant="outline-primary" type="button" onClick={shipOrderHandler}>
                        Ship Order
                      </Button>
                      <Button variant="outline-primary" type="button" onClick={deliverOrderHandler}>
                        Deliver Order
                      </Button>
                    </div>
                  </ListGroup.Item>
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}