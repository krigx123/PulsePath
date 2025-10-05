# PulsePath - Personal Health Companion 🫀

A modern full-stack web application for comprehensive health management featuring emergency assistance, medication tracking, and AI-powered stress analysis.

## 🌟 Features

### 🚑 Emergency Health Agent

- **Hospital Finder**: Instant Google Maps integration to locate nearby hospitals
- **Emergency Contacts**: Quick alert system for emergency situations
- **Crisis Resources**: Direct access to emergency services (911, Poison Control)

### 💊 Medicine Reminder

- **Medication Management**: Track medicine names, dosages, and timing
- **Real-time Notifications**: Browser alerts when it's time for medication
- **Progress Tracking**: Visual feedback for taken/missed doses
- **Daily Overview**: Complete medication schedule dashboard

### 🧠 Stress Agent

- **Mood Tracking**: 10-point stress scale with contextual data collection
- **Lifestyle Integration**: Track sleep hours, work hours, and stress triggers
- **AI Suggestions**: Personalized stress management recommendations
- **Analytics**: Interactive charts showing stress trends over time

## 🛠️ Dependencies & Requirements

### System Requirements

- **Node.js** v14 or higher
- **npm** or **yarn** package manager
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Frontend Dependencies

- **React** 19.2.0 - User interface framework
- **TailwindCSS** 3.4.18 - Utility-first CSS framework
- **Recharts** 3.2.1 - Data visualization charts
- **React Hot Toast** 2.6.0 - Notification system

### Backend Dependencies

- **Express** 5.1.0 - Web application framework
- **SQLite3** 5.1.7 - Lightweight database
- **CORS** 2.8.5 - Cross-origin resource sharing
- **Compression** 1.8.1 - Response compression middleware
- **UUID** 13.0.0 - Unique identifier generation

## 🚀 Setup & Installation

### Prerequisites

- Node.js v14 or higher
- npm or yarn package manager

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/pulsepath.git
   cd pulsepath
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment setup** (optional)

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development servers**

   ```bash
   npm run dev
   ```

   This runs both the React frontend (port 3000) and Express backend (port 3001)

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

### Alternative Scripts

- **Frontend only**: `npm start`
- **Backend only**: `npm run server`
- **Production build**: `npm run build`
- **Reset database**: `npm run reset-db`

## 📱 How to Use

### Dashboard

Navigate between the three main features using the dashboard cards. View quick stats including active medicines, health score, and usage days.

### Emergency Agent

1. Click "🚑 Emergency Health Agent"
2. **Find Hospitals**: Opens Google Maps with nearby hospitals
3. **Send Alerts**: Enter emergency contact and send alerts
4. **Quick Access**: Direct buttons for 911, hospitals, poison control

### Medicine Reminder

1. Click "💊 Medicine Reminder"
2. **Add Medicine**: Enter name, time, and dosage
3. **Get Notifications**: Receive browser alerts at medication times
4. **Track Progress**: Mark medicines as taken ✅ or missed ❌

### Stress Agent

1. Click "🧠 Smart Stress Agent"
2. **Log Stress**: Rate your stress level (1-10) with context
3. **Add Details**: Include sleep hours, work hours, and triggers
4. **View Analytics**: See trend charts and receive AI suggestions

## �️ Data Storage

- **Frontend**: localStorage for medicine reminders and temporary data
- **Backend**: SQLite database for stress logs and analytics
- **Performance**: 5-minute in-memory cache for faster API responses
- **Persistence**: Data survives browser sessions and app restarts

## 🚀 Deployment

### Quick Deploy

```bash
# Build for production
npm run build

# Deploy to Vercel
npx vercel

# Or deploy to Netlify
# Upload the 'build' folder to Netlify
```

### Environment Variables

Create `.env.local` for custom configuration:

```
REACT_APP_API_BASE_URL=http://localhost:3001/api
NODE_ENV=production
PORT=3001
```

---

**Built with ❤️ for better health management**
