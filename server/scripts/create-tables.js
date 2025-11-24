import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pkg;

const createTables = async () => {
  // DATABASE_URL이 있으면 파싱하여 사용 (Render.com 형식)
  let dbConfig;
  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    dbConfig = {
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      database: url.pathname.slice(1), // 첫 번째 '/' 제거
      user: url.username,
      password: url.password,
      ssl: { rejectUnauthorized: false }, // Render.com은 SSL 필요
    };
  } else {
    dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || 'order_app',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      ssl: process.env.DB_HOST && process.env.DB_HOST.includes('render.com') 
        ? { rejectUnauthorized: false } 
        : false,
    };
  }

  const client = new Client(dbConfig);

  try {
    await client.connect();
    console.log('데이터베이스에 연결되었습니다.');

    // Menus 테이블 생성
    await client.query(`
      CREATE TABLE IF NOT EXISTS menus (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price INTEGER NOT NULL CHECK (price >= 0),
        image_url VARCHAR(500),
        stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Menus 테이블이 생성되었습니다.');

    // Options 테이블 생성
    await client.query(`
      CREATE TABLE IF NOT EXISTS options (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price INTEGER NOT NULL CHECK (price >= 0),
        menu_id INTEGER NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Options 테이블이 생성되었습니다.');

    // Orders 테이블 생성
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) NOT NULL DEFAULT '주문 접수' CHECK (status IN ('주문 접수', '제조 중', '제조 완료')),
        total_price INTEGER NOT NULL CHECK (total_price >= 0),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Orders 테이블이 생성되었습니다.');

    // OrderItems 테이블 생성
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        menu_id INTEGER NOT NULL REFERENCES menus(id),
        menu_name VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        price INTEGER NOT NULL CHECK (price >= 0),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('OrderItems 테이블이 생성되었습니다.');

    // OrderItemOptions 테이블 생성
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_item_options (
        id SERIAL PRIMARY KEY,
        order_item_id INTEGER NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
        option_id INTEGER NOT NULL REFERENCES options(id),
        option_name VARCHAR(255) NOT NULL,
        option_price INTEGER NOT NULL CHECK (option_price >= 0),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('OrderItemOptions 테이블이 생성되었습니다.');

    // 인덱스 생성
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_options_menu_id ON options(menu_id);
      CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
      CREATE INDEX IF NOT EXISTS idx_order_items_menu_id ON order_items(menu_id);
      CREATE INDEX IF NOT EXISTS idx_order_item_options_order_item_id ON order_item_options(order_item_id);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    `);
    console.log('인덱스가 생성되었습니다.');

    await client.end();
    console.log('모든 테이블이 성공적으로 생성되었습니다.');
  } catch (error) {
    console.error('테이블 생성 중 오류 발생:', error.message);
    process.exit(1);
  }
};

createTables();

