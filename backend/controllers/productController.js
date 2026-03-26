const Product = require('../models/Product');

exports.getProducts = async (req, res) => {
  try {
    const { category, search, sort, page = 1, limit = 12 } = req.query;
    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };
    const sortObj = sort === 'price_asc' ? { price: 1 } : sort === 'price_desc' ? { price: -1 } : { createdAt: -1 };
    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortObj).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter)
    ]);
    res.json({ products, total, pages: Math.ceil(total / limit), page: Number(page) });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('reviews.user', 'name');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const exists = product.reviews.find(r => r.user.toString() === req.user._id.toString());
    if (exists) return res.status(400).json({ message: 'Already reviewed' });
    product.reviews.push({ user: req.user._id, name: req.user.name, rating: req.body.rating, comment: req.body.comment });
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.reduce((a, r) => a + r.rating, 0) / product.reviews.length;
    await product.save();
    res.status(201).json({ message: 'Review added' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getFeatured = async (req, res) => {
  try {
    const products = await Product.find({ featured: true }).limit(8);
    res.json(products);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.seedProducts = async (req, res) => {
  try {
    await Product.deleteMany({});
    const products = [
      { name: 'Premium Wireless Headphones', description: 'Studio-quality sound with 40-hour battery life and active noise cancellation. Perfect for audiophiles.', price: 4999, category: 'Electronics', brand: 'SoundMax', stock: 45, images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'], rating: 4.5, numReviews: 128, featured: true },
      { name: 'Minimalist Leather Watch', description: 'Handcrafted genuine leather strap with sapphire crystal glass. Japanese quartz movement.', price: 8999, category: 'Fashion', brand: 'TimeCraft', stock: 20, images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'], rating: 4.8, numReviews: 89, featured: true },
      { name: 'Smart Fitness Tracker', description: 'Track steps, heart rate, sleep, and 20+ workout modes. Waterproof up to 50m.', price: 2499, category: 'Electronics', brand: 'FitPro', stock: 60, images: ['https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500'], rating: 4.3, numReviews: 215, featured: true },
      { name: 'Organic Cotton Hoodie', description: '100% GOTS-certified organic cotton. Ultra-soft fleece inside. Available in 8 earth tones.', price: 1899, category: 'Fashion', brand: 'EcoWear', stock: 100, images: ['https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=500'], rating: 4.6, numReviews: 67 },
      { name: 'Ceramic Pour-Over Coffee Set', description: 'Hand-thrown ceramic dripper with matching server. Brews 2-4 cups. Dishwasher safe.', price: 1299, category: 'Home', brand: 'BrewArt', stock: 35, images: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500'], rating: 4.7, numReviews: 43 },
      { name: 'Mechanical Gaming Keyboard', description: 'Cherry MX switches, per-key RGB, aluminum frame. N-key rollover for competitive gaming.', price: 6499, category: 'Electronics', brand: 'KeyForge', stock: 25, images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500'], rating: 4.4, numReviews: 156, featured: true },
      { name: 'Yoga Mat Pro', description: 'Eco-friendly natural rubber, 6mm thickness, superior grip. Non-slip texture both sides.', price: 1599, category: 'Sports', brand: 'ZenFit', stock: 80, images: ['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500'], rating: 4.5, numReviews: 92 },
      { name: 'Stainless Steel Water Bottle', description: 'Triple-insulated keeps drinks cold 48h or hot 24h. 1L capacity. BPA-free.', price: 899, category: 'Sports', brand: 'HydroVault', stock: 150, images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500'], rating: 4.9, numReviews: 334, featured: true },
      { name: 'Wireless Charging Pad', description: '15W fast wireless charging, compatible with all Qi devices. Slim aluminum design.', price: 1199, category: 'Electronics', brand: 'ChargeFast', stock: 70, images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500'], rating: 4.2, numReviews: 78 },
      { name: 'Linen Throw Blanket', description: 'Woven from premium European linen. Lightweight yet warm. Herringbone pattern.', price: 2199, category: 'Home', brand: 'CozyNest', stock: 45, images: ['https://images.unsplash.com/photo-1592789705501-f9ae4278a9c9?w=500'], rating: 4.6, numReviews: 51 },
      { name: 'Running Shoes Ultra', description: 'Carbon-fiber plate, responsive foam midsole. Breathable engineered mesh upper.', price: 7999, category: 'Sports', brand: 'SpeedRun', stock: 30, images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'], rating: 4.7, numReviews: 203 },
      { name: 'Portable Bluetooth Speaker', description: '360° surround sound, 24h battery, IPX7 waterproof. Pair two for stereo mode.', price: 3499, category: 'Electronics', brand: 'SoundMax', stock: 55, images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500'], rating: 4.5, numReviews: 187, featured: true },
    ];
    await Product.insertMany(products);
    res.json({ message: `${products.length} products seeded successfully` });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
