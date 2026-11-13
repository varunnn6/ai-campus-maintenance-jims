# System Architecture & Data Flow Diagrams (DFD)
**Project Title:** AI-Driven Predictive Campus Maintenance & Facility Management System  
**Institution:** Jagan Institute of Management Studies (JIMS), Sector-5, Rohini, Delhi  
**Affiliated to:** Guru Gobind Singh Indraprastha University (GGSIPU)  
**Programme:** Master of Computer Applications (MCA), Semester 3  
**Authors:** Varun Malik, Shankar Sumar, Aditya  

---

## 1. System Architecture Diagram

```mermaid
flowchart TD
    subgraph Client_Layer ["Client Layer (Frontend)"]
        UI["React.js Single Page App\n(Vite + Tailwind CSS)"]
        Cam["Live Camera / Photo Upload"]
        Dash["Interactive Executive Dashboard\n& Risk Heatmap"]
        TriageUI["Live AI Complaint Triage Form"]
    end

    subgraph API_Gateway ["Application Server (Backend REST API)"]
        Express["Node.js + Express.js API Server\n(Port 5000)"]
        Auth["JWT Role-Based Auth\n(Student / Staff / Admin / Tech)"]
        CompRouter["Complaints Controller\n& Lifecycle Stepper"]
        FacRouter["Facility & Asset Registry"]
        AnalyticsRouter["MTBF & Trend Aggregator"]
    end

    subgraph AI_Layer ["AI / ML & Computer Vision Microservice"]
        Flask["Python AI Microservice\n(Port 5001)"]
        NLP["TF-IDF + Logistic Regression\nComplaint Categorizer (95.8% Acc)"]
        PriorityEngine["Multi-Factor Hazard\nPrioritization Engine"]
        CV["Computer Vision Scanner\n(PIL / NumPy / OpenCV)"]
        Predictive["MTBF & Poisson CDF\nFailure Forecaster"]
    end

    subgraph Data_Layer ["Data Storage Layer"]
        DBAdapter["Dual-Mode Database Adapter"]
        Mongo[("MongoDB / Atlas Database")]
        JsonStore[("Embedded File Store\n(db.json fallback)")]
    end

    UI -->|HTTP / JSON Requests| Express
    Express --> Auth
    Express --> CompRouter
    Express --> FacRouter
    Express --> AnalyticsRouter

    CompRouter -->|POST /api/ai/classify| Flask
    CompRouter -->|POST /api/ai/priority| Flask
    CompRouter -->|POST /api/ai/cv-inspect| Flask
    AnalyticsRouter -->|POST /api/ai/predictive-maintenance| Flask

    Flask --> NLP
    Flask --> PriorityEngine
    Flask --> CV
    Flask --> Predictive

    Express --> DBAdapter
    DBAdapter -->|Primary Mongoose Driver| Mongo
    DBAdapter -->|Zero-Config Offline Store| JsonStore
```

---

## 2. Level-0 Data Flow Diagram (DFD Context Diagram)

```mermaid
flowchart LR
    Student["Campus User\n(Student / Staff)"]
    Admin["Facility Administrator"]
    Tech["Maintenance Technician"]
    System(("AI-Driven Campus\nMaintenance System\n(Process 0.0)"))
    DB[("Campus Maintenance\nDatabase")]

    Student -->|Submit Complaint & Photos| System
    System -->|Complaint ID & Status Updates| Student
    Student -->|Provide Feedback Rating| System

    System -->|Triage Alerts & Risk Heatmap| Admin
    Admin -->|Assign Technicians & Change Status| System

    System -->|Work-Orders & Repair Details| Tech
    Tech -->|Log Action, Parts & Resolution| System

    System <-->|Read / Write Records| DB
```

---

## 3. Level-1 Data Flow Diagram (Detailed Processes)

```mermaid
flowchart TD
    User["Student / Faculty"]
    Admin["Facility Admin"]
    Tech["Technician"]

    P1["1.0 Authentication &\nRole Verification"]
    P2["2.0 Issue Intake &\nFeature Extraction"]
    P3["3.0 AI NLP & CV\nAutomated Triage"]
    P4["4.0 Complaint Lifecycle\nTracking & Assignment"]
    P5["5.0 Maintenance Action\nLogging & Resolution"]
    P6["6.0 Predictive Failure &\nMTBF Analysis"]

    D1[("Users Store")]
    D2[("Complaints Store")]
    D3[("Facilities Store")]
    D4[("Maintenance Actions")]
    D5[("Trained ML Models")]

    User -->|Login Credentials| P1
    P1 <-->|Verify Account| D1

    User -->|Submit Title, Desc & Image| P2
    P2 -->|Text & Image Stream| P3
    P3 <-->|Query Vectorizer & Weights| D5
    P3 -->|Category, Priority & Defect Output| P4
    P4 -->|Create Record| D2
    P4 <-->|Link Location| D3

    Admin -->|Review & Assign Tech| P4
    P4 -->|Dispatch Notification| Tech
    Tech -->|Record Replaced Parts & Cost| P5
    P5 -->|Update Status to Resolved| D2
    P5 -->|Log Action| D4

    D2 -->|Historical Failure Series| P6
    D4 -->|Repair Intervals| P6
    P6 -->|Campus Risk Heatmap & Forecasts| Admin
```

---

## 4. Use Case Diagram

```mermaid
flowchart LR
    subgraph Actors
        S["Student / Faculty"]
        A["Facility Admin"]
        T["Technician"]
    end

    subgraph UseCases ["Campus Maintenance Platform Use Cases"]
        UC1["Register & Authenticate"]
        UC2["Report Maintenance Issue"]
        UC3["Upload Defect Photo"]
        UC4["View Real-time Lifecycle Tracker"]
        UC5["Rate Resolution Quality"]
        UC6["Review AI Triage & Priority"]
        UC7["Assign Work-Order to Technician"]
        UC8["Inspect Campus Failure Heatmap"]
        UC9["View Recurring Issue Clusters"]
        UC10["Log Maintenance Actions & Parts"]
        UC11["Close Completed Complaints"]
    end

    S --> UC1
    S --> UC2
    S --> UC3
    S --> UC4
    S --> UC5

    A --> UC1
    A --> UC6
    A --> UC7
    A --> UC8
    A --> UC9
    A --> UC11

    T --> UC1
    T --> UC4
    T --> UC10
```
