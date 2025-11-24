const API_BASE_URL = 'http://localhost:3000/api';

// 메뉴 목록 조회
export const fetchMenus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/menus`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `메뉴 조회에 실패했습니다. (${response.status})`);
    }
    return response.json();
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
    }
    throw error;
  }
};

// 주문 생성
export const createOrder = async (items) => {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '주문 생성에 실패했습니다.');
  }
  return response.json();
};

// 주문 정보 조회
export const fetchOrder = async (orderId) => {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);
  if (!response.ok) {
    throw new Error('주문 조회에 실패했습니다.');
  }
  return response.json();
};

// 대시보드 통계 조회
export const fetchDashboardStats = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/dashboard`);
  if (!response.ok) {
    throw new Error('대시보드 통계 조회에 실패했습니다.');
  }
  return response.json();
};

// 재고 조회
export const fetchInventory = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/inventory`);
  if (!response.ok) {
    throw new Error('재고 조회에 실패했습니다.');
  }
  return response.json();
};

// 재고 업데이트
export const updateInventory = async (menuId, stock) => {
  const response = await fetch(`${API_BASE_URL}/admin/inventory/${menuId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ stock }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '재고 업데이트에 실패했습니다.');
  }
  return response.json();
};

// 주문 목록 조회
export const fetchOrders = async (status = null) => {
  const url = status 
    ? `${API_BASE_URL}/admin/orders?status=${encodeURIComponent(status)}`
    : `${API_BASE_URL}/admin/orders`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('주문 목록 조회에 실패했습니다.');
  }
  return response.json();
};

// 주문 상태 업데이트
export const updateOrderStatus = async (orderId, status) => {
  const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '주문 상태 업데이트에 실패했습니다.');
  }
  return response.json();
};

// 주문 완료 처리
export const completeOrder = async (orderId) => {
  const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/complete`, {
    method: 'POST',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '주문 완료 처리에 실패했습니다.');
  }
  return response.json();
};

