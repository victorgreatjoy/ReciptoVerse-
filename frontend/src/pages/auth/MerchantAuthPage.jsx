import React, { useState } from "react";
import AuthModalNew from "../../components/AuthModalNew";
import EmailVerification from "../../components/EmailVerification";
import { useNavigate } from "react-router-dom";

export default function MerchantAuthPage() {
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const navigate = useNavigate();

  const handleVerificationRequired = (email) => {
    setPendingEmail(email);
    setShowVerificationModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-4">
      <AuthModalNew
        isOpen={true}
        onClose={() => navigate("/")}
        mode="login"
        selectedRole="merchant"
        onVerificationRequired={handleVerificationRequired}
        onMerchantRegistrationComplete={() => {
          // After merchant registers as a user, they should proceed to merchant application from the main app
          navigate("/", { replace: true });
        }}
      />

      <EmailVerification
        email={pendingEmail}
        isOpen={showVerificationModal}
        onClose={() => {
          setShowVerificationModal(false);
          setPendingEmail("");
        }}
      />
    </div>
  );
}
