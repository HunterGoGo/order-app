import pool from '../config/db.js';

// 주문 생성
export const createOrder = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: '주문 항목이 필요합니다.' });
    }

    // 총액 계산
    let totalPrice = 0;
    for (const item of items) {
      const itemPrice = item.basePrice + (item.options?.reduce((sum, opt) => sum + opt.price, 0) || 0);
      totalPrice += itemPrice * item.quantity;
    }

    // 주문 생성
    const orderResult = await client.query(
      `INSERT INTO orders (total_price, status) 
       VALUES ($1, '주문 접수') 
       RETURNING id, order_time as "orderTime", status, total_price as "totalPrice"`,
      [totalPrice]
    );

    const order = orderResult.rows[0];
    const orderItems = [];

    // 주문 항목 생성
    for (const item of items) {
      const itemPrice = item.basePrice + (item.options?.reduce((sum, opt) => sum + opt.price, 0) || 0);
      
      const orderItemResult = await client.query(
        `INSERT INTO order_items (order_id, menu_id, menu_name, quantity, price)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, menu_id as "menuId", menu_name as "menuName", quantity, price`,
        [order.id, item.menuId, item.menuName, item.quantity, itemPrice]
      );

      const orderItem = orderItemResult.rows[0];

      // 옵션 저장
      if (item.options && item.options.length > 0) {
        const options = [];
        for (const option of item.options) {
          await client.query(
            `INSERT INTO order_item_options (order_item_id, option_id, option_name, option_price)
             VALUES ($1, $2, $3, $4)`,
            [orderItem.id, option.id, option.name, option.price]
          );
          options.push({
            id: option.id,
            name: option.name,
            price: option.price
          });
        }
        orderItem.options = options;
      } else {
        orderItem.options = [];
      }

      orderItems.push(orderItem);
    }

    await client.query('COMMIT');

    res.status(201).json({
      ...order,
      items: orderItems
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('주문 생성 오류:', error);
    res.status(500).json({ error: '주문 생성 중 오류가 발생했습니다.' });
  } finally {
    client.release();
  }
};

// 주문 정보 조회
export const getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    // 주문 조회
    const orderResult = await pool.query(
      `SELECT id, order_time as "orderTime", status, total_price as "totalPrice"
       FROM orders WHERE id = $1`,
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: '주문을 찾을 수 없습니다.' });
    }

    const order = orderResult.rows[0];

    // 주문 항목 조회
    const itemsResult = await pool.query(
      `SELECT id, menu_id as "menuId", menu_name as "menuName", quantity, price
       FROM order_items WHERE order_id = $1`,
      [orderId]
    );

    // 각 항목의 옵션 조회
    const items = await Promise.all(
      itemsResult.rows.map(async (item) => {
        const optionsResult = await pool.query(
          `SELECT option_id as id, option_name as name, option_price as price
           FROM order_item_options WHERE order_item_id = $1`,
          [item.id]
        );
        return {
          ...item,
          options: optionsResult.rows
        };
      })
    );

    res.json({
      ...order,
      items
    });
  } catch (error) {
    console.error('주문 조회 오류:', error);
    res.status(500).json({ error: '주문 조회 중 오류가 발생했습니다.' });
  }
};

