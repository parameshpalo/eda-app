# 🧠 FMCG EDA Dashboard

An interactive **Exploratory Data Analysis (EDA)** dashboard for FMCG sales & volume data.  
Built with **React (Vite)** frontend, **FastAPI** backend, and **PostgreSQL** for persistent data storage and analysis.

---

## 🌐 Live Demo

🔗 [https://eda-app-gcsn.vercel.app/](https://eda-app-gcsn.vercel.app/)

> ⚠️ Animations and loading may appear slower due to separate deployments for frontend, backend, and database (network latency between services).

---

## ✨ Features

- **Dynamic multi-select filters**
  - Brand, Pack Type, PPG, Channel, Year
- **Charts**
  - 📊 Horizontal bar chart: Sales Value by Year (stacked by Brand/PPG)
  - 📊 Horizontal bar chart: Volume (kg) by Year (stacked by Brand/PPG)
  - 📈 Vertical bar chart: Year-wise (Sales Value / Sales Volume)
  - 📉 Line chart: Monthly Trend (Sales Value / Sales Volume)
  - 🥧 Pie/Donut chart: Market Share (Sales Value / Sales Volume)
- **Metric toggle:** Sales Value ↔️ Sales Volume
- **Interactive elements:** Responsive layout, custom tooltips, legends, animations
- **Future-ready placeholders:** For additional metrics & visualizations

---

## 🧰 Tech Stack

| Layer | Technology |
|:------|:------------|
| **Frontend** | React (Vite), Recharts, Tailwind CSS, React Query |
| **Backend** | FastAPI, SQLAlchemy |
| **Database** | PostgreSQL |
| **Data ingestion** | pandas-based CSV loader |
| **Deployment** | Render (Backend), Vercel (Frontend) |
| **Local Dev** | `uvicorn` for API testing |

---

## 🚀 Quick Start (Local Setup)

### 1️⃣ Backend Setup

```bash
cd '.\EDA backend\'
python -m venv .venv
# Activate the environment
source .venv/bin/activate        # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

#### Configure Database

- **Option A:** Use your own database — update `DATABASE_URL` in `.env` or inside `database.py`.
- **Option B:** Use the pre-deployed Railway DB (already configured inside `database.py` for convenience).

#### Load Data

```bash
python app/script.py
python app/clean_db.py
```

#### Run Backend

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

### 2️⃣ Frontend Setup

```bash
cd '.\EDA frontend\'
npm install
npm run dev
```

Access the frontend at:

```
http://localhost:5173
```

---

## 🧩 Design Decisions

- Unified backend schema returning a consistent `value` field for all charts
- single select and multi select dropdowns 
- Custom tooltips and legends for better UX and readability  
- React Query used for caching + stale-while-revalidate performance  
- Simple, modular structure for both frontend and backend  

---

## 🚧 Future Improvements

-  Redis caching for expensive grouped queries  
- 🧪 Unit & integration tests for API and key React components  
- 🐳 Docker Compose / Kubernetes setup for production deployment  
- 🔄 CI/CD pipeline for automated testing & deployment  

---

# 🧠 Thought Process

---

## 1️⃣ Understanding the Goal

The task was to design an interactive **Exploratory Data Analysis (EDA)** dashboard that allows users to filter and visualize **FMCG sales and volume data** across various dimensions such as brand, pack type, PPG, and year.

**Main objectives:**

- Build a clean, modular backend API capable of flexible aggregation and filtering.  
- Design a reactive and user-friendly frontend that makes data exploration intuitive.  
- Ensure scalability, responsiveness, and code clarity for maintainability.  

---

## 2️⃣ Backend Design (FastAPI + PostgreSQL)

### **Why FastAPI?**

- ⚡ Fast, async, and easy to integrate with SQLAlchemy  
- 🧩 Automatic docs (`/docs`) for API exploration  
- ✅ Strong typing and Pydantic validation for safer responses  

### **Architecture Decisions**

Created a modular backend structure:

```
app/
├── main.py
├── fmcg.py        # All routes
├── models.py      # SQLAlchemy models
├── schemas.py     # Pydantic schemas
├── database.py    # Session and engine setup
```

- Used **PostgreSQL** for structured data storage.  
- Designed a generic utility function `run_grouped_query()` that dynamically handles:
  - Filtering (brand, year, ppg, pack_type, channel)  
  - Grouping (by year, month, brand, etc.)  
  - Aggregation (SUM of sales or volume)  

### **API Endpoints**

| Chart | Endpoint | Purpose |
|:------|:----------|:---------|
| Sales Value | `/sales-value` | Total sales by dimension |
| Volume Contribution | `/volume-contribution` | Volume by brand or PPG |
| Yearly Sales | `/yearly-sales` | Multi-year grouped bars |
| Sales Trend | `/trend` | Monthly sales trend |
| Market Share | `/market-share` | Contribution pie chart |

### **Design Choices**

- Unified response key → every aggregated endpoint returns:  
  ```json
  { "value": <number> }
  ```
  This makes frontend chart mapping consistent.

- Applied **CORS middleware** for smooth frontend integration with Vercel.  
- Optimized query performance using `SQLAlchemy func.sum` and selective filters.  

---

## 3️⃣ Frontend Design (React + Vite + TypeScript)

### **Why Vite + React + TypeScript?**

- ⚡ Fast HMR during development  
- 🧱 Type safety across API data  
- 🚀 Modern bundling for Vercel deployment  

### **Core Tech Stack**

- **React Query** (`@tanstack/react-query`) — handles API caching, background refresh, and state management.  
- **Recharts** — simple yet powerful charting library for data visualization.  
- **TailwindCSS** — for responsive, utility-first styling.  
- **Framer Motion** — adds smooth animations for modern UX.  

### **Component Structure**

```
src/
├── api/fmcg.ts               # Axios API layer
├── components/charts/        # Chart components (Bar, Line, Pie)
├── components/FilterBar.tsx  # Dynamic filters
├── pages/Dashboard.tsx       # Main layout
```

Each chart (`SalesBar`, `VolumeChart`, `TrendLine`, `MarketSharePie`) is independent and reusable — driven by the same dynamic API structure.

### **Design Details**

- 🧭 Clean, minimalist dashboard layout  
- 📊 Custom metric dropdowns (Sales / Volume) with hover-based menus  
- 💡 Smart tooltips for improved readability  
- 📱 Fully responsive grid layout  

---

## 4️⃣ Data Ingestion

- Wrote a Python script using **Pandas + SQLAlchemy** to clean, convert, and import CSV data into PostgreSQL.  
- Handled type conversion for date, float, and int fields.  
- Automatically creates tables if they don’t exist using:  
  ```python
  Base.metadata.create_all(bind=engine)
  ```

---

## 5️⃣ Deployment

### **Backend (Render)**

- Deployed **FastAPI** app with PostgreSQL database.  
- Configured environment for **CORS** with the Vercel domain.

### **Frontend (Vercel)**

- Deployed built **React/Vite** app.  
- Integrated with backend API hosted on Render.  
- Configured environment variables and CORS-friendly requests.


## 👤 Author

**Your Name**  
📧 Contact: [parameshpalo056@gmail.com]  
💻 GitHub: [(https://github.com/parameshpalo)]
