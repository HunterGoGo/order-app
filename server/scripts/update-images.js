import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pkg;

// 이미지 URL 업데이트 스크립트
const updateImages = async () => {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'order_app',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  });

  try {
    await client.connect();
    console.log('데이터베이스에 연결되었습니다.');

    // 이미지 URL 매핑 (메뉴 이름 -> 이미지 경로)
    // 실제 파일명에 맞게 수정해주세요
    const imageMap = {
      '아메리카노(ICE)': '/images/americano-ice.jpg',
      '아메리카노(HOT)': '/images/americano-hot.jpg',
      '카페라떼': '/images/cafe-latte.jpg',
      '카푸치노': '/images/cappuccino.jpg',
      '카라멜 마키아토': '/images/caramel-macchiato.jpg',
      '바닐라 라떼': '/images/vanilla-latte.jpg'
    };

    // 각 메뉴의 이미지 URL 업데이트
    for (const [menuName, imageUrl] of Object.entries(imageMap)) {
      const result = await client.query(
        'UPDATE menus SET image_url = $1 WHERE name = $2',
        [imageUrl, menuName]
      );
      
      if (result.rowCount > 0) {
        console.log(`✓ ${menuName} 이미지 업데이트: ${imageUrl}`);
      } else {
        console.log(`✗ ${menuName} 메뉴를 찾을 수 없습니다.`);
      }
    }

    console.log('\n이미지 URL 업데이트가 완료되었습니다.');
    console.log('\n주의: 실제 이미지 파일명에 맞게 이 스크립트의 imageMap을 수정해주세요.');

    await client.end();
  } catch (error) {
    console.error('이미지 URL 업데이트 중 오류 발생:', error.message);
    process.exit(1);
  }
};

updateImages();

