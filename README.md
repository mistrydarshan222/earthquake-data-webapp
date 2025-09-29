# 🌍 Advanced Earthquake Data Visualization Platform

A high-performance web application for visualizing and analyzing real-time earthquake data from the United States Geological Survey (USGS). Features an intuitive interface, rich filtering, and interactive visualizations.

---

## ✨ Key Features

### 📊 Data Visualization
- Interactive scatter plots with customizable axes  
- Color-coded magnitude representation  
- Bidirectional selection between chart and table

### 🔧 Filtering & Analytics
- Filters by magnitude, time, and geography  
- Preset magnitude categories  
- Real-time filter impact metrics

### ⚡ Performance
- Virtual scrolling for large datasets  
- Progressive loading with live progress indicators  
- Background parsing for large files

### 🎨 User Experience
- Responsive layout across devices  
- Keyboard navigation and screen reader support

---

## 🛠️ Technology Stack
- **Frontend:** React 19, TypeScript 5.6, Vite  
- **Styling:** Tailwind CSS  
- **Visualization:** Recharts (SVG-based), custom components  
- **State Management:** Zustand + React Context  
- **Data Processing:** PapaParse

---

## 📦 External Dependencies

| Dependency      | Purpose                                   |
|-----------------|-------------------------------------------|
| React / React-DOM | UI framework with concurrent features     |
| Zustand         | Lightweight state management              |
| Recharts        | Declarative charting library              |
| PapaParse       | High-speed CSV parsing                    |
| Vite            | Fast dev server & optimized builds        |
| Tailwind CSS    | Utility-first CSS framework               |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm 9+  
- Git

### Installation

```bash
git clone https://github.com/mistrydarshan222/earthquake-data-webapp.git
cd earthquake-data-webapp
npm install
npm run dev


Open http://localhost:5173 in your browser.


## Scripts

Command	Description

| Command | Description |npm run dev	Start development server

|---------|-------------|npm run build	Production build

| `npm run dev` | Start development server |npm run preview	Preview production build

| `npm run build` | Production build |npm run lint	Code linting

| `npm run preview` | Preview production build |npm run type-check	Type checking only

| `npm run lint` | Code linting |

| `npm run type-check` | Type checking only |

⸻

---

🔒 Security and Privacy

•	Secure Hypertext Transfer Protocol for all external calls

•	Input sanitization against cross-site scripting

•	Local storage only; no cookies or tracking

⸻

--

📄 License

MIT License – see LICENSE

Data Attribution: United States Geological Survey Earthquake Hazards Program (public domain)
