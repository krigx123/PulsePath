import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const Dashboard = ({ onNavigate }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [medicines, setMedicines] = useState([]);

  useEffect(() => {
    // Update time every 5 minutes instead of every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 300000); // 5 minutes

    // Load medicines from localStorage
    const savedMedicines = localStorage.getItem("medicines");
    if (savedMedicines) {
      setMedicines(JSON.parse(savedMedicines));
    }

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Check for medicine reminders
    const checkReminders = () => {
      const now = new Date();
      const currentTimeStr = now.toTimeString().slice(0, 5); // HH:MM format

      medicines.forEach((medicine) => {
        if (medicine.time === currentTimeStr && !medicine.takenToday) {
          toast.success(`🔔 Time to take ${medicine.name}!`, {
            duration: 6000,
            icon: "💊",
          });
        }
      });
    };

    checkReminders();
  }, [currentTime, medicines]);

  const features = [
    {
      id: "emergency",
      title: "🚑 Emergency Health Agent",
      description: "Quick access to hospitals and emergency contacts",
      color: "bg-red-500 hover:bg-red-600",
      textColor: "text-white",
    },
    {
      id: "medicine",
      title: "💊 Medicine Reminder",
      description: "Track medications and get timely reminders",
      color: "bg-green-500 hover:bg-green-600",
      textColor: "text-white",
    },
    {
      id: "stress",
      title: "🧠 Smart Stress Agent",
      description: "Advanced stress tracking with AI-powered insights",
      color: "bg-purple-500 hover:bg-purple-600",
      textColor: "text-white",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">
          <span className="text-blue-600">Pulse</span>Path
        </h1>
        <p className="text-xl text-gray-600 mb-2">Your Personal Health Companion</p>
        <p className="text-sm text-gray-500">Current Time: {currentTime.toLocaleTimeString()}</p>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {features.map((feature) => (
          <div
            key={feature.id}
            onClick={() => onNavigate(feature.id)}
            className={`${feature.color} ${feature.textColor} rounded-xl p-8 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl`}
          >
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
              <p className="text-lg opacity-90 mb-6">{feature.description}</p>
              <button className="bg-white bg-opacity-20 hover:bg-opacity-30 px-6 py-3 rounded-lg font-semibold transition-all duration-200">
                Get Started →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-16 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg p-6 shadow-md text-center">
          <h4 className="text-lg font-semibold text-gray-700 mb-2">Active Medicines</h4>
          <p className="text-3xl font-bold text-blue-600">{medicines.length}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-md text-center">
          <h4 className="text-lg font-semibold text-gray-700 mb-2">Health Score</h4>
          <p className="text-3xl font-bold text-green-600">85%</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-md text-center">
          <h4 className="text-lg font-semibold text-gray-700 mb-2">Days Active</h4>
          <p className="text-3xl font-bold text-purple-600">7</p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-16 text-gray-500">
        <p>© 2025 PulsePath - Taking care of your health, one pulse at a time</p>
      </div>
    </div>
  );
};

export default Dashboard;
