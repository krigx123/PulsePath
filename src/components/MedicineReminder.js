import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const MedicineReminder = ({ onBack }) => {
  const [medicines, setMedicines] = useState([]);
  const [newMedicine, setNewMedicine] = useState({ name: "", time: "", dosage: "" });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    // Load medicines from localStorage
    const savedMedicines = localStorage.getItem("medicines");
    if (savedMedicines) {
      setMedicines(JSON.parse(savedMedicines));
    }
  }, []);

  useEffect(() => {
    // Save medicines to localStorage whenever medicines change
    localStorage.setItem("medicines", JSON.stringify(medicines));
  }, [medicines]);

  const addMedicine = () => {
    if (!newMedicine.name.trim() || !newMedicine.time) {
      toast.error("Please fill in medicine name and time!");
      return;
    }

    const medicine = {
      id: Date.now(),
      name: newMedicine.name,
      time: newMedicine.time,
      dosage: newMedicine.dosage || "1 tablet",
      takenToday: false,
      createdAt: new Date().toISOString(),
    };

    setMedicines([...medicines, medicine]);
    setNewMedicine({ name: "", time: "", dosage: "" });
    setShowAddForm(false);
    toast.success(`💊 ${medicine.name} added successfully!`);
  };

  const toggleMedicineStatus = (id) => {
    setMedicines(
      medicines.map((medicine) => (medicine.id === id ? { ...medicine, takenToday: !medicine.takenToday } : medicine))
    );

    const medicine = medicines.find((m) => m.id === id);
    if (medicine && !medicine.takenToday) {
      toast.success(`✅ Marked ${medicine.name} as taken!`);
    } else {
      toast.info(`❌ Marked ${medicine.name} as missed`);
    }
  };

  const deleteMedicine = (id) => {
    const medicine = medicines.find((m) => m.id === id);
    setMedicines(medicines.filter((m) => m.id !== id));
    toast.success(`🗑️ ${medicine.name} removed from list`);
  };

  const getTodaysTaken = () => {
    return medicines.filter((m) => m.takenToday).length;
  };

  const getUpcomingReminders = () => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    return medicines
      .filter((m) => !m.takenToday)
      .map((m) => {
        const [hours, minutes] = m.time.split(":").map(Number);
        const medicineTime = hours * 60 + minutes;
        return { ...m, timeUntil: medicineTime - currentTime };
      })
      .filter((m) => m.timeUntil > 0)
      .sort((a, b) => a.timeUntil - b.timeUntil)
      .slice(0, 3);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="flex items-center text-blue-600 hover:text-blue-800 font-semibold">
          ← Back to Dashboard
        </button>
        <h1 className="text-4xl font-bold text-green-600">💊 Medicine Reminder</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
        >
          + Add Medicine
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Medicines</h3>
          <p className="text-3xl font-bold text-blue-600">{medicines.length}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Taken Today</h3>
          <p className="text-3xl font-bold text-green-600">{getTodaysTaken()}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Remaining</h3>
          <p className="text-3xl font-bold text-orange-600">{medicines.length - getTodaysTaken()}</p>
        </div>
      </div>

      {/* Add Medicine Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Add New Medicine</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Medicine Name *</label>
              <input
                type="text"
                value={newMedicine.name}
                onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })}
                placeholder="e.g., Aspirin"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time *</label>
              <input
                type="time"
                value={newMedicine.time}
                onChange={(e) => setNewMedicine({ ...newMedicine, time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dosage</label>
              <input
                type="text"
                value={newMedicine.dosage}
                onChange={(e) => setNewMedicine({ ...newMedicine, dosage: e.target.value })}
                placeholder="e.g., 1 tablet"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            <button
              onClick={addMedicine}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Add Medicine
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Medicine List */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Today's Medicines</h2>
        {medicines.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No medicines added yet. Click "Add Medicine" to get started!</p>
        ) : (
          <div className="space-y-4">
            {medicines.map((medicine) => (
              <div
                key={medicine.id}
                className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                  medicine.takenToday ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => toggleMedicineStatus(medicine.id)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      medicine.takenToday ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {medicine.takenToday ? "✓" : "○"}
                  </button>
                  <div>
                    <h3 className="font-semibold text-gray-800">{medicine.name}</h3>
                    <p className="text-sm text-gray-600">
                      {medicine.time} - {medicine.dosage}
                    </p>
                  </div>
                </div>
                <button onClick={() => deleteMedicine(medicine.id)} className="text-red-500 hover:text-red-700 p-2">
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Reminders */}
      {getUpcomingReminders().length > 0 && (
        <div className="bg-blue-50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-blue-800 mb-4">🔔 Upcoming Reminders</h3>
          <div className="space-y-2">
            {getUpcomingReminders().map((medicine) => (
              <div key={medicine.id} className="flex justify-between items-center">
                <span className="font-medium">{medicine.name}</span>
                <span className="text-blue-600">{medicine.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineReminder;
