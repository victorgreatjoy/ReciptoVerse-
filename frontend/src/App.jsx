import { UserProvider } from "./contexts/UserContext";
import { WalletProvider } from "./contexts/WalletContext";
import { WebSocketProvider } from "./contexts/WebSocketContext";
import AppContent from "./components/AppContent";
import "./App.css";

// Add error boundary logging
console.log("🚀 ReceiptoVerse App starting...");

function App() {
  return (
    <UserProvider>
      <WalletProvider>
        <WebSocketProvider>
          <AppContent />
        </WebSocketProvider>
      </WalletProvider>
    </UserProvider>
  );
}

export default App;
