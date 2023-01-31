import axios from 'axios';
import React, { useContext, useState, useEffect, useReducer } from 'react';
import Button from 'react-bootstrap/Button';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { getError } from './utils';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        orders: action.payload,
        loading: false,
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true, successDelete: false };
    case 'DELETE_SUCCESS':
      return {
        ...state,
        loadingDelete: false,
        successDelete: true,
      };
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false };
    case 'DELETE_RESET':
      return { ...state, loadingDelete: false, successDelete: false };
    default:
      return state;
  }
};
export default function OrderListScreen() {
  const navigate = useNavigate();
  const { state } = useContext(Store);
  const { userInfo } = state;
  const [{ loading, error, orders, loadingDelete, successDelete }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: '',
    });


  var [Orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/orders`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });

		setOrders(data);

		console.log(data)

        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err),
        });
      }
    };
    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    } else {
      fetchData();
    }
  }, [userInfo, successDelete]);

  const deleteHandler = async (order) => {
    if (window.confirm('Are you sure to delete?')) {
      try {
        dispatch({ type: 'DELETE_REQUEST' });
        await axios.delete(`/api/orders/${order._id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        toast.success('order deleted successfully');
        dispatch({ type: 'DELETE_SUCCESS' });
      } catch (error) {
        toast.error(getError(error));
        dispatch({
          type: 'DELETE_FAIL',
        });
      }
    }
  };

  const isAdmin = userInfo.role == 'admin';
  const isEmployee = userInfo.role == 'employee';

  // trying to compare price, but not sure how to update table with it
  // function comparePrice( a, b ) {
  //   console.log((a.totalPrice < b.totalPrice) ? -1 : (a.totalPrice > b.totalPrice) ? 1 : 0)
  //   return (a.totalPrice < b.totalPrice) ? -1 : (a.totalPrice > b.totalPrice) ? 1 : 0;
  // }

  const sortByDate = ((up) => {
	var data = Object.assign([], Orders);
	data = data.sort((a, b) => {
		return up ? new Date(b.createdAt) - new Date(a.createdAt) : new Date(a.createdAt) - new Date(b.createdAt);
	});
	setOrders(data);
  });

  const sortByPrice = ((up) => {
	var data = Object.assign([], Orders);
	data = data.sort((a, b) => {
		return up ? b.totalPrice - a.totalPrice : a.totalPrice - b.totalPrice;
	});
	setOrders(data);
  });

  const sortByStatus = ((up) => {
	var data = Object.assign([], Orders);
	data = data.sort((a, b) => {
		return up ? b.status.localeCompare(a.status) : a.status.localeCompare(b.status);
	});
	setOrders(data);
  });

  


  return (
    <div>
      <Helmet>
        <title>Orders</title>
      </Helmet>
      <h1>Orders</h1>
      {loadingDelete && <LoadingBox></LoadingBox>}
      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>USER</th>
              <th>
			    <div style={{display: 'flex', flexDirection: 'row', gap: '10px'}}>
					<span>DATE</span>
					<div style={{display: 'flex', flexDirection: 'column', gap: '2px'}}>
						<p className="sortButton" onClick={() => { sortByDate(true) }}>+</p>
						<p className="sortButton" onClick={() => { sortByDate(false) }}>-</p>
					</div>
				</div>
			  </th>
              <th>
				<div style={{display: 'flex', flexDirection: 'row', gap: '10px'}}>
					<span>TOTAL</span>
					<div style={{display: 'flex', flexDirection: 'column', gap: '2px'}}>
						<p className="sortButton" onClick={() => { sortByPrice(true) }}>+</p>
						<p className="sortButton" onClick={() => { sortByPrice(false) }}>-</p>
					</div>
				</div>
			  </th>
              <th>
				<div style={{display: 'flex', flexDirection: 'row', gap: '10px'}}>
					<span>STATUS</span>
					<div style={{display: 'flex', flexDirection: 'column', gap: '2px'}}>
						<p className="sortButton" onClick={() => { sortByStatus(true) }}>+</p>
						<p className="sortButton" onClick={() => { sortByStatus(false) }}>-</p>
					</div>
				</div>
			  </th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {Orders.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.shippingAddress.fullName}</td>
                <td>{order.createdAt.substring(0, 10)}</td>
                <td>${order.totalPrice.toFixed(2)}</td>
                <td>{order.status}</td>
                <td>
                  <Button
                    type="button"
                    variant="dark"
                    onClick={() => {
                      (isAdmin || isEmployee) && navigate(`/${isAdmin ? 'admin' : 'warehouse'}/orders/${order._id}`);
                    }}
                  >
                    Details
                  </Button>
                  &nbsp;
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => deleteHandler(order)}
                  >
                    <i className="fas fa-trash-can"></i>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
          
        </table>
      )}
    </div>
  );
}
