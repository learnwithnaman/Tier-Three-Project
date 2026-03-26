const router = require('express').Router();
const ctrl = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', ctrl.getProducts);
router.get('/featured', ctrl.getFeatured);
router.get('/categories', ctrl.getCategories);
router.get('/seed', ctrl.seedProducts);
router.get('/:id', ctrl.getProduct);
router.post('/', protect, adminOnly, ctrl.createProduct);
router.put('/:id', protect, adminOnly, ctrl.updateProduct);
router.delete('/:id', protect, adminOnly, ctrl.deleteProduct);
router.post('/:id/reviews', protect, ctrl.addReview);

module.exports = router;
