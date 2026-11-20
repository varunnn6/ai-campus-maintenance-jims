# AI-Driven Predictive Campus Maintenance & Facility Management System

**Jagan Institute of Management Studies (JIMS), Sector-5, Rohini, Delhi – 110085**  
*Affiliated to Guru Gobind Singh Indraprastha University (GGSIPU)*  
**Programme:** Master of Computer Applications (MCA) – Semester 3  
**Submitted By:** Varun Malik, Shankar Suman, Aditya % Ayush Mishra
**Academic Session:** 2025–2027  

---

## 🌟 Executive Overview
This web application is a full-stack, enterprise-grade campus facility management platform engineered to transition educational institutions from purely reactive issue reporting to proactive, data-driven, and predictive maintenance.

### Key Capabilities
- **Automated NLP Issue Categorization:** Uses TF-IDF vectorization and regularized Logistic Regression trained on campus infrastructure complaints to classify issues across 7 categories with **95.77% accuracy**.
- **Multi-Factor Priority Scoring:** Dynamically evaluates safety hazard keywords and location impact (e.g., Computer Labs, Examination Venues, and Server Rooms receive elevated weightings) to calculate an urgency score (0–100) and target SLA.
- **Computer Vision Visual Fault Inspection:** Analyzes uploaded defect images using PIL and NumPy spatial gradient convolutions to identify moisture/water pooling, burnt electrical terminals, and structural fissures.
- **Predictive Maintenance & MTBF Modeling:** Evaluates Mean Time Between Failures and Exponential/Poisson failure distributions to forecast impending equipment breakdowns and generate proactive preventive service orders.
- **Campus Vulnerability Heatmap:** Provides administrators with real-time risk scores across all campus blocks and laboratories.
- **Dual-Mode Resilient Database:** Seamlessly connects to **MongoDB** (local or Atlas) via Mongoose, while providing an embedded file-backed fallback store (`server/data/db.json`) for zero-dependency execution during academic presentations.

---

## 🏗️ Technology Stack

| Layer | Technologies & Tools |
| :--- | :--- |
| **Frontend** | React 18, Vite 6, Tailwind CSS, Lucide Icons, Recharts |
| **Backend REST API** | Node.js, Express.js, JWT, Bcrypt.js, Multer |
| **Database** | MongoDB / Mongoose + Zero-Config Embedded Store |
| **AI / ML & Computer Vision** | Python 3, Scikit-Learn, NumPy, PIL/Pillow, Flask, Flask-CORS |
| **Version Control & Dev** | Git, GitHub, REST Client |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested on v24)
- **Python**: v3.10+ (tested on v3.13)
- Optional: MongoDB (if absent, the application automatically uses the embedded fallback)

### 2. Launch Everything with One Command
From the project root:
```bash
./start.sh
```
This automatically starts:
1. **Python AI Microservice** on `http://localhost:5001`
2. **Node.js Express Backend** on `http://localhost:5005`
3. **React Vite Frontend** on `http://localhost:3000`

### 3. Or Run Services Individually
```bash
# Terminal 1: Python AI Service
python3 ai_service/app.py

# Terminal 2: Node.js Express Backend
node server/server.js

# Terminal 3: React Frontend Dev Server
cd client && npm run dev
```

---

## 👥 Demo Pre-Registered Credentials
The application includes a **Quick Role Switcher** in the top navigation bar so you can test all 4 roles with a single click:

