import { useState } from 'react';
import './MenuCard.css';

function MenuCard({ menu, onAddToCart }) {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [imageError, setImageError] = useState(false);

  const handleOptionChange = (optionId, isChecked) => {
    if (isChecked) {
      setSelectedOptions([...selectedOptions, optionId]);
    } else {
      setSelectedOptions(selectedOptions.filter(id => id !== optionId));
    }
  };

  const handleAddToCart = () => {
    const selectedOptionsData = menu.options.filter(opt => 
      selectedOptions.includes(opt.id)
    );
    
    onAddToCart({
      menuId: menu.id,
      menuName: menu.name,
      basePrice: menu.price,
      selectedOptions: selectedOptionsData,
      quantity: 1
    });

    // 옵션 초기화
    setSelectedOptions([]);
  };

  return (
    <div className="menu-card">
      <div className="menu-image">
        {menu.imageUrl && !imageError ? (
          <img 
            src={menu.imageUrl} 
            alt={menu.name} 
            className="menu-img"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="image-placeholder">이미지</div>
        )}
      </div>
      <div className="menu-info">
        <h3 className="menu-name">{menu.name}</h3>
        <p className="menu-price">{menu.price.toLocaleString()}원</p>
        <p className="menu-description">{menu.description}</p>
        <div className="menu-options">
          {menu.options.map(option => (
            <label key={option.id} className="option-checkbox">
              <input
                type="checkbox"
                checked={selectedOptions.includes(option.id)}
                onChange={(e) => handleOptionChange(option.id, e.target.checked)}
              />
              <span>
                {option.name} {option.price > 0 ? `(+${option.price.toLocaleString()}원)` : ''}
              </span>
            </label>
          ))}
        </div>
        <button 
          className="add-to-cart-btn" 
          onClick={handleAddToCart}
          aria-label={`${menu.name} 장바구니에 추가`}
        >
          담기
        </button>
      </div>
    </div>
  );
}

export default MenuCard;

