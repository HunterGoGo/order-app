import './OrderList.css';

function OrderList({ orders, onUpdateOrderStatus, onCompleteOrder }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${month}월 ${day}일 ${hours}:${minutes}`;
  };

  const formatOrderItems = (items) => {
    return items.map(item => {
      const optionsText = item.options && item.options.length > 0
        ? ` (${item.options.map(opt => opt.name).join(', ')})`
        : '';
      return `${item.menuName}${optionsText} x ${item.quantity}`;
    }).join(', ');
  };

  const getStatusButton = (order) => {
    if (order.status === '주문 접수') {
      return (
        <button 
          className="status-btn receive-btn"
          onClick={() => onUpdateOrderStatus(order.id, '제조 중')}
        >
          제조 시작
        </button>
      );
    } else if (order.status === '제조 중') {
      return (
        <button 
          className="status-btn manufacturing-btn"
          onClick={() => {
            onCompleteOrder(order);
          }}
        >
          제조 완료
        </button>
      );
    } else if (order.status === '제조 완료') {
      return (
        <button 
          className="status-btn completed-btn"
          disabled
        >
          제조 완료
        </button>
      );
    }
    return null;
  };

  if (orders.length === 0) {
    return (
      <div className="order-list">
        <h2 className="order-list-title">주문 현황</h2>
        <p className="empty-orders">주문이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="order-list">
      <h2 className="order-list-title">주문 현황</h2>
      <div className="orders">
        {orders.map(order => (
          <div key={order.id} className="order-item">
            <div className="order-info">
              <div className="order-time">{formatDate(order.orderTime)}</div>
              <div className="order-content">{formatOrderItems(order.items)}</div>
              <div className="order-price">{order.totalPrice.toLocaleString()}원</div>
            </div>
            <div className="order-action">
              {getStatusButton(order)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrderList;

