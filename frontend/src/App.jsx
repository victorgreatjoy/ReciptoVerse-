import { UserProvider } from "./contexts/UserContext";
import { WebSocketProvider } from "./contexts/WebSocketContext";
import { ToastProvider } from "./components/ui";
import AppContent from "./components/AppContent";
import "./App.css";

// Add error boundary logging
console.log("🚀 ReceiptoVerse App starting...");

function App() {
  return (
    <ToastProvider>
      <UserProvider>
        <WebSocketProvider>
          <AppContent />
        </WebSocketProvider>
      </UserProvider>
    </ToastProvider>
  );
}

export default App;
