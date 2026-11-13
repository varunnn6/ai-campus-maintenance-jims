# MCA External Viva Preparation Guide
**Project:** AI-Driven Predictive Campus Maintenance & Facility Management System  
**Institution:** Jagan Institute of Management Studies (JIMS), Sector-5 Rohini, Delhi  
**Affiliated University:** Guru Gobind Singh Indraprastha University (GGSIPU)  
**Authors:** Varun Malik, Shankar Sumar, Aditya (MCA Semester 3)  

---

### Q1. What is the core innovation of your project compared to traditional complaint portals?
**Answer:**
Traditional campus portals are purely *reactive*—they simply store text entries in a table and wait for administrators to manually triage and assign them. Our system introduces three intelligent AI-driven layers:
1. **Automated AI Triage & NLP Categorization:** As soon as a student types an issue, our Machine Learning model analyzes the semantics and categorizes it across 7 distinct categories with **95.77% accuracy**, while extracting hazard keywords.
2. **Computer Vision Inspection:** When a photo is uploaded, our OpenCV / NumPy image processing pipeline scans color histograms, luminance hotspots, and edge density to classify physical defects (water seepage, burnt switchboard, cracks).
3. **Predictive Failure Analytics:** Using historical Mean Time Between Failures (MTBF) and Exponential/Poisson probability models, the platform forecasts equipment breakdowns *before* they occur, presenting a dynamic campus risk heatmap.

---

### Q2. Explain your Machine Learning model, training process, and evaluation metrics.
**Answer:**
- **Algorithm:** N-gram TF-IDF (Term Frequency-Inverse Document Frequency) feature extraction combined with regularized **Logistic Regression** and domain heuristic ensemble.
- **Dataset:** Augmented campus maintenance complaint corpus covering electrical, plumbing, HVAC, civil, IT/networking, sanitation, and fire safety scenarios.
- **Evaluation Metrics:**
  - **Overall Accuracy:** `95.77%`
  - **Macro Average Precision:** `0.9680`
  - **Macro Average Recall:** `0.9388`
  - **F1-Score:** `0.9440`
- Model artifacts are serialized into `category_model.pkl` and `vectorizer.pkl` using Joblib and served via a decoupled Python Flask microservice.

---

### Q3. How does your Computer Vision pipeline work without heavy external cloud APIs?
**Answer:**
Our Computer Vision engine is built using Python's scientific stack (NumPy and PIL/Pillow):
1. **Grayscale & Gradient Magnitude:** Calculates central difference gradients $G = \sqrt{G_x^2 + G_y^2}$ to measure edge density and Laplacian variance, identifying surface fractures and wall cracks.
2. **HSV & Spectral Color Segmentation:** Converts RGB images into HSV color space. Masks Hue ranges (90°–130°) with high saturation to detect water puddles, moisture pooling, and damp discoloration.
3. **Luminance Hotspot Detection:** Filters pixels with value $V > 220$ alongside adjacent dark scorch masks ($V < 50$) to detect electrical arcs and burnt terminals.
4. **Visual Entropy:** Computes pixel standard deviation across channels to identify cluttered debris and sanitation overflow.

---

### Q4. What is the mathematical basis for the Predictive Maintenance forecasting?
**Answer:**
We model equipment failure probability using the **Exponential / Poisson Cumulative Distribution Function (CDF)**:
$$P(T \le t) = 1 - e^{-\lambda \cdot t}$$
where:
- $t$ is the prediction window in days (e.g. 15 or 30 days).
- $\lambda = \frac{1}{\text{MTBF}}$ is the failure hazard rate.
- $\text{MTBF} = \frac{\text{Total Operating Time}}{\text{Total Number of Breakdowns}}$.

If a split AC unit in Computer Lab 2 has an average MTBF of 22 days, its probability of failing within 15 days is:
$$P(T \le 15) = 1 - e^{-\frac{15}{22}} \approx 1 - e^{-0.6818} \approx 0.494 \quad (49.4\%)$$
When recurrence frequency increases, $\lambda$ rises, triggering proactive preventive work-orders.

---

### Q5. Explain your database architecture and the "Dual-Mode" adapter.
**Answer:**
In production or university labs with MongoDB running, our backend connects via Mongoose to `mongodb://localhost:27017/campus_maintenance` or MongoDB Atlas.  
However, during academic vivas or laptop evaluations where a local MongoDB daemon might not be configured, our custom **Dual-Mode Adapter** (`server/config/db.js`) detects the connection state and automatically falls back to an embedded file-based JSON store (`server/data/db.json`). It implements the same asynchronous Mongoose query contracts (`find`, `findById`, `create`, `findByIdAndUpdate`), guaranteeing 100% operational resilience.

---

### Q6. How are roles and security handled?
**Answer:**
- **JSON Web Tokens (JWT):** Signed with HMAC-SHA256 and verified via middleware on protected endpoints.
- **Role-Based Access Control (RBAC):** Restricts endpoints according to user permissions:
  - `student`: Submit complaints, track lifecycle, provide 1–5 star feedback.
  - `staff`: Submit reports, view facility metrics.
  - `technician`: View assigned work-orders, log actions, record replaced parts and cost, transition status to `Resolved`.
  - `admin`: Full administrative control, technician dispatch, campus risk heatmap, and system configuration.
