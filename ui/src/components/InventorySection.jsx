import InventoryCard from './InventoryCard';
import './InventorySection.css';

function InventorySection({ inventories, onUpdateStock }) {
  return (
    <div className="inventory-section">
      <h2 className="inventory-title">재고 현황</h2>
      <div className="inventory-grid">
        {inventories.map(inventory => (
          <InventoryCard
            key={inventory.menuId}
            inventory={inventory}
            onUpdateStock={onUpdateStock}
          />
        ))}
      </div>
    </div>
  );
}

export default InventorySection;

