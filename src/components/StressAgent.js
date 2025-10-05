import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { toast } from "react-hot-toast";
import { generateSuggestions, getStressColor, getStressLabel, stressTags } from "../utils/stressUtils";

const StressAgent = ({ onBack }) => {
  const [stressLogs, setStressLogs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [currentSuggestions, setCurrentSuggestions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    mood: 5,
    tag: "Work",
    note: "",
    sleep_hours: 7.0,
    work_hours: 8.0,
    heart_rate: "",
  });

  const userId = "demo_user"; // In a real app, this would come from authentication
  const API_BASE = "http://localhost:3001/api";

  useEffect(() => {
    // Load data only when component mounts
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Load in parallel for better performance
        await Promise.all([loadStressLogs(), loadAnalytics()]);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const loadStressLogs = async () => {
    try {
      const response = await fetch(`${API_BASE}/stress-logs/${userId}`);
      if (response.ok) {
        const logs = await response.json();
        setStressLogs(logs);
      }
    } catch (error) {
      console.error("Error loading stress logs:", error);
      // Fallback to localStorage if API is not available
      const savedLogs = localStorage.getItem("stressLogs");
      if (savedLogs) {
        setStressLogs(JSON.parse(savedLogs));
      }
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await fetch(`${API_BASE}/stress-analytics/${userId}`);
      if (response.ok) {
        const analyticsData = await response.json();
        setAnalytics(analyticsData);
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
    }
  };

  const submitStressLog = async () => {
    setIsSubmitting(true);

    const logData = {
      user_id: userId,
      mood: parseInt(formData.mood),
      tag: formData.tag,
      note: formData.note,
      sleep_hours: parseFloat(formData.sleep_hours),
      work_hours: parseFloat(formData.work_hours),
      heart_rate: formData.heart_rate ? parseInt(formData.heart_rate) : null,
    };

    try {
      const response = await fetch(`${API_BASE}/stress-log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(logData),
      });

      if (response.ok) {
        const result = await response.json();
        setCurrentSuggestions(result.suggestions);
        toast.success("Stress log saved! Check your personalized suggestions below.");

        // Reload data
        await loadStressLogs();
        await loadAnalytics();

        // Reset form
        setFormData({
          mood: 5,
          tag: "Work",
          note: "",
          sleep_hours: 7.0,
          work_hours: 8.0,
          heart_rate: "",
        });
        setShowForm(false);
      } else {
        throw new Error("Failed to save stress log");
      }
    } catch (error) {
      console.error("Error submitting stress log:", error);

      // Fallback to localStorage
      const newLog = {
        ...logData,
        id: Date.now().toString(),
        timestamp: Math.floor(Date.now() / 1000),
        date: new Date().toISOString().split("T")[0],
      };

      const savedLogs = JSON.parse(localStorage.getItem("stressLogs") || "[]");
      const updatedLogs = [newLog, ...savedLogs].slice(0, 50);
      localStorage.setItem("stressLogs", JSON.stringify(updatedLogs));
      setStressLogs(updatedLogs);

      toast.success("Stress log saved locally!");

      // Generate basic suggestions
      const suggestions = generateSuggestions(logData.mood, logData.sleep_hours, logData.work_hours);
      setCurrentSuggestions(suggestions);
    }

    setIsSubmitting(false);
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="flex items-center text-blue-600 hover:text-blue-800 font-semibold">
          ← Back to Dashboard
        </button>
        <h1 className="text-4xl font-bold text-purple-600">🧠 Smart Stress Agent</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold"
          disabled={isLoading}
        >
          + Log Stress
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
          <span className="ml-4 text-xl text-gray-600">Loading your stress data...</span>
        </div>
      )}

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-md text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Avg Stress Level</h3>
            <p className={`text-3xl font-bold ${getStressColor(analytics.averageMood)}`}>{analytics.averageMood}/10</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Avg Sleep</h3>
            <p className="text-3xl font-bold text-blue-600">{analytics.averageSleep}h</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Main Trigger</h3>
            <p className="text-xl font-bold text-orange-600">{analytics.mostCommonTrigger}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Logs</h3>
            <p className="text-3xl font-bold text-purple-600">{stressLogs.length}</p>
          </div>
        </div>
      )}

      {/* Stress Log Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Daily Stress Check-in</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stress Level (1 = very calm, 10 = very stressed)
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.mood}
                onChange={(e) => handleFormChange("mood", e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>1 (Calm)</span>
                <span className={`font-bold ${getStressColor(formData.mood)}`}>
                  {formData.mood} - {getStressLabel(formData.mood)}
                </span>
                <span>10 (Stressed)</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Main Trigger</label>
              <select
                value={formData.tag}
                onChange={(e) => handleFormChange("tag", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                {stressTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">What happened? (Optional)</label>
              <textarea
                value={formData.note}
                onChange={(e) => handleFormChange("note", e.target.value)}
                placeholder="Brief description of what caused stress..."
                maxLength={300}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sleep Last Night (hours)</label>
              <input
                type="number"
                min="0"
                max="24"
                step="0.5"
                value={formData.sleep_hours}
                onChange={(e) => handleFormChange("sleep_hours", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Work Hours Today (approx)</label>
              <input
                type="number"
                min="0"
                max="24"
                step="0.5"
                value={formData.work_hours}
                onChange={(e) => handleFormChange("work_hours", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Heart Rate (BPM) - Optional</label>
              <input
                type="number"
                min="40"
                max="200"
                value={formData.heart_rate}
                onChange={(e) => handleFormChange("heart_rate", e.target.value)}
                placeholder="Leave empty if unknown"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={submitStressLog}
              disabled={isSubmitting}
              className={`bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </div>
              ) : (
                "Submit Check-in"
              )}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* AI Suggestions */}
      {currentSuggestions.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-purple-800 mb-4">🤖 AI-Powered Suggestions</h3>
          <div className="space-y-3">
            {currentSuggestions.map((suggestion, index) => (
              <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-gray-700">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      {analytics && analytics.trendData.length > 1 && (
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Stress Trend Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Stress Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analytics.trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis domain={[1, 10]} />
                <Tooltip formatter={(value) => [`${value}/10`, "Stress Level"]} labelFormatter={(label) => `Day ${label}`} />
                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: "#8b5cf6", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Sleep vs Stress */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">😴 Sleep vs Stress</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sleep" fill="#3b82f6" name="Sleep (hrs)" />
                <Bar dataKey="mood" fill="#ef4444" name="Stress (1-10)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Logs */}
      {stressLogs.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Check-ins</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Stress</th>
                  <th className="text-left p-2">Trigger</th>
                  <th className="text-left p-2">Sleep</th>
                  <th className="text-left p-2">Work Hrs</th>
                  <th className="text-left p-2">Note</th>
                </tr>
              </thead>
              <tbody>
                {stressLogs.slice(0, 10).map((log, index) => (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{log.date}</td>
                    <td className={`p-2 font-semibold ${getStressColor(log.mood)}`}>{log.mood}/10</td>
                    <td className="p-2">{log.tag}</td>
                    <td className="p-2">{log.sleep_hours}h</td>
                    <td className="p-2">{log.work_hours}h</td>
                    <td className="p-2 max-w-xs truncate">{log.note || "No note"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Helpful Resources */}
      <div className="mt-8 bg-blue-50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-blue-800 mb-4">🌟 Mental Health Resources</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-blue-700 mb-2">Crisis Support</h4>
            <p className="text-sm text-blue-600">
              National Suicide Prevention Lifeline: <strong>988</strong>
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-blue-700 mb-2">Text Support</h4>
            <p className="text-sm text-blue-600">
              Crisis Text Line: Text <strong>HOME</strong> to <strong>741741</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StressAgent;
