import './AdminDashboard.css';

function AdminDashboard({ stats }) {
  return (
    <div className="admin-dashboard">
      <h2 className="dashboard-title">관리자 대시보드</h2>
      <div className="dashboard-stats">
        <div className="stat-card">
          <span className="stat-label">총 주문</span>
          <span className="stat-value">{stats.totalOrders}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">주문 접수</span>
          <span className="stat-value">{stats.receivedOrders}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">제조 중</span>
          <span className="stat-value">{stats.manufacturingOrders}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">제조 완료</span>
          <span className="stat-value">{stats.completedOrders}</span>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

