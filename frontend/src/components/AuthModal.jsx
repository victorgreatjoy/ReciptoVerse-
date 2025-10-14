import { useState, useEffect } from "react";
import { useUser } from "../contexts/UserContext";
import "./AuthModal.css";

const AuthModal = ({ isOpen, onClose, mode: initialMode = "login" }) => {
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    desiredHandle: "",
    displayName: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login, register } = useUser();

  // Sync internal mode state with prop changes and reset form
  useEffect(() => {
    console.log("🔍 AuthModal received mode:", initialMode);
    setMode(initialMode);
    // Reset form when mode changes
    setFormData({
      email: "",
      password: "",
      desiredHandle: "",
      displayName: "",
    });
    setError("");
  }, [initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      let result;

      if (mode === "login") {
        result = await login(formData.email, formData.password);
      } else {
        // Validate registration fields
        if (!formData.desiredHandle.trim()) {
          setError("Please enter a username");
          setIsLoading(false);
          return;
        }

        result = await register(
          formData.email,
          formData.password,
          formData.desiredHandle,
          formData.displayName || formData.desiredHandle
        );
      }

      if (result.success) {
        onClose();
        // Reset form
        setFormData({
          email: "",
          password: "",
          desiredHandle: "",
          displayName: "",
        });
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setError("");
    setFormData({
      email: "",
      password: "",
      desiredHandle: "",
      displayName: "",
    });
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <h2>{mode === "login" ? "Welcome Back!" : "Join ReciptoVerse"}</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="auth-modal-content">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="your@email.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="••••••••"
                minLength="6"
              />
            </div>

            {mode === "register" && (
              <>
                <div className="form-group">
                  <label htmlFor="desiredHandle">Username</label>
                  <input
                    type="text"
                    id="desiredHandle"
                    name="desiredHandle"
                    value={formData.desiredHandle}
                    onChange={handleInputChange}
                    required
                    placeholder="@yourusername"
                    pattern="[a-zA-Z0-9]+"
                    title="Only letters and numbers allowed"
                  />
                  <small>Your unique handle (letters and numbers only)</small>
                </div>

                <div className="form-group">
                  <label htmlFor="displayName">Display Name (Optional)</label>
                  <input
                    type="text"
                    id="displayName"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    placeholder="Your Display Name"
                  />
                </div>
              </>
            )}

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={isLoading}
            >
              {isLoading
                ? "Please wait..."
                : mode === "login"
                ? "Sign In"
                : "Create Account"}
            </button>
          </form>

          <div className="auth-switch">
            {mode === "login" ? (
              <p>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={switchMode}
                  className="switch-mode-btn"
                >
                  Sign up here
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={switchMode}
                  className="switch-mode-btn"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>

          {mode === "register" && (
            <div className="auth-benefits">
              <h4>🎉 What you'll get:</h4>
              <ul>
                <li>🧾 Turn receipts into valuable NFTs</li>
                <li>💰 Earn RECV tokens with every purchase</li>
                <li>🏛️ Vote on platform decisions</li>
                <li>🎮 Access to exclusive games and rewards</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
