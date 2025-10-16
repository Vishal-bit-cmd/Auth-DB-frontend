export default function Navbar({ toggleSidebar, logout, user }) {
  return (
    <nav
      className="d-flex justify-content-between align-items-center px-4"
      style={{
        height: "60px",
        backgroundColor: "#fff",
        borderBottom: "1px solid #ddd",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1500,
      }}
    >
      {/* Hamburger for mobile */}
      <button
        className="btn btn-outline-primary d-md-none"
        onClick={toggleSidebar}
      >
        ☰
      </button>

      <h5 className="m-0 d-none d-md-block">Dashboard</h5>

      <div className="d-flex align-items-center gap-3">
        <div className="text-end">
          <div>{user?.username || "Guest"}</div>
          <div className="text-muted small">{user?.role || "viewer"}</div>
        </div>
        <button className="btn btn-danger btn-sm" onClick={logout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
