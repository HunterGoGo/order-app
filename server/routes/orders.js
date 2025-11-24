import express from 'express';
import { createOrder, getOrder } from '../controllers/ordersController.js';

const router = express.Router();

router.post('/', createOrder);
router.get('/:orderId', getOrder);

export default router;

