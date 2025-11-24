import './ShoppingCart.css';

function ShoppingCart({ cartItems, onOrder, onUpdateQuantity, onRemoveItem, onClearCart }) {
  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => {
      const itemPrice = item.basePrice + item.selectedOptions.reduce((optSum, opt) => optSum + opt.price, 0);
      return sum + (itemPrice * item.quantity);
    }, 0);
  };

  const formatItemName = (item) => {
    const optionsText = item.selectedOptions.length > 0
      ? ` (${item.selectedOptions.map(opt => opt.name).join(', ')})`
      : '';
    return `${item.menuName}${optionsText}`;
  };

  const getItemPrice = (item) => {
    const basePrice = item.basePrice;
    const optionsPrice = item.selectedOptions.reduce((sum, opt) => sum + opt.price, 0);
    return (basePrice + optionsPrice) * item.quantity;
  };

  return (
    <div className="shopping-cart">
      <h2 className="cart-title">장바구니</h2>
      {cartItems.length === 0 ? (
        <p className="empty-cart">장바구니가 비어있습니다.</p>
      ) : (
        <div className="cart-content">
          <div className="cart-items-section">
            <div className="cart-items">
              {cartItems.map((item, index) => (
                <div key={index} className="cart-item">
                  <span className="item-name">{formatItemName(item)}</span>
                  <div className="quantity-controls">
                    <button 
                      className="quantity-btn" 
                      onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                      aria-label="수량 감소"
                    >
                      -
                    </button>
                    <span className="item-quantity">{item.quantity}</span>
                    <button 
                      className="quantity-btn" 
                      onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                      aria-label="수량 증가"
                    >
                      +
                    </button>
                  </div>
                  <span className="item-price">{getItemPrice(item).toLocaleString()}원</span>
                  <button 
                    className="remove-btn" 
                    onClick={() => onRemoveItem(index)}
                    aria-label="아이템 제거"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="cart-summary-section">
            <div className="cart-total">
              <span>총 금액</span>
              <span className="total-amount">{calculateTotal().toLocaleString()}원</span>
            </div>
            <button 
              className="order-btn" 
              onClick={onOrder}
              disabled={cartItems.length === 0}
              aria-label="주문하기"
            >
              주문하기
            </button>
            <button 
              className="clear-cart-btn" 
              onClick={onClearCart}
              disabled={cartItems.length === 0}
              aria-label="장바구니 전체 비우기"
            >
              전체 비우기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShoppingCart;


