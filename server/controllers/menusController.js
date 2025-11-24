import pool from '../config/db.js';

// 메뉴 목록 조회
export const getMenus = async (req, res) => {
  try {
    // 메뉴 조회
    const menusResult = await pool.query(
      'SELECT id, name, description, price, image_url as "imageUrl", stock FROM menus ORDER BY id'
    );

    // 각 메뉴에 대한 옵션 조회
    const menus = await Promise.all(
      menusResult.rows.map(async (menu) => {
        const optionsResult = await pool.query(
          'SELECT id, name, price FROM options WHERE menu_id = $1 ORDER BY id',
          [menu.id]
        );
        return {
          ...menu,
          options: optionsResult.rows || []
        };
      })
    );

    console.log(`메뉴 조회 성공: ${menus.length}개 메뉴`);
    res.json(menus);
  } catch (error) {
    console.error('메뉴 조회 오류:', error);
    res.status(500).json({ 
      error: '메뉴 조회 중 오류가 발생했습니다.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

