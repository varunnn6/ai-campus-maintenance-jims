import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export let isMongoConnected = false;

// Embedded File-Based Store for 100% offline & zero-dependency execution
class JsonDatabase {
  constructor() {
    this.data = {
      users: [],
      facilities: [],
      complaints: [],
      maintenanceActions: [],
      predictions: [],
      activityLogs: []
    };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(content);
      } else {
        this.save();
      }
    } catch (err) {
      console.warn('[JsonDB] Could not load db.json, initializing fresh store:', err.message);
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[JsonDB] Error writing db.json:', err.message);
    }
  }

  getCollection(name) {
    if (!this.data[name]) {
      this.data[name] = [];
    }
    return this.data[name];
  }
}

export const jsonDb = new JsonDatabase();

// Connect Database with intelligent automatic fallback
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus_maintenance';
  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500
    });
    isMongoConnected = true;
    console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    isMongoConnected = false;
    console.log(`[Database] MongoDB not running locally (${error.message}).`);
    console.log(`[Database] Seamlessly activated Embedded File Database (server/data/db.json). Fully functional for all CRUD & Analytics!`);
  }
};
