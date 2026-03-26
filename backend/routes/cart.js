const router = require('express').Router();
router.get('/', (req, res) => res.json({ message: 'Cart is managed client-side' }));
module.exports = router;
