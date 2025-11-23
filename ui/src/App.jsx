import { useState } from 'react';
import Header from './components/Header';
import MenuCard from './components/MenuCard';
import ShoppingCart from './components/ShoppingCart';
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

    // TODO: API 호출로 주문 전송
    console.log('주문하기:', cartItems);
    alert('주문이 완료되었습니다!');
    setCartItems([]);
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
    // 관리자 화면은 나중에 구현
    if (page === 'admin') {
      alert('관리자 화면은 준비 중입니다.');
    }
  };

  return (
    <div className="app">
      <Header currentPage={currentPage} onNavigate={handleNavigate} />
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
            />
          </div>
        </main>
      )}
    </div>
  );
}

export default App;
