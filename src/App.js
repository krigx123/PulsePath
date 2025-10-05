import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import Dashboard from "./components/Dashboard";
import EmergencyAgent from "./components/EmergencyAgent";
import MedicineReminder from "./components/MedicineReminder";
import StressAgent from "./components/StressAgent";
import "./App.css";

function App() {
  const [currentView, setCurrentView] = useState("dashboard");

  const renderCurrentView = () => {
    switch (currentView) {
      case "emergency":
        return <EmergencyAgent onBack={() => setCurrentView("dashboard")} />;
      case "medicine":
        return <MedicineReminder onBack={() => setCurrentView("dashboard")} />;
      case "stress":
        return <StressAgent onBack={() => setCurrentView("dashboard")} />;
      default:
        return <Dashboard onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            theme: {
              primary: "green",
              secondary: "black",
            },
          },
        }}
      />
      {renderCurrentView()}
    </div>
  );
}

export default App;
