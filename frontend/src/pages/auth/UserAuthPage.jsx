import React, { useState } from "react";
import AuthModalNew from "../../components/AuthModalNew";
import EmailVerification from "../../components/EmailVerification";
import { useNavigate } from "react-router-dom";

export default function UserAuthPage() {
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const navigate = useNavigate();

  const handleVerificationRequired = (email) => {
    setPendingEmail(email);
    setShowVerificationModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <AuthModalNew
        isOpen={true}
        onClose={() => navigate("/")}
        mode="login"
        selectedRole="user"
        onVerificationRequired={handleVerificationRequired}
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
