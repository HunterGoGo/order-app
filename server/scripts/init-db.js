import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pkg;

// 데이터베이스 생성 스크립트
const createDatabase = async () => {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: 'postgres', // 기본 데이터베이스에 연결
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  });

  try {
    await client.connect();
    console.log('PostgreSQL에 연결되었습니다.');

    const dbName = process.env.DB_NAME || 'order_app';
    
    // 데이터베이스 존재 여부 확인
    const checkDb = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (checkDb.rows.length === 0) {
      // 데이터베이스 생성
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`데이터베이스 '${dbName}'가 생성되었습니다.`);
    } else {
      console.log(`데이터베이스 '${dbName}'가 이미 존재합니다.`);
    }

    await client.end();
  } catch (error) {
    console.error('데이터베이스 생성 중 오류 발생:', error.message);
    process.exit(1);
  }
};

createDatabase();

