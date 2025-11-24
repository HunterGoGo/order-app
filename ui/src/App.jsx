import { useState, useEffect } from 'react';
import Header from './components/Header';
import MenuCard from './components/MenuCard';
import ShoppingCart from './components/ShoppingCart';
import AdminDashboard from './components/AdminDashboard';
import InventorySection from './components/InventorySection';
import OrderList from './components/OrderList';
import {
  fetchMenus,
  createOrder as createOrderAPI,
  fetchInventory,
  updateInventory as updateInventoryAPI,
  fetchOrders,
  fetchDashboardStats,
  updateOrderStatus as updateOrderStatusAPI,
  completeOrder as completeOrderAPI
} from './services/api';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('order');
  const [cartItems, setCartItems] = useState([]);
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 관리자 화면 상태
  const [inventories, setInventories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalOrders: 0,
    receivedOrders: 0,
    manufacturingOrders: 0,
    completedOrders: 0
  });

  const [showOrderModal, setShowOrderModal] = useState(false); // 주문 완료 모달
  const [orderModalMessage, setOrderModalMessage] = useState(''); // 주문 완료 메시지

  // 메뉴 데이터 로드
  useEffect(() => {
    const loadMenus = async () => {
      try {
        setLoading(true);
        const menus = await fetchMenus();
        if (menus && menus.length > 0) {
          setMenuData(menus);
        } else {
          console.warn('메뉴 데이터가 비어있습니다.');
          setMenuData([]);
        }
      } catch (error) {
        console.error('메뉴 로드 오류:', error);
        alert(`메뉴를 불러오는데 실패했습니다: ${error.message}`);
        setMenuData([]);
      } finally {
        setLoading(false);
      }
    };
    loadMenus();
  }, []);

  // 관리자 화면 데이터 로드
  useEffect(() => {
    if (currentPage === 'admin') {
      const loadAdminData = async () => {
        try {
          const [inventoryData, ordersData, stats] = await Promise.all([
            fetchInventory(),
            fetchOrders(),
            fetchDashboardStats()
          ]);
          setInventories(inventoryData);
          setOrders(ordersData);
          setDashboardStats(stats);
        } catch (error) {
          console.error('관리자 데이터 로드 오류:', error);
          alert('데이터를 불러오는데 실패했습니다.');
        }
      };
      loadAdminData();
    }
  }, [currentPage]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showOrderModal) {
        setShowOrderModal(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showOrderModal]);

  const handleAddToCart = (item) => {
    // 동일한 메뉴와 옵션 조합 찾기
    const existingItemIndex = cartItems.findIndex(cartItem => {
      if (cartItem.menuId !== item.menuId) return false;
      if (cartItem.selectedOptions.length !== item.selectedOptions.length) return false;
      
      const cartOptions = cartItem.selectedOptions.map(opt => opt.id).sort();
      const itemOptions = item.selectedOptions.map(opt => opt.id).sort();
      
      return JSON.stringify(cartOptions) === JSON.stringify(itemOptions);
    });

    if (existingItemIndex >= 0) {
      // 기존 아이템 수량 증가
      const updatedCart = [...cartItems];
      updatedCart[existingItemIndex].quantity += 1;
      setCartItems(updatedCart);
    } else {
      // 새 아이템 추가
      setCartItems([...cartItems, item]);
    }
  };

  const handleUpdateQuantity = (index, newQuantity) => {
    if (newQuantity <= 0) {
      // 수량이 0 이하가 되면 아이템 제거
      const updatedCart = cartItems.filter((_, i) => i !== index);
      setCartItems(updatedCart);
    } else {
      const updatedCart = [...cartItems];
      updatedCart[index].quantity = newQuantity;
      setCartItems(updatedCart);
    }
  };

  const handleRemoveItem = (index) => {
    const updatedCart = cartItems.filter((_, i) => i !== index);
    setCartItems(updatedCart);
  };

  const handleOrder = async () => {
    if (cartItems.length === 0) {
      alert('장바구니가 비어있습니다.');
      return;
    }

    try {
      setLoading(true);
      // API로 주문 생성
      const orderItems = cartItems.map(item => ({
        menuId: item.menuId,
        menuName: item.menuName,
        quantity: item.quantity,
        options: item.selectedOptions.map(opt => ({
          id: opt.id,
          name: opt.name,
          price: opt.price
        })),
        basePrice: item.basePrice
      }));

      const newOrder = await createOrderAPI(orderItems);
      
      setOrderModalMessage(`주문 번호: ${newOrder.id}\n총 금액: ${newOrder.totalPrice.toLocaleString()}원`);
      setShowOrderModal(true);
      setCartItems([]);
      
      // 관리자 화면이면 주문 목록 새로고침
      if (currentPage === 'admin') {
        const [ordersData, stats] = await Promise.all([
          fetchOrders(),
          fetchDashboardStats()
        ]);
        setOrders(ordersData);
        setDashboardStats(stats);
      }
    } catch (error) {
      console.error('주문 생성 오류:', error);
      alert(error.message || '주문 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  // 재고 업데이트
  const handleUpdateStock = async (menuId, newStock) => {
    try {
      const updated = await updateInventoryAPI(menuId, newStock);
      setInventories(inventories.map(inv => 
        inv.menuId === menuId ? updated : inv
      ));
    } catch (error) {
      console.error('재고 업데이트 오류:', error);
      alert(error.message || '재고 업데이트에 실패했습니다.');
    }
  };

  // 주문 상태 업데이트
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatusAPI(orderId, newStatus);
      
      // 주문 목록 새로고침
      const [ordersData, stats] = await Promise.all([
        fetchOrders(),
        fetchDashboardStats()
      ]);
      setOrders(ordersData);
      setDashboardStats(stats);
    } catch (error) {
      console.error('주문 상태 업데이트 오류:', error);
      alert(error.message || '주문 상태 업데이트에 실패했습니다.');
    }
  };

  // 주문 완료 처리 (재고 차감)
  const handleCompleteOrder = async (order) => {
    try {
      // completeOrder API가 상태를 "제조 완료"로 업데이트하고 재고를 차감합니다
      await completeOrderAPI(order.id);
      
      // 데이터 새로고침
      const [inventoryData, ordersData, stats] = await Promise.all([
        fetchInventory(),
        fetchOrders(),
        fetchDashboardStats()
      ]);
      setInventories(inventoryData);
      setOrders(ordersData);
      setDashboardStats(stats);
    } catch (error) {
      console.error('주문 완료 처리 오류:', error);
      alert(error.message || '주문 완료 처리에 실패했습니다.');
    }
  };

  return (
    <div className="app">
      <Header currentPage={currentPage} onNavigate={handleNavigate} />
      {/* 주문 완료 모달 */}
      {showOrderModal && (
        <div className="modal-overlay" onClick={() => setShowOrderModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>주문이 완료되었습니다!</h3>
            <p className="modal-message" style={{ whiteSpace: 'pre-line', marginBottom: '1rem', color: '#4b5563' }}>
              {orderModalMessage}
            </p>
            <button className="modal-close-btn" onClick={() => setShowOrderModal(false)}>확인</button>
          </div>
        </div>
      )}
      {currentPage === 'order' && (
        <main className="main-content">
          <div className="menu-section">
            {loading ? (
              <p>메뉴를 불러오는 중...</p>
            ) : menuData.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                메뉴가 없습니다. 데이터베이스에 메뉴 데이터를 추가해주세요.
              </p>
            ) : (
              <div className="menu-grid">
                {menuData.map(menu => (
                  <MenuCard 
                    key={menu.id} 
                    menu={menu} 
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="cart-section">
            <ShoppingCart 
              cartItems={cartItems} 
              onOrder={handleOrder}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onClearCart={() => setCartItems([])}
            />
          </div>
        </main>
      )}
      {currentPage === 'admin' && (
        <main className="main-content">
          <AdminDashboard stats={dashboardStats} />
          <InventorySection 
            inventories={inventories} 
            onUpdateStock={handleUpdateStock}
          />
          <OrderList 
            orders={orders} 
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onCompleteOrder={handleCompleteOrder}
          />
        </main>
      )}
    </div>
  );
}

export default App;

