import express from 'express';
import {
  getDashboardStats,
  getInventory,
  updateInventory,
  getOrders,
  updateOrderStatus,
  completeOrder
} from '../controllers/adminController.js';

const router = express.Router();

// 대시보드
router.get('/dashboard', getDashboardStats);

// 재고 관리
router.get('/inventory', getInventory);
router.put('/inventory/:menuId', updateInventory);

// 주문 관리
router.get('/orders', getOrders);
router.put('/orders/:orderId/status', updateOrderStatus);
router.post('/orders/:orderId/complete', completeOrder);

export default router;

