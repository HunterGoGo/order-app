import pool from '../config/db.js';

// 대시보드 통계 조회
export const getDashboardStats = async (req, res) => {
  try {
    const statsResult = await pool.query(`
      SELECT 
        COUNT(*) as "totalOrders",
        COUNT(*) FILTER (WHERE status = '주문 접수') as "receivedOrders",
        COUNT(*) FILTER (WHERE status = '제조 중') as "manufacturingOrders",
        COUNT(*) FILTER (WHERE status = '제조 완료') as "completedOrders"
      FROM orders
    `);

    const stats = statsResult.rows[0];
    res.json({
      totalOrders: parseInt(stats.totalOrders),
      receivedOrders: parseInt(stats.receivedOrders),
      manufacturingOrders: parseInt(stats.manufacturingOrders),
      completedOrders: parseInt(stats.completedOrders)
    });
  } catch (error) {
    console.error('대시보드 통계 조회 오류:', error);
    res.status(500).json({ error: '대시보드 통계 조회 중 오류가 발생했습니다.' });
  }
};

// 재고 조회
export const getInventory = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id as "menuId", name as "menuName", stock FROM menus ORDER BY id'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('재고 조회 오류:', error);
    res.status(500).json({ error: '재고 조회 중 오류가 발생했습니다.' });
  }
};

// 재고 업데이트
export const updateInventory = async (req, res) => {
  try {
    const { menuId } = req.params;
    const { stock } = req.body;

    if (stock === undefined || stock < 0) {
      return res.status(400).json({ error: '재고는 0 이상의 값이어야 합니다.' });
    }

    const result = await pool.query(
      `UPDATE menus SET stock = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING id as "menuId", name as "menuName", stock`,
      [stock, menuId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '메뉴를 찾을 수 없습니다.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('재고 업데이트 오류:', error);
    res.status(500).json({ error: '재고 업데이트 중 오류가 발생했습니다.' });
  }
};

// 주문 목록 조회
export const getOrders = async (req, res) => {
  try {
    const { status, limit } = req.query;
    let query = `
      SELECT id, order_time as "orderTime", status, total_price as "totalPrice"
      FROM orders
    `;
    const params = [];
    let paramIndex = 1;

    if (status) {
      query += ` WHERE status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ' ORDER BY order_time DESC';

    if (limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(parseInt(limit));
    }

    const ordersResult = await pool.query(query, params);

    // 각 주문의 항목 조회
    const orders = await Promise.all(
      ordersResult.rows.map(async (order) => {
        const itemsResult = await pool.query(
          `SELECT menu_id as "menuId", menu_name as "menuName", quantity, price
           FROM order_items WHERE order_id = $1`,
          [order.id]
        );

        // 각 항목의 옵션 조회
        const items = await Promise.all(
          itemsResult.rows.map(async (item) => {
            // order_item_id를 찾기 위해 order_items 테이블에서 조회
            const orderItemResult = await pool.query(
              `SELECT id FROM order_items WHERE order_id = $1 AND menu_id = $2 AND quantity = $3 LIMIT 1`,
              [order.id, item.menuId, item.quantity]
            );
            
            if (orderItemResult.rows.length > 0) {
              const orderItemId = orderItemResult.rows[0].id;
              const optionsResult = await pool.query(
                `SELECT option_name as name FROM order_item_options WHERE order_item_id = $1`,
                [orderItemId]
              );
              item.options = optionsResult.rows.map(opt => ({ name: opt.name }));
            } else {
              item.options = [];
            }
            return item;
          })
        );

        return {
          ...order,
          items
        };
      })
    );

    res.json(orders);
  } catch (error) {
    console.error('주문 목록 조회 오류:', error);
    res.status(500).json({ error: '주문 목록 조회 중 오류가 발생했습니다.' });
  }
};

// 주문 상태 업데이트
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['주문 접수', '제조 중', '제조 완료'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: '유효하지 않은 주문 상태입니다.' });
    }

    const result = await pool.query(
      `UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING id, order_time as "orderTime", status, total_price as "totalPrice"`,
      [status, orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '주문을 찾을 수 없습니다.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('주문 상태 업데이트 오류:', error);
    res.status(500).json({ error: '주문 상태 업데이트 중 오류가 발생했습니다.' });
  }
};

// 주문 완료 처리 및 재고 차감
export const completeOrder = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { orderId } = req.params;

    // 주문 조회
    const orderResult = await client.query(
      'SELECT id, status FROM orders WHERE id = $1',
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: '주문을 찾을 수 없습니다.' });
    }

    // 주문 항목 조회
    const itemsResult = await client.query(
      'SELECT menu_id, quantity FROM order_items WHERE order_id = $1',
      [orderId]
    );

    const inventoryUpdates = [];

    // 재고 차감
    for (const item of itemsResult.rows) {
      // 현재 재고 확인
      const menuResult = await client.query(
        'SELECT stock, name FROM menus WHERE id = $1',
        [item.menu_id]
      );

      if (menuResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: `메뉴 ID ${item.menu_id}를 찾을 수 없습니다.` });
      }

      const currentStock = menuResult.rows[0].stock;
      const menuName = menuResult.rows[0].name;

      if (currentStock < item.quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          error: `재고가 부족합니다. ${menuName}: 필요 ${item.quantity}개, 재고 ${currentStock}개` 
        });
      }

      // 재고 차감
      const newStock = currentStock - item.quantity;
      await client.query(
        'UPDATE menus SET stock = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newStock, item.menu_id]
      );

      inventoryUpdates.push({
        menuId: item.menu_id,
        menuName: menuName,
        previousStock: currentStock,
        newStock: newStock,
        quantityDeducted: item.quantity
      });
    }

    // 주문 상태를 "제조 완료"로 업데이트
    await client.query(
      'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['제조 완료', orderId]
    );

    await client.query('COMMIT');

    res.json({
      orderId: parseInt(orderId),
      status: '제조 완료',
      inventoryUpdates
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('주문 완료 처리 오류:', error);
    res.status(500).json({ error: '주문 완료 처리 중 오류가 발생했습니다.' });
  } finally {
    client.release();
  }
};

