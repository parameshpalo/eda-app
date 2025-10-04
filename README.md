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
cd eda-backend
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
cd eda-frontend
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
- Custom tooltips and legends for better UX and readability  
- React Query used for caching + stale-while-revalidate performance  
- Simple, modular structure for both frontend and backend  

---

## 🚧 Future Improvements

- 🧱 Redis caching for expensive grouped queries  
- 🧭 Cursor-based pagination for raw data  
- 🧪 Unit & integration tests for API and key React components  
- 🐳 Docker Compose / Kubernetes setup for production deployment  
- 🔄 CI/CD pipeline for automated testing & deployment  

---

## 👤 Author

**Your Name**  
📧 Contact: [parameshpalo056@gmail.com]  
💻 GitHub: [(https://github.com/parameshpalo)]
