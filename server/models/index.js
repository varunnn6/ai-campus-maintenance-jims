import { getDb } from '../config/firebase.js';
import crypto from 'crypto';

// ---------------------------------------------------------------
// FIRESTORE COLLECTION ADAPTER
// Provides the same API surface as the old Mongoose/JSON adapter
// so all controllers work without changes.
// ---------------------------------------------------------------

const createFirestoreAdapter = (collectionName) => ({

  async find(query = {}) {
    const db = getDb();
    let ref = db.collection(collectionName);
    let snapshot;
    try {
      snapshot = await ref.orderBy('createdAt', 'desc').get();
    } catch (e) {
      snapshot = await ref.get();
    }
    let docs = snapshot.docs.map(d => ({ _id: d.id, ...d.data() }));

    // Apply query filters
    if (Object.keys(query).length > 0) {
      docs = docs.filter(item => {
        for (const [k, v] of Object.entries(query)) {
          if (v && typeof v === 'object' && v.$ne !== undefined) {
            if (item[k] === v.$ne) return false;
          } else if (v !== undefined && item[k] !== v) {
            return false;
          }
        }
        return true;
      });
    }
    return docs;
  },

  async findById(id) {
    const db = getDb();
    const doc = await db.collection(collectionName).doc(id).get();
    if (!doc.exists) return null;
    return { _id: doc.id, ...doc.data() };
  },

  async findOne(query = {}) {
    const docs = await this.find(query);
    return docs.find(item => {
      for (const [k, v] of Object.entries(query)) {
        if (v !== undefined && item[k] !== v) return false;
      }
      return true;
    }) || null;
  },

  async create(doc) {
    const db = getDb();
    const id = doc._id || crypto.randomUUID();
    const now = new Date().toISOString();
    const newDoc = {
      ...doc,
      _id: id,
      createdAt: doc.createdAt || now,
      updatedAt: doc.updatedAt || now,
    };
    // Remove _id from stored fields (Firestore uses doc id)
    const { _id, ...firestoreData } = newDoc;
    await db.collection(collectionName).doc(id).set(firestoreData);
    return newDoc;
  },

  async findByIdAndUpdate(id, update, options = { new: true }) {
    const db = getDb();
    const ref = db.collection(collectionName).doc(id);
    const doc = await ref.get();
    if (!doc.exists) return null;

    const current = { _id: doc.id, ...doc.data() };
    let updatedFields = update.$set ? { ...update.$set } : {};

    if (!update.$set && !update.$push) {
      // Plain update object
      updatedFields = { ...update };
    }

    if (update.$push) {
      for (const [arrKey, arrVal] of Object.entries(update.$push)) {
        const existing = current[arrKey] || [];
        updatedFields[arrKey] = [...existing, arrVal];
      }
    }

    updatedFields.updatedAt = new Date().toISOString();

    // Remove _id from stored data
    const { _id, ...cleanFields } = updatedFields;
    await ref.update(cleanFields);

    return { ...current, ...updatedFields };
  },

  async deleteOne(query) {
    const db = getDb();
    const docs = await this.find(query);
    const match = docs.find(item => {
      for (const [k, v] of Object.entries(query)) {
        if (item[k] !== v) return false;
      }
      return true;
    });
    if (!match) return { deletedCount: 0 };
    await db.collection(collectionName).doc(match._id).delete();
    return { deletedCount: 1 };
  },

  async countDocuments(query = {}) {
    const docs = await this.find(query);
    return docs.length;
  }
});

export const User             = createFirestoreAdapter('users');
export const Facility         = createFirestoreAdapter('facilities');
export const Complaint        = createFirestoreAdapter('complaints');
export const MaintenanceAction = createFirestoreAdapter('maintenanceActions');
export const Prediction       = createFirestoreAdapter('predictions');
export const ActivityLog      = createFirestoreAdapter('activityLogs');
