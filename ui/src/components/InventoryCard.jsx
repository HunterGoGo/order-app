import './InventoryCard.css';

function InventoryCard({ inventory, onUpdateStock }) {
  const getStockStatus = (stock) => {
    if (stock === 0) return { text: '품절', color: '#ef4444' };
    if (stock < 5) return { text: '주의', color: '#f59e0b' };
    return { text: '정상', color: '#10b981' };
  };

  const status = getStockStatus(inventory.stock);

  const handleIncrease = () => {
    onUpdateStock(inventory.menuId, inventory.stock + 1);
  };

  const handleDecrease = () => {
    if (inventory.stock > 0) {
      onUpdateStock(inventory.menuId, inventory.stock - 1);
    }
  };

  return (
    <div className="inventory-card">
      <div className="inventory-main-info">
        <h3 className="inventory-menu-name">{inventory.menuName}</h3>
        <span className="stock-quantity">{inventory.stock}개</span>
        <button 
          className="stock-status-btn" 
          style={{ 
            backgroundColor: status.color === '#ef4444' ? '#fee2e2' : status.color === '#f59e0b' ? '#fef3c7' : '#d1fae5',
            color: status.color === '#ef4444' ? '#991b1b' : status.color === '#f59e0b' ? '#92400e' : '#065f46',
            borderColor: status.color
          }}
          disabled
        >
          {status.text}
        </button>
      </div>
      <div className="stock-controls">
        <button 
          className="stock-btn decrease-btn" 
          onClick={handleDecrease}
          disabled={inventory.stock === 0}
          aria-label="재고 감소"
        >
          -
        </button>
        <button 
          className="stock-btn increase-btn" 
          onClick={handleIncrease}
          aria-label="재고 증가"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default InventoryCard;

