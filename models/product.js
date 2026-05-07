import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '상품명은 필수입니다'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, '상품 설명은 필수입니다'],
  },
  price: {
    type: Number,
    required: [true, '가격은 필수입니다'],
    min: [0, '가격은 0원 이상이어야 합니다']
  },
  tags: [String]
}, {
  timestamps: true 
});

const Product = mongoose.model('Product', productSchema);
export default Product;