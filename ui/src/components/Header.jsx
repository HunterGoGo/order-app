import './Header.css';

function Header({ currentPage, onNavigate }) {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">COZY</div>
        <div className="nav-buttons">
          <button 
            className={`nav-button ${currentPage === 'order' ? 'active' : ''}`}
            onClick={() => onNavigate('order')}
          >
            주문하기
          </button>
          <button 
            className={`nav-button ${currentPage === 'admin' ? 'active' : ''}`}
            onClick={() => onNavigate('admin')}
          >
            관리자
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;

