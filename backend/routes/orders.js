const router = require('express').Router();
const ctrl = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, ctrl.createOrder);
router.get('/my', protect, ctrl.getMyOrders);
router.get('/all', protect, adminOnly, ctrl.getAllOrders);
router.get('/:id', protect, ctrl.getOrder);
router.put('/:id/status', protect, adminOnly, ctrl.updateOrderStatus);

module.exports = router;
