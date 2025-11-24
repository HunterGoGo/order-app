import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pkg;

const seedData = async () => {
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

    // 기존 데이터 확인
    const menuCheck = await client.query('SELECT COUNT(*) FROM menus');
    if (parseInt(menuCheck.rows[0].count) > 0) {
      console.log('이미 데이터가 존재합니다. 시드 데이터 생성을 건너뜁니다.');
      await client.end();
      return;
    }

    // 메뉴 데이터 삽입
    const menuResult = await client.query(`
      INSERT INTO menus (name, description, price, image_url, stock) VALUES
      ('아메리카노(ICE)', '시원한 아이스 아메리카노', 4000, 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&h=300&fit=crop', 10),
      ('아메리카노(HOT)', '따뜻한 핫 아메리카노', 4000, 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&h=300&fit=crop', 10),
      ('카페라떼', '부드러운 우유와 에스프레소의 조화', 5000, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop', 10),
      ('카푸치노', '에스프레소와 스팀 밀크, 우유 거품', 5000, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop', 10),
      ('카라멜 마키아토', '카라멜 시럽이 들어간 달콤한 커피', 6000, 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&h=300&fit=crop', 10),
      ('바닐라 라떼', '바닐라 시럽이 들어간 부드러운 라떼', 5500, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop', 10)
      RETURNING id, name
    `);

    console.log('메뉴 데이터가 삽입되었습니다.');

    // 옵션 데이터 삽입 (모든 메뉴에 동일한 옵션 추가)
    for (const menu of menuResult.rows) {
      await client.query(`
        INSERT INTO options (name, price, menu_id) VALUES
        ('샷 추가', 500, $1),
        ('시럽 추가', 0, $1)
      `, [menu.id]);
    }

    console.log('옵션 데이터가 삽입되었습니다.');
    console.log('시드 데이터 생성이 완료되었습니다.');

    await client.end();
  } catch (error) {
    console.error('시드 데이터 생성 중 오류 발생:', error.message);
    process.exit(1);
  }
};

seedData();

