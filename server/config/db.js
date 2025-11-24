import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

// 데이터베이스 연결 풀 생성
// Render.com에서는 DATABASE_URL 환경 변수를 제공할 수도 있음
const getDbConfig = () => {
  // SSL 필요 여부 확인 (Render.com 또는 프로덕션 환경)
  const needsSSL = () => {
    // DATABASE_URL이 render.com을 포함하면 SSL 필요
    if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('render.com')) {
      return true;
    }
    // DB_HOST가 render.com을 포함하면 SSL 필요
    if (process.env.DB_HOST && process.env.DB_HOST.includes('render.com')) {
      return true;
    }
    // 프로덕션 환경이면 SSL 필요
    if (process.env.NODE_ENV === 'production') {
      return true;
    }
    return false;
  };

  const sslConfig = needsSSL() ? { rejectUnauthorized: false } : false;

  // DATABASE_URL이 있으면 파싱하여 사용 (Render.com 형식)
  if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL);
      return {
        host: url.hostname,
        port: parseInt(url.port) || 5432,
        database: url.pathname.slice(1), // 첫 번째 '/' 제거
        user: url.username,
        password: url.password,
        ssl: sslConfig,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000, // Render.com은 연결 시간이 더 걸릴 수 있음
      };
    } catch (error) {
      console.error('DATABASE_URL 파싱 오류:', error.message);
      throw error;
    }
  }
  
  // 개별 환경 변수 사용
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'order_app',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: sslConfig,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };
};

const pool = new Pool(getDbConfig());

// 연결 테스트
pool.on('connect', () => {
  console.log('데이터베이스에 연결되었습니다.');
});

pool.on('error', (err) => {
  console.error('예상치 못한 데이터베이스 오류:', err);
  process.exit(-1);
});

// 데이터베이스 연결 테스트 함수
export const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('데이터베이스 연결 성공:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('데이터베이스 연결 실패:', error.message);
    return false;
  }
};

export default pool;

