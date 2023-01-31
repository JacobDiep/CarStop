import React, { useContext, useEffect, useReducer } from 'react';
import axios from 'axios';
import { Store } from '../Store';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        products: action.payload.products,
        loading: false,
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'CREATE_REQUEST':
      return { ...state, loadingCreate: true };
    case 'CREATE_SUCCESS':
      return {
        ...state,
        loadingCreate: false,
      };
    case 'CREATE_FAIL':
      return { ...state, loadingCreate: false };
    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true, successDelete: false };
    case 'DELETE_SUCCESS':
      return {
        ...state,
        loadingDelete: false,
        successDelete: true,
      };
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false, successDelete: false };

    case 'DELETE_RESET':
      return { ...state, loadingDelete: false, successDelete: false };

    default:
      return state;
  }
};
export default function ProductListScreen() {
  const [
    {
      loading,
      error,
      products,
      loadingCreate,
      loadingDelete,
      successDelete,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  const { state } = useContext(Store);
  const { userInfo } = state;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`/api/products/count`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });

        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {}
    };
    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    } else {
      fetchData();
    }
  }, [userInfo, successDelete]);

  const QTY_JUMP = 1;
  async function updateQuantity(button, amount) {
	let id = button.id;
	let qtyElem = button.parentElement.parentElement.children[0];
	let old = Number(qtyElem.innerText);
	let adjusted = old + amount;

	if(adjusted < 0) adjusted = 0;

	qtyElem.innerText = adjusted;

	id = id.split('part-')[1];
	id = Number(id) - 1;

	axios.post(`/api/products/${id}/qty`, { qty: adjusted }, {
		headers: { authorization: `Bearer ${userInfo.token}` }
	});
  }

  return (
    <div>
      <Row>
        <Col>
          <h1>Products</h1>
        </Col>
      </Row>
      {loadingCreate && <LoadingBox></LoadingBox>}
      {loadingDelete && <LoadingBox></LoadingBox>}
      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>NAME</th>
                <th>PRICE</th>
                <th>WEIGHT</th>
                <th>QUANTITY</th>
                <th>IMAGE</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.slug.split('part-')[1]}>
                  <td>{product.slug.split('part-')[1]}</td>
                  <td>{product.name}</td>
                  <td>${product.price}</td>
                  <td>{(product.weight * product.countInStock).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LB(s)</td>
                  <td><div className="qrow">
					<div className="qcol">{product.countInStock}</div>
					<div className="qcol">
						<Button id={product.slug} onClick={(e) => updateQuantity(e.target, QTY_JUMP)}>+</Button>
						<Button id={product.slug} onClick={(e) => updateQuantity(e.target, -QTY_JUMP)}>-</Button>
					</div>
				  </div></td>
                  <td><img alt={product.name} src={product.image} style={{width: "50px", height: "50px"}}></img></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}