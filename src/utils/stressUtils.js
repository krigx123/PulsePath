// Shared utility functions for stress analysis and suggestions

export const generateSuggestions = (mood, sleep_hours, work_hours) => {
  const suggestions = [];

  if (mood >= 8 || (sleep_hours < 5 && mood >= 6)) {
    suggestions.push("🫁 High stress detected — Try 5-min deep breathing (4-4-4) and a short walk.");
  } else if (mood >= 6) {
    suggestions.push("🧘 Moderate stress — Try a 5–10 min guided meditation or calming music.");
  } else if (mood >= 4) {
    suggestions.push("😌 Mild stress — Consider some light stretching or journaling.");
  } else {
    suggestions.push("✨ Low stress — Great! Consider a 2-min gratitude note to maintain this state.");
  }

  if (sleep_hours < 6) {
    suggestions.push("😴 Sleep is below optimal — Wind down 30 minutes earlier and avoid screens before bed.");
  }

  if (work_hours > 10) {
    suggestions.push("⏰ Long work day detected — Take micro-breaks, try Pomodoro technique (25/5).");
  }

  if (sleep_hours >= 8 && mood <= 3) {
    suggestions.push("🌟 Good sleep + low stress — Perfect combo! Keep up the healthy routine.");
  }

  return suggestions;
};

export const getMostCommonTrigger = (rows) => {
  if (rows.length === 0) return "None";

  const triggers = {};
  rows.forEach((row) => {
    if (row.tag) {
      triggers[row.tag] = (triggers[row.tag] || 0) + 1;
    }
  });

  return Object.keys(triggers).reduce((a, b) => (triggers[a] > triggers[b] ? a : b), "None");
};

export const getStressColor = (mood) => {
  if (mood <= 3) return "text-green-600";
  if (mood <= 5) return "text-yellow-600";
  if (mood <= 7) return "text-orange-600";
  return "text-red-600";
};

export const getStressLabel = (mood) => {
  if (mood <= 2) return "Very Low";
  if (mood <= 4) return "Low";
  if (mood <= 6) return "Moderate";
  if (mood <= 8) return "High";
  return "Very High";
};

export const stressTags = ["Work", "Relationships", "Health", "Studies", "Finance", "Family", "Other"];
