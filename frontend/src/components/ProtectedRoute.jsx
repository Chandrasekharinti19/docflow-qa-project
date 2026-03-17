import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const user = localStorage.getItem("docflowUser");

  if (!user) {
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;