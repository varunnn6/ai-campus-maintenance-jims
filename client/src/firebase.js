// Firebase client configuration for JIMS Campus Maintenance System
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSy89MJwrHn4CpYDsEpX3rR4N68mt8mZWhVM",
  authDomain: "jims-campus-maintenance.firebaseapp.com",
  projectId: "jims-campus-maintenance",
  storageBucket: "jims-campus-maintenance.firebasestorage.app",
  messagingSenderId: "1041150839779",
  appId: "1:1041150839779:web:c824f53e690455b578aed6",
  measurementId: "G-YTQ9KCFPLC"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
export default app;

