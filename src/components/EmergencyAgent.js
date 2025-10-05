import React, { useState } from "react";
import { toast } from "react-hot-toast";

const EmergencyAgent = ({ onBack }) => {
  const [emergencyContact, setEmergencyContact] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const openHospitalMaps = () => {
    const mapsUrl = "https://www.google.com/maps/search/hospitals+near+me";
    window.open(mapsUrl, "_blank");
    toast.success("🗺️ Opening hospital locations nearby!");
  };

  const sendEmergencyAlert = async () => {
    if (!emergencyContact.trim()) {
      toast.error("Please enter an emergency contact first!");
      return;
    }

    setIsLoading(true);

    // Simulate sending message (replace with actual Twilio integration)
    setTimeout(() => {
      toast.success(`🚨 Emergency alert sent to ${emergencyContact}!`, {
        duration: 5000,
        icon: "📱",
      });
      setIsLoading(false);
    }, 2000);
  };

  const quickActions = [
    {
      title: "Call 911",
      description: "Emergency services",
      action: () => {
        window.open("tel:911");
        toast.success("📞 Calling emergency services...");
      },
      color: "bg-red-600 hover:bg-red-700",
      icon: "📞",
    },
    {
      title: "Find Hospitals",
      description: "Locate nearby hospitals",
      action: openHospitalMaps,
      color: "bg-blue-600 hover:bg-blue-700",
      icon: "🏥",
    },
    {
      title: "Poison Control",
      description: "1-800-222-1222",
      action: () => {
        window.open("tel:18002221222");
        toast.success("☎️ Calling Poison Control...");
      },
      color: "bg-orange-600 hover:bg-orange-700",
      icon: "☠️",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="flex items-center text-blue-600 hover:text-blue-800 font-semibold">
          ← Back to Dashboard
        </button>
        <h1 className="text-4xl font-bold text-red-600">🚑 Emergency Agent</h1>
        <div></div>
      </div>

      {/* Emergency Alert Section */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Emergency Alert System</h2>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact (Phone/Email)</label>
          <input
            type="text"
            value={emergencyContact}
            onChange={(e) => setEmergencyContact(e.target.value)}
            placeholder="Enter phone number or email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={sendEmergencyAlert}
          disabled={isLoading}
          className={`w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Sending Alert...
            </div>
          ) : (
            "🚨 Send Emergency Alert"
          )}
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className={`${action.color} text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200`}
          >
            <div className="text-4xl mb-3">{action.icon}</div>
            <h3 className="text-xl font-bold mb-2">{action.title}</h3>
            <p className="text-sm opacity-90">{action.description}</p>
          </button>
        ))}
      </div>

      {/* Emergency Information */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ Emergency Tips</h3>
        <ul className="list-disc list-inside text-yellow-700 space-y-1">
          <li>Stay calm and assess the situation</li>
          <li>Call 911 for life-threatening emergencies</li>
          <li>Provide clear location and nature of emergency</li>
          <li>Follow dispatcher instructions carefully</li>
          <li>Keep emergency contacts easily accessible</li>
        </ul>
      </div>
    </div>
  );
};

export default EmergencyAgent;
