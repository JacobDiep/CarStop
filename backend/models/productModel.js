import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    id: { type: Number }, quantity: { type: Number }
  }
);

const Product = mongoose.model('Product', productSchema);
export default Product;
