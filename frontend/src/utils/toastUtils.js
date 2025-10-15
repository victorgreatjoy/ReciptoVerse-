import { toast } from "react-hot-toast";

// Simple toast notification functions without JSX
export const showToast = {
  success: (message, title = "Success") => {
    toast.success(message, {
      duration: 4000,
      style: {
        background: "#2E8B57",
        color: "#fff",
        borderRadius: "8px",
        padding: "12px 16px",
      },
      iconTheme: {
        primary: "#2E8B57",
        secondary: "#fff",
      },
    });
  },

  error: (message, title = "Error") => {
    toast.error(message, {
      duration: 6000,
      style: {
        background: "#D4654F",
        color: "#fff",
        borderRadius: "8px",
        padding: "12px 16px",
      },
      iconTheme: {
        primary: "#D4654F",
        secondary: "#fff",
      },
    });
  },

  info: (message, title = "Info") => {
    toast(message, {
      duration: 4000,
      icon: "ℹ️",
      style: {
        background: "#3B82F6",
        color: "#fff",
        borderRadius: "8px",
        padding: "12px 16px",
      },
    });
  },

  warning: (message, title = "Warning") => {
    toast(message, {
      duration: 5000,
      icon: "⚠️",
      style: {
        background: "#F59E0B",
        color: "#fff",
        borderRadius: "8px",
        padding: "12px 16px",
      },
    });
  },

  // Quick methods without titles
  simpleSuccess: (message) => {
    toast.success(message, {
      duration: 3000,
      style: {
        background: "#2E8B57",
        color: "#fff",
        borderRadius: "8px",
        padding: "12px 16px",
      },
    });
  },

  simpleError: (message) => {
    toast.error(message, {
      duration: 4000,
      style: {
        background: "#D4654F",
        color: "#fff",
        borderRadius: "8px",
        padding: "12px 16px",
      },
    });
  },

  simpleInfo: (message) => {
    toast(message, {
      duration: 3000,
      icon: "ℹ️",
      style: {
        background: "#3B82F6",
        color: "#fff",
        borderRadius: "8px",
        padding: "12px 16px",
      },
    });
  },
};
