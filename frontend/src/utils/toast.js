import { toast } from "react-hot-toast";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

// Custom toast component
const CustomToast = ({ t, type, title, message }) => {
  const icons = {
    success: <CheckCircleIcon className="h-5 w-5 text-accent-500" />,
    error: <ExclamationCircleIcon className="h-5 w-5 text-sunset-500" />,
    info: <InformationCircleIcon className="h-5 w-5 text-primary-500" />,
    warning: <ExclamationCircleIcon className="h-5 w-5 text-yellow-500" />,
  };

  const borderColors = {
    success: "border-l-accent-500",
    error: "border-l-sunset-500",
    info: "border-l-primary-500",
    warning: "border-l-yellow-500",
  };

  return (
    <div
      className={`${
        t.visible ? "animate-enter" : "animate-leave"
      } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-4 ${
        borderColors[type]
      }`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">{icons[type]}</div>
          <div className="ml-3 flex-1">
            {title && (
              <p className="text-sm font-medium text-earth-900">{title}</p>
            )}
            <p className={`text-sm text-earth-500 ${title ? "mt-1" : ""}`}>
              {message}
            </p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-earth-200">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-earth-600 hover:text-earth-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Toast notification functions
export const showToast = {
  success: (message, title = "Success") => {
    toast.custom(
      (t) => (
        <CustomToast t={t} type="success" title={title} message={message} />
      ),
      {
        duration: 4000,
      }
    );
  },

  error: (message, title = "Error") => {
    toast.custom(
      (t) => <CustomToast t={t} type="error" title={title} message={message} />,
      {
        duration: 6000,
      }
    );
  },

  info: (message, title = "Info") => {
    toast.custom(
      (t) => <CustomToast t={t} type="info" title={title} message={message} />,
      {
        duration: 4000,
      }
    );
  },

  warning: (message, title = "Warning") => {
    toast.custom(
      (t) => (
        <CustomToast t={t} type="warning" title={title} message={message} />
      ),
      {
        duration: 5000,
      }
    );
  },

  // Quick methods without titles
  simpleSuccess: (message) => {
    toast.custom(
      (t) => <CustomToast t={t} type="success" message={message} />,
      {
        duration: 3000,
      }
    );
  },

  simpleError: (message) => {
    toast.custom((t) => <CustomToast t={t} type="error" message={message} />, {
      duration: 4000,
    });
  },

  simpleInfo: (message) => {
    toast.custom((t) => <CustomToast t={t} type="info" message={message} />, {
      duration: 3000,
    });
  },
};
