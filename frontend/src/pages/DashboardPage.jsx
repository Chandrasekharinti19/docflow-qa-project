import { useNavigate } from "react-router-dom";

function DashboardPage() {
  const user = JSON.parse(localStorage.getItem("docflowUser"));
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("docflowUser");
    navigate("/");
  };

  const handleGoToDocuments = () => {
    navigate("/documents");
  };

  return (
    <div style={{ padding: "24px", fontFamily: "Arial" }}>
      <h1 data-testid="dashboard-title">DocFlow Dashboard</h1>

      {user ? (
        <div>
          <p data-testid="user-name">Name: {user.name}</p>
          <p data-testid="user-email">Email: {user.email}</p>
          <p data-testid="user-role">Role: {user.role}</p>

          <button
            data-testid="go-documents-button"
            onClick={handleGoToDocuments}
            style={{ marginRight: "12px" }}
          >
            Go to Documents
          </button>

          <button data-testid="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      ) : (
        <p>No user logged in.</p>
      )}
    </div>
  );
}

export default DashboardPage;