| Role | Email | Password | Name / Department |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@jims.edu` | `admin123` | Dr. R. K. Sharma (Facility Director) |
| **MCA Student** | `varun@jims.edu` | `student123` | Varun Malik (MCA Sem 3) |
| **Faculty Guide / Staff** | `shankar@jims.edu` | `staff123` | Prof. Shankar Sumar (MCA Dept) |
| **Technician** | `tech@jims.edu` | `tech123` | Rajesh Kumar (Sr. Electrical/HVAC Tech) |

---

## 🧪 AI & Model Testing

You can run automated test suites to verify that all AI endpoints are operational:
```bash
python3 ai_service/test_service.py
```
Output:
```
[AI Engine] Category NLP model and vectorizer loaded successfully!
>>> Testing /health endpoint... Model loaded: True
>>> Testing /api/ai/classify (NLP)... 100% Correct
>>> Testing /api/ai/priority... Critical Priority, Urgency: 100.0, SLA: 2h
>>> Testing /api/ai/cv-inspect... Water Leakage Detected (96.0% Confidence)
>>> Testing /api/ai/predictive-maintenance... MTBF & Poisson CDF Verified
========================================================
ALL AI/ML & COMPUTER VISION TESTS PASSED 100% SUCCESSFULLY!
========================================================
```

To retrain the Machine Learning classifier on the dataset:
```bash
python3 ai_service/train_models.py
```

---

## 📁 Project Directory Structure
```
campus-maintenance-system/
├── start.sh                      # Universal single-command startup script
├── package.json                  # Root npm project definition & scripts
├── README.md                     # Comprehensive project documentation
│
├── ai_service/                   # Python AI/ML & Computer Vision Microservice
│   ├── app.py                    # Flask REST API (port 5001)
│   ├── train_models.py           # ML training script with TF-IDF & metrics
│   ├── test_service.py           # Automated unit & integration test suite
│   ├── category_model.pkl        # Serialized trained Logistic Regression model
│   └── vectorizer.pkl            # Serialized N-gram TF-IDF vectorizer
│
├── server/                       # Node.js + Express REST API Backend (port 5000)
│   ├── server.js                 # Server entry point & static file hosting
│   ├── seed.js                   # JIMS Sector-5 campus database seed script
│   ├── .env                      # Environment configuration
│   ├── config/db.js              # Dual-mode database adapter (MongoDB + fallback)
│   ├── models/index.js           # Schema definitions (Users, Facilities, Complaints...)
│   ├── controllers/              # REST controllers (auth, complaints, analytics, AI bridge)
│   ├── routes/api.js             # API endpoint definitions
│   └── middleware/auth.js        # JWT verification & RBAC middleware
│
├── client/                       # React 18 + Vite Frontend Application (port 3000)
│   ├── src/
│   │   ├── App.jsx               # Root application component
│   │   ├── main.jsx              # DOM entry point
│   │   ├── index.css             # Tailwind CSS & custom animations
│   │   └── components/
│   │       ├── Navbar.jsx        # JIMS branding, quick role switcher, links
│   │       ├── DashboardView.jsx # Executive KPI cards, trend charts & risk radar
│   │       ├── ReportIssueModal.jsx # Live AI triage complaint reporter
│   │       ├── ComplaintsListView.jsx # Lifecycle tracking, filters & search
│   │       ├── ComplaintDetailModal.jsx # Stepper, AI reasoning, tech dispatch & feedback
│   │       ├── PredictiveMaintenanceHub.jsx # Campus risk heatmap, MTBF & AI sandbox
│   │       ├── FacilityDirectoryView.jsx # Campus rooms & high-value assets
│   │       └── DocumentationModal.jsx # In-app MCA synopsis & viva guide
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── docs/                         # Academic documentation
    ├── ARCHITECTURE_AND_DFD.md   # System Architecture, DFD Level 0/1 & Use Case Diagrams
    └── VIVA_PREPARATION_GUIDE.md # 7 essential external examiner viva questions & answers
```

---

## 🎓 Academic Viva Highlights
- **Mathematical Modeling:** Failure probability is calculated using the Poisson/Exponential Cumulative Distribution Function: $P(T \le t) = 1 - e^{-\lambda \cdot t}$, where $\lambda = \frac{1}{\text{MTBF}}$.
- **NLP Performance:** Achieved 95.77% accuracy with balanced class weighting across 7 campus maintenance domains.
- **Architectural Separation:** Decoupled Node.js REST API and Python AI microservice ensures high concurrent throughput for CRUD operations while isolating compute-heavy tensor operations.
