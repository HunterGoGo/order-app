import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pkg;

// 데이터베이스 연결 테스트
const testConnection = async () => {
  console.log('=== 데이터베이스 연결 테스트 ===\n');
  
  // 환경 변수 확인
  console.log('환경 변수 확인:');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? '설정됨' : '미설정');
  console.log('DB_HOST:', process.env.DB_HOST || '미설정');
  console.log('DB_PORT:', process.env.DB_PORT || '미설정');
  console.log('DB_NAME:', process.env.DB_NAME || '미설정');
  console.log('DB_USER:', process.env.DB_USER || '미설정');
  console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '설정됨' : '미설정');
  console.log('NODE_ENV:', process.env.NODE_ENV || '미설정');
  console.log('');

  // DATABASE_URL이 있으면 파싱하여 사용
  let dbConfig;
  if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL);
      dbConfig = {
        host: url.hostname,
        port: parseInt(url.port) || 5432,
        database: url.pathname.slice(1),
        user: url.username,
        password: url.password,
        ssl: { rejectUnauthorized: false },
      };
      console.log('DATABASE_URL을 사용하여 연결 시도...');
      console.log(`호스트: ${dbConfig.host}`);
      console.log(`포트: ${dbConfig.port}`);
      console.log(`데이터베이스: ${dbConfig.database}`);
      console.log(`사용자: ${dbConfig.user}`);
    } catch (error) {
      console.error('DATABASE_URL 파싱 오류:', error.message);
      return;
    }
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
    console.log('개별 환경 변수를 사용하여 연결 시도...');
    console.log(`호스트: ${dbConfig.host}`);
    console.log(`포트: ${dbConfig.port}`);
    console.log(`데이터베이스: ${dbConfig.database}`);
    console.log(`사용자: ${dbConfig.user}`);
    console.log(`SSL: ${dbConfig.ssl ? '활성화' : '비활성화'}`);
  }

  console.log('');

  const client = new Client(dbConfig);

  try {
    console.log('연결 시도 중...');
    await client.connect();
    console.log('✅ 데이터베이스 연결 성공!\n');

    // 간단한 쿼리 테스트
    const result = await client.query('SELECT NOW(), version()');
    console.log('서버 시간:', result.rows[0].now);
    console.log('PostgreSQL 버전:', result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1]);
    console.log('');

    // 테이블 존재 확인
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    if (tablesResult.rows.length > 0) {
      console.log('생성된 테이블:');
      tablesResult.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
    } else {
      console.log('⚠️  테이블이 없습니다. create-tables.js를 실행하세요.');
    }

    await client.end();
    console.log('\n✅ 연결 테스트 완료');
  } catch (error) {
    console.error('\n❌ 연결 실패:', error.message);
    console.error('\n오류 상세:');
    console.error('  코드:', error.code);
    console.error('  세부:', error.detail || '없음');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 해결 방법:');
      console.error('  - 호스트와 포트가 올바른지 확인');
      console.error('  - 데이터베이스 서버가 실행 중인지 확인');
    } else if (error.code === '28P01') {
      console.error('\n💡 해결 방법:');
      console.error('  - 사용자명과 비밀번호가 올바른지 확인');
    } else if (error.message.includes('SSL')) {
      console.error('\n💡 해결 방법:');
      console.error('  - Render.com 데이터베이스는 SSL이 필요합니다');
      console.error('  - ssl: { rejectUnauthorized: false } 설정 확인');
    } else if (error.code === 'ENOTFOUND') {
      console.error('\n💡 해결 방법:');
      console.error('  - 호스트명이 올바른지 확인');
      console.error('  - 네트워크 연결 확인');
    }
    
    process.exit(1);
  }
};

testConnection();

