import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const data = await loginUser(email, password);
      localStorage.setItem("docflowUser", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div style={{ padding: "24px", fontFamily: "Arial" }}>
      <h1>DocFlow Login</h1>

      <form onSubmit={handleLogin} style={{ maxWidth: "400px" }}>
        <div style={{ marginBottom: "12px" }}>
          <label>Email</label>
          <br />
          <input
            data-testid="email-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label>Password</label>
          <br />
          <input
            data-testid="password-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <button data-testid="login-button" type="submit">
          Login
        </button>
      </form>

      {errorMessage && (
        <p data-testid="login-error" style={{ color: "red", marginTop: "12px" }}>
          {errorMessage}
        </p>
      )}
    </div>
  );
}

export default LoginPage;