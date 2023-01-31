import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import { useContext } from 'react';
import { Store } from '../Store';

export default function Product(props) {
  const { product } = props;
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    cart: { cartItems },
  } = state;


  const addToCartHandler = async (item) => {
    const itemExist = cartItems.find((x) => x.slug === product.slug);
    const quantity = itemExist ? itemExist.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${item.slug}`);

	if (data.countInStock < quantity) {
      window.alert('Sorry. Product is out of stock');
      return;
    }

    ctxDispatch({ type: 'CART_ADD_ITEM', payload: { ...item, quantity } });
  };

  return (
    <Card>
        <img src={product.image} className="card-img-top" alt={product.name} />
      <Card.Body>
          <Card.Title>{product.name}</Card.Title>
        <Card.Text>
          <strong>
            USD $
            {product.price}
          </strong> <br/>
          <strong>
          {product.weight} LB(s)
          </strong>
        </Card.Text>
        <div className="d-grid gap-2">
          {product.countInStock === 0 ? (
            <Button variant="light" disabled>
              Out of stock
            </Button>
          ) : (
            <Button variant="outline-primary" onClick={() => addToCartHandler(product)} >
              Add to cart
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}