import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  FileText, 
  Cpu, 
  CheckCircle2, 
  GraduationCap, 
  Award, 
  Layers, 
  Code2, 
  HelpCircle,
  Building2
} from 'lucide-react';

export default function DocumentationModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('synopsis');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl relative my-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-md px-6 py-4 border-b border-slate-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <GraduationCap className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Academic Project Documentation & Viva Reference</h2>
              <p className="text-xs text-slate-400">Jagan Institute of Management Studies (JIMS), Rohini Sector-5 | MCA Semester 3</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="px-6 pt-3 border-b border-slate-800 flex gap-2">
          {[
            { id: 'synopsis', label: 'Synopsis & Metadata' },
            { id: 'architecture', label: 'System Architecture' },
            { id: 'math', label: 'AI/ML & MTBF Formulas' },
            { id: 'viva', label: 'Examiner Viva Q&A' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === t.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6 text-xs text-slate-300 space-y-6 leading-relaxed">
          {/* TAB 1: SYNOPSIS */}
          {activeTab === 'synopsis' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                  Project Title
                </span>
                <h3 className="text-sm font-bold text-white">
                  “AI-DRIVEN PREDICTIVE CAMPUS MAINTENANCE & FACILITY MANAGEMENT SYSTEM”
                </h3>
                <p className="text-slate-400">
                  Submitted in partial fulfillment of the requirements for the degree of <strong>Master of Computer Applications (MCA)</strong>, Semester 3.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <span className="font-semibold text-slate-200 block">Submitted By:</span>
                  <div className="text-slate-300">1. Varun Malik</div>
                  <div className="text-slate-300">2. Shankar Sumar</div>
                  <div className="text-slate-300">3. Aditya</div>
                  <div className="text-slate-400 text-[11px] pt-1">Academic Session: 2025–2027</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <span className="font-semibold text-slate-200 block">Institution & Affiliation:</span>
                  <div className="text-white font-medium">Jagan Institute of Management Studies (JIMS)</div>
                  <div className="text-slate-400">Sector-5, Rohini, Delhi – 110085</div>
                  <div className="text-blue-400 font-medium pt-1">Affiliated to Guru Gobind Singh Indraprastha University (GGSIPU)</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Core Project Objectives (Synopsis Section 3.1):
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1">
                  <li>Centralized platform for students, faculty, and administrative staff to submit infrastructure complaints.</li>
                  <li>Automated Natural Language Processing (NLP) classification into 7 distinct maintenance categories.</li>
                  <li>Multi-factor priority assignment evaluating hazard severity and facility density.</li>
                  <li>Computer Vision image inspection to detect moisture, electrical burns, and structural cracks.</li>
                  <li>Predictive Maintenance analytics using MTBF and recurrence frequency to forecast failures before they occur.</li>
                  <li>Interactive administrative dashboard with workload metrics, MTTR calculations, and risk heatmaps.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: ARCHITECTURE */}
          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  Three-Tier Distributed Architecture Flow
                </h4>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-cyan-300 text-center">
                  React.js Frontend (Port 3000) ➔ REST API ➔ Express.js Backend (Port 5000) ➔ MongoDB Database<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⇣<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Python AI / CV Microservice (Port 5001)
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                  <span className="font-bold text-white block">1. Frontend Layer</span>
                  <div className="text-slate-400 text-[11px]">
                    Built with React 18, Vite, Tailwind CSS, Lucide icons, and interactive canvas components. Provides live typing AI triage, image scanners, and interactive risk heatmaps.
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                  <span className="font-bold text-white block">2. REST API Backend</span>
                  <div className="text-slate-400 text-[11px]">
                    Built with Node.js & Express.js. Features dual-mode database (Mongoose MongoDB + zero-config embedded store fallback), JWT role-based access, and lifecycle tracking.
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                  <span className="font-bold text-white block">3. Python AI & CV Engine</span>
                  <div className="text-slate-400 text-[11px]">
                    Fast Flask REST API running Scikit-Learn TF-IDF classification, OpenCV / PIL feature extraction, and MTBF recurrence risk algorithms.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MATHEMATICAL & AI FORMULAS */}
          {activeTab === 'math' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                  1. Predictive Maintenance CDF (Cumulative Distribution Function)
                </h4>
                <p className="text-slate-300">
                  The probability of an asset or facility failing within a given time window $t$ (e.g. 15 or 30 days) is modeled using the Poisson/Exponential failure distribution:
                </p>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-center text-amber-300">
                  P(T ≤ t) = 1 - e^(-λ · t) &nbsp;&nbsp;&nbsp;&nbsp; where λ = 1 / MTBF
                </div>
                <p className="text-slate-400 text-[11px]">
                  Where <strong>MTBF</strong> is the Mean Time Between Failures calculated from historical service records. When λ increases due to recurring breakdowns, the failure probability spikes toward 1.0.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                  2. TF-IDF Text Vectorization & Logistic Regression
                </h4>
                <p className="text-slate-300">
                  Each complaint is transformed into an N-gram TF-IDF feature vector:
                </p>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-center text-cyan-300">
                  TF-IDF(t, d, D) = TF(t, d) × log( (|D| + 1) / (DF(t, D) + 1) )
                </div>
                <p className="text-slate-400 text-[11px]">
                  Our classifier achieved <strong>95.77% evaluation accuracy</strong> across all 7 campus maintenance categories with calibrated probabilities.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  3. Computer Vision Defect Detection Pipeline
                </h4>
                <p className="text-slate-300">
                  Visual inspection computes spatial gradients $G = \sqrt{G_x^2 + G_y^2}$ to detect surface cracks, along with HSV color masks (Hue 90–130) to identify moisture pooling and specular water reflection.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: VIVA Q&A */}
          {activeTab === 'viva' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div className="font-bold text-white text-xs">
                  Q1. What is the fundamental difference between reactive and predictive campus maintenance?
                </div>
                <div className="text-slate-400 text-[11px]">
                  <strong>Answer:</strong> Reactive maintenance only fixes equipment after it breaks down (causing student disruption and expensive downtime). Predictive maintenance analyzes historical failure intervals (MTBF) and wear patterns to forecast upcoming failures before they occur, triggering pre-emptive service orders.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div className="font-bold text-white text-xs">
                  Q2. Why did you choose a microservice architecture separating Node.js and Python?
                </div>
                <div className="text-slate-400 text-[11px]">
                  <strong>Answer:</strong> Node.js with Express handles high-concurrency asynchronous I/O and REST endpoints effortlessly, while Python is the industry standard for scientific computing, OpenCV, NumPy, and Scikit-Learn. Decoupling them allows the AI engine to retrain and scale independently.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div className="font-bold text-white text-xs">
                  Q3. How does the system prioritize complaints?
                </div>
                <div className="text-slate-400 text-[11px]">
                  <strong>Answer:</strong> The prioritization engine uses a multi-factor weighting formula combining: (1) baseline category hazards (Electrical/Fire have high baseline), (2) NLP critical keywords (e.g. spark, smoke, flood), and (3) facility impact multiplier (e.g., Computer Labs and Exam Halls have 1.35x weight due to high student density).
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
