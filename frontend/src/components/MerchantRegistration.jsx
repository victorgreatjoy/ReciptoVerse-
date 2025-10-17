import React, { useState } from "react";
import { useUser } from "../contexts/UserContext";
import "./MerchantRegistration.css";

const MerchantRegistration = () => {
  const { API_BASE } = useUser();
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
    taxId: "",
    websiteUrl: "",
    contactPerson: "",
    subscriptionPlan: "basic",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState("");

  const businessTypes = [
    "Restaurant & Food Service",
    "Retail Store",
    "Grocery Store",
    "Gas Station",
    "Pharmacy",
    "Clothing & Apparel",
    "Electronics",
    "Home & Garden",
    "Health & Beauty",
    "Entertainment",
    "Professional Services",
    "Other",
  ];

  const subscriptionPlans = [
    { value: "basic", label: "Basic (1,000 receipts/month)", price: "$0" },
    {
      value: "professional",
      label: "Professional (5,000 receipts/month)",
      price: "$29",
    },
    {
      value: "enterprise",
      label: "Enterprise (Unlimited receipts)",
      price: "$99",
    },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/api/merchants/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data);
        setFormData({
          businessName: "",
          businessType: "",
          email: "",
          phone: "",
          address: "",
          city: "",
          state: "",
          postalCode: "",
          country: "US",
          taxId: "",
          websiteUrl: "",
          contactPerson: "",
          subscriptionPlan: "basic",
        });
      } else {
        setError(data.message || "Registration failed");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="merchant-registration">
        <div className="registration-success">
          <div className="success-icon">✅</div>
          <h2>Registration Successful!</h2>
          <p>Your merchant account has been submitted for approval.</p>

          <div className="credentials-box">
            <h3>🔑 Your Merchant Credentials</h3>
            <div className="credential-item">
              <label>Terminal ID:</label>
              <div className="credential-value">
                <code>{success.merchant.terminalId}</code>
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(success.merchant.terminalId)
                  }
                >
                  📋 Copy
                </button>
              </div>
            </div>
            <div className="credential-item">
              <label>API Key:</label>
              <div className="credential-value">
                <code>{success.merchant.apiKey}</code>
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(success.merchant.apiKey)
                  }
                >
                  📋 Copy
                </button>
              </div>
            </div>
          </div>

          <div className="instructions">
            <h3>📋 Next Steps:</h3>
            <ul>
              {success.instructions.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ul>
          </div>

          <div className="actions">
            <button
              onClick={() => setSuccess(null)}
              className="secondary-button"
            >
              Register Another Merchant
            </button>
            <button
              className="primary-button"
              onClick={() => {
                // Store API key for dashboard access
                localStorage.setItem("merchantApiKey", success.merchant.apiKey);
                window.location.href = "#dashboard";
              }}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="merchant-registration">
      <div className="registration-container">
        <div className="registration-header">
          <h1>🏪 Merchant Registration</h1>
          <p>
            Join ReceiptoVerse and start providing digital receipts to your
            customers
          </p>
        </div>

        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-section">
            <h3>Business Information</h3>

            <div className="form-group">
              <label htmlFor="businessName">Business Name *</label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                required
                placeholder="Enter your business name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="businessType">Business Type *</label>
              <select
                id="businessType"
                name="businessType"
                value={formData.businessType}
                onChange={handleInputChange}
                required
              >
                <option value="">Select business type</option>
                {businessTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Business Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="business@example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Business Address</h3>

            <div className="form-group">
              <label htmlFor="address">Street Address</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="123 Main Street"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="New York"
                />
              </div>

              <div className="form-group">
                <label htmlFor="state">State/Province</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="NY"
                />
              </div>

              <div className="form-group">
                <label htmlFor="postalCode">Postal Code</label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  placeholder="10001"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Additional Information</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="taxId">Tax ID / EIN</label>
                <input
                  type="text"
                  id="taxId"
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleInputChange}
                  placeholder="12-3456789"
                />
              </div>

              <div className="form-group">
                <label htmlFor="websiteUrl">Website URL</label>
                <input
                  type="url"
                  id="websiteUrl"
                  name="websiteUrl"
                  value={formData.websiteUrl}
                  onChange={handleInputChange}
                  placeholder="https://www.yourbusiness.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="contactPerson">Primary Contact Person *</label>
              <input
                type="text"
                id="contactPerson"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleInputChange}
                required
                placeholder="John Smith"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Subscription Plan</h3>

            <div className="subscription-plans">
              {subscriptionPlans.map((plan) => (
                <label
                  key={plan.value}
                  className={`plan-option ${
                    formData.subscriptionPlan === plan.value ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="subscriptionPlan"
                    value={plan.value}
                    checked={formData.subscriptionPlan === plan.value}
                    onChange={handleInputChange}
                  />
                  <div className="plan-details">
                    <div className="plan-name">{plan.label}</div>
                    <div className="plan-price">{plan.price}/month</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {error && <div className="error-message">❌ {error}</div>}

          <div className="form-actions">
            <button type="submit" disabled={loading} className="submit-button">
              {loading ? "⏳ Registering..." : "🚀 Register Merchant"}
            </button>
          </div>
        </form>

        <div className="registration-info">
          <h3>Why Join ReceiptoVerse?</h3>
          <ul>
            <li>🌍 Go paperless and reduce environmental impact</li>
            <li>📱 Provide customers with instant digital receipts</li>
            <li>📊 Access detailed transaction analytics</li>
            <li>🎯 Reduce customer checkout time</li>
            <li>💰 Potential cost savings on paper and printing</li>
            <li>🔒 Secure and GDPR compliant</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MerchantRegistration;
