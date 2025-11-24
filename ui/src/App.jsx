import { useState, useEffect } from 'react';
import Header from './components/Header';
import MenuCard from './components/MenuCard';
import ShoppingCart from './components/ShoppingCart';
import AdminDashboard from './components/AdminDashboard';
import InventorySection from './components/InventorySection';
import OrderList from './components/OrderList';
import './App.css';

// 임시 메뉴 데이터
const menuData = [
  {
    id: 1,
    name: '아메리카노(ICE)',
    price: 4000,
    description: '시원한 아이스 아메리카노',
    imageUrl: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&h=300&fit=crop',
    options: [
      { id: 1, name: '샷 추가', price: 500 },
      { id: 2, name: '시럽 추가', price: 0 }
    ]
  },
  {
    id: 2,
    name: '아메리카노(HOT)',
    price: 4000,
    description: '따뜻한 핫 아메리카노',
    imageUrl: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&h=300&fit=crop',
    options: [
      { id: 1, name: '샷 추가', price: 500 },
      { id: 2, name: '시럽 추가', price: 0 }
    ]
  },
  {
    id: 3,
    name: '카페라떼',
    price: 5000,
    description: '부드러운 우유와 에스프레소의 조화',
    imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop',
    options: [
      { id: 1, name: '샷 추가', price: 500 },
      { id: 2, name: '시럽 추가', price: 0 }
    ]
  },
  {
    id: 4,
    name: '카푸치노',
    price: 5000,
    description: '에스프레소와 스팀 밀크, 우유 거품',
    imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop',
    options: [
      { id: 1, name: '샷 추가', price: 500 },
      { id: 2, name: '시럽 추가', price: 0 }
    ]
  },
  {
    id: 5,
    name: '카라멜 마키아토',
    price: 6000,
    description: '카라멜 시럽이 들어간 달콤한 커피',
    imageUrl: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&h=300&fit=crop',
    options: [
      { id: 1, name: '샷 추가', price: 500 },
      { id: 2, name: '시럽 추가', price: 0 }
    ]
  },
  {
    id: 6,
    name: '바닐라 라떼',
    price: 5500,
    description: '바닐라 시럽이 들어간 부드러운 라떼',
    imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop',
    options: [
      { id: 1, name: '샷 추가', price: 500 },
      { id: 2, name: '시럽 추가', price: 0 }
    ]
  }
];

function App() {
  const [currentPage, setCurrentPage] = useState('order');
  const [cartItems, setCartItems] = useState([]);
  
  // 관리자 화면 상태
  const [inventories, setInventories] = useState([
    { menuId: 1, menuName: '아메리카노(ICE)', stock: 10 },
    { menuId: 2, menuName: '아메리카노(HOT)', stock: 10 },
    { menuId: 3, menuName: '카페라떼', stock: 10 },
    { menuId: 4, menuName: '카푸치노', stock: 10 },
    { menuId: 5, menuName: '카라멜 마키아토', stock: 10 },
    { menuId: 6, menuName: '바닐라 라떼', stock: 10 }
  ]);
  
  const [orders, setOrders] = useState([]);
  
  // 주문 ID 카운터 (실제로는 서버에서 관리)
  const [orderIdCounter, setOrderIdCounter] = useState(1);

  const [showOrderModal, setShowOrderModal] = useState(false); // 주문 완료 모달
  const [orderModalMessage, setOrderModalMessage] = useState(''); // 주문 완료 메시지

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

  const handleOrder = () => {
    if (cartItems.length === 0) {
      alert('장바구니가 비어있습니다.');
      return;
    }

    // 재고 확인
    const insufficientStockItems = [];
    cartItems.forEach(item => {
      const inventory = inventories.find(inv => inv.menuId === item.menuId);
      if (!inventory || inventory.stock < item.quantity) {
        insufficientStockItems.push({
          menuName: item.menuName,
          required: item.quantity,
          available: inventory ? inventory.stock : 0
        });
      }
    });

    if (insufficientStockItems.length > 0) {
      const message = insufficientStockItems
        .map(item => `${item.menuName}: 필요 ${item.required}개, 재고 ${item.available}개`)
        .join('\n');
      alert(`재고가 부족합니다:\n${message}`);
      return;
    }

    // 주문 생성
    const totalPrice = cartItems.reduce((sum, item) => {
      const itemPrice = item.basePrice + item.selectedOptions.reduce((optSum, opt) => optSum + opt.price, 0);
      return sum + (itemPrice * item.quantity);
    }, 0);

    const newOrder = {
      id: orderIdCounter,
      orderTime: new Date().toISOString(),
      items: cartItems.map(item => ({
        menuId: item.menuId,
        menuName: item.menuName,
        quantity: item.quantity,
        options: item.selectedOptions,
        price: item.basePrice + item.selectedOptions.reduce((sum, opt) => sum + opt.price, 0)
      })),
      totalPrice: totalPrice,
      status: '주문 접수'
    };

    setOrders([newOrder, ...orders]);
    setOrderIdCounter(orderIdCounter + 1);
    setOrderModalMessage(`주문 번호: ${orderIdCounter}\n총 금액: ${totalPrice.toLocaleString()}원`);
    setShowOrderModal(true); // 모달 띄움
    setCartItems([]);
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  // 재고 업데이트
  const handleUpdateStock = (menuId, newStock) => {
    setInventories(inventories.map(inv => 
      inv.menuId === menuId ? { ...inv, stock: newStock } : inv
    ));
  };

  // 주문 상태 업데이트
  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  // 주문 완료 처리 (재고 차감)
  const handleCompleteOrder = (order) => {
    // 주문된 각 메뉴의 재고 차감
    setInventories(prevInventories => {
      return prevInventories.map(inventory => {
        const orderItem = order.items.find(item => item.menuId === inventory.menuId);
        if (orderItem) {
          return {
            ...inventory,
            stock: Math.max(0, inventory.stock - orderItem.quantity)
          };
        }
        return inventory;
      });
    });
  };

  // 대시보드 통계 계산
  const dashboardStats = {
    totalOrders: orders.length,
    receivedOrders: orders.filter(o => o.status === '주문 접수').length,
    manufacturingOrders: orders.filter(o => o.status === '제조 중').length,
    completedOrders: orders.filter(o => o.status === '제조 완료').length
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
            <div className="menu-grid">
              {menuData.map(menu => (
                <MenuCard 
                  key={menu.id} 
                  menu={menu} 
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
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

