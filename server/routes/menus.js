import express from 'express';
import { getMenus } from '../controllers/menusController.js';

const router = express.Router();

// 메뉴 조회 라우트
router.get('/', (req, res, next) => {
  console.log('GET /api/menus 요청 수신');
  next();
}, getMenus);

export default router;

