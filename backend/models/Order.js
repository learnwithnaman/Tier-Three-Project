const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:     String,
  qty:      { type: Number, required: true },
  price:    { type: Number, required: true },
  image:    String,
});

const orderSchema = new mongoose.Schema({
  user:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items:         [orderItemSchema],
  shippingAddress: {
    address: String, city: String, postalCode: String, country: String,
  },
  paymentMethod: { type: String, default: 'COD' },
  itemsPrice:    { type: Number, default: 0 },
  shippingPrice: { type: Number, default: 0 },
  totalPrice:    { type: Number, default: 0 },
  isPaid:        { type: Boolean, default: false },
  isDelivered:   { type: Boolean, default: false },
  status:        { type: String, enum: ['pending','processing','shipped','delivered','cancelled'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
