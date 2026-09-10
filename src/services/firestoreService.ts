/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { db, ensureAuth } from '../lib/firebase';
import { UserProfile, DataObjectRecord, OutageGridZone, CaseRecord } from '../types';
import {
  DEFAULT_USER_PROFILE,
  loadUserProfile as loadLocalProfile,
  saveUserProfile as saveLocalProfile,
  loadCases as loadLocalCases,
  saveCases as saveLocalCases,
  loadOutages as loadLocalOutages,
  saveOutages as saveLocalOutages,
  loadDataObjects as loadLocalDataObjects,
  saveDataObjects as saveLocalDataObjects
} from '../utils/storage';
import {
  INITIAL_DATA_OBJECTS,
  INITIAL_OUTAGES,
  INITIAL_CASES
} from '../data/pegaBlueprintData';

// Collection Names in Firestore
export const COLLECTIONS = {
  USER_PROFILE: 'user_profiles',
  CASES: 'cases',
  OUTAGES: 'outages',
  DATA_OBJECTS: 'data_objects'
};

// Fixed Document ID for primary active user profile
const PRIMARY_USER_DOC_ID = 'primary_account_holder';

// ----------------------------------------------------
// 1. USER PROFILE REPOSITORY
// ----------------------------------------------------
export async function getRemoteUserProfile(): Promise<UserProfile> {
  try {
    await ensureAuth();
    const docRef = doc(db, COLLECTIONS.USER_PROFILE, PRIMARY_USER_DOC_ID);
    const snapshot = await getDocs(collection(db, COLLECTIONS.USER_PROFILE));

    if (!snapshot.empty) {
      const found = snapshot.docs.find(d => d.id === PRIMARY_USER_DOC_ID) || snapshot.docs[0];
      const data = found.data() as UserProfile;
      saveLocalProfile(data);
      return data;
    } else {
      // Seed Firestore with current local or default profile
      const current = loadLocalProfile();
      await setDoc(docRef, current);
      return current;
    }
  } catch (err) {
    console.warn('Firestore getRemoteUserProfile failed, falling back to local storage:', err);
    return loadLocalProfile();
  }
}

export async function setRemoteUserProfile(profile: UserProfile): Promise<void> {
  saveLocalProfile(profile);
  try {
    await ensureAuth();
    const docRef = doc(db, COLLECTIONS.USER_PROFILE, PRIMARY_USER_DOC_ID);
    await setDoc(docRef, profile, { merge: true });
  } catch (err) {
    console.error('Failed to sync UserProfile to Firestore:', err);
  }
}

// ----------------------------------------------------
// 2. CASE RECORDS REPOSITORY
// ----------------------------------------------------
export async function getRemoteCases(): Promise<CaseRecord[]> {
  try {
    await ensureAuth();
    const colRef = collection(db, COLLECTIONS.CASES);
    const snapshot = await getDocs(colRef);

    if (!snapshot.empty) {
      const records: CaseRecord[] = [];
      snapshot.forEach(docSnap => {
        records.push(docSnap.data() as CaseRecord);
      });
      // Sort newest first
      records.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      saveLocalCases(records);
      return records;
    } else {
      // Seed initial cases
      const defaults = loadLocalCases().length > 0 ? loadLocalCases() : INITIAL_CASES;
      const batch = writeBatch(db);
      defaults.forEach(item => {
        const itemRef = doc(db, COLLECTIONS.CASES, item.id);
        batch.set(itemRef, item);
      });
      await batch.commit();
      saveLocalCases(defaults);
      return defaults;
    }
  } catch (err) {
    console.warn('Firestore getRemoteCases failed, falling back to local cache:', err);
    return loadLocalCases();
  }
}

export async function upsertRemoteCase(caseRecord: CaseRecord): Promise<void> {
  try {
    await ensureAuth();
    const docRef = doc(db, COLLECTIONS.CASES, caseRecord.id);
    await setDoc(docRef, caseRecord, { merge: true });
  } catch (err) {
    console.error(`Failed to upsert case ${caseRecord.id} in Firestore:`, err);
  }
}

export async function deleteRemoteCase(caseId: string): Promise<void> {
  try {
    await ensureAuth();
    const docRef = doc(db, COLLECTIONS.CASES, caseId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error(`Failed to delete case ${caseId} from Firestore:`, err);
  }
}

// ----------------------------------------------------
// 3. OUTAGES REPOSITORY
// ----------------------------------------------------
export async function getRemoteOutages(): Promise<OutageGridZone[]> {
  try {
    await ensureAuth();
    const colRef = collection(db, COLLECTIONS.OUTAGES);
    const snapshot = await getDocs(colRef);

    if (!snapshot.empty) {
      const records: OutageGridZone[] = [];
      snapshot.forEach(docSnap => {
        records.push(docSnap.data() as OutageGridZone);
      });
      saveLocalOutages(records);
      return records;
    } else {
      // Seed initial outages
      const defaults = loadLocalOutages().length > 0 ? loadLocalOutages() : INITIAL_OUTAGES;
      const batch = writeBatch(db);
      defaults.forEach(item => {
        const itemRef = doc(db, COLLECTIONS.OUTAGES, item.id);
        batch.set(itemRef, item);
      });
      await batch.commit();
      saveLocalOutages(defaults);
      return defaults;
    }
  } catch (err) {
    console.warn('Firestore getRemoteOutages failed, falling back to local cache:', err);
    return loadLocalOutages();
  }
}

export async function upsertRemoteOutage(outage: OutageGridZone): Promise<void> {
  try {
    await ensureAuth();
    const docRef = doc(db, COLLECTIONS.OUTAGES, outage.id);
    await setDoc(docRef, outage, { merge: true });
  } catch (err) {
    console.error(`Failed to upsert outage ${outage.id} in Firestore:`, err);
  }
}

// ----------------------------------------------------
// 4. DATA OBJECTS REPOSITORY
// ----------------------------------------------------
export async function getRemoteDataObjects(): Promise<DataObjectRecord[]> {
  try {
    await ensureAuth();
    const colRef = collection(db, COLLECTIONS.DATA_OBJECTS);
    const snapshot = await getDocs(colRef);

    if (!snapshot.empty) {
      const records: DataObjectRecord[] = [];
      snapshot.forEach(docSnap => {
        records.push(docSnap.data() as DataObjectRecord);
      });
      saveLocalDataObjects(records);
      return records;
    } else {
      // Seed initial data objects
      const defaults = loadLocalDataObjects().length > 0 ? loadLocalDataObjects() : INITIAL_DATA_OBJECTS;
      const batch = writeBatch(db);
      defaults.forEach(item => {
        const itemRef = doc(db, COLLECTIONS.DATA_OBJECTS, item.id);
        batch.set(itemRef, item);
      });
      await batch.commit();
      saveLocalDataObjects(defaults);
      return defaults;
    }
  } catch (err) {
    console.warn('Firestore getRemoteDataObjects failed, falling back to local cache:', err);
    return loadLocalDataObjects();
  }
}

export async function upsertRemoteDataObject(record: DataObjectRecord): Promise<void> {
  try {
    await ensureAuth();
    const docRef = doc(db, COLLECTIONS.DATA_OBJECTS, record.id);
    await setDoc(docRef, record, { merge: true });
  } catch (err) {
    console.error(`Failed to upsert data object ${record.id} in Firestore:`, err);
  }
}

export async function deleteRemoteDataObject(id: string): Promise<void> {
  try {
    await ensureAuth();
    const docRef = doc(db, COLLECTIONS.DATA_OBJECTS, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.error(`Failed to delete data object ${id} from Firestore:`, err);
  }
}

export async function batchUpsertRemoteDataObjects(records: DataObjectRecord[]): Promise<void> {
  try {
    await ensureAuth();
    const batch = writeBatch(db);
    records.forEach(item => {
      const docRef = doc(db, COLLECTIONS.DATA_OBJECTS, item.id);
      batch.set(docRef, item, { merge: true });
    });
    await batch.commit();
  } catch (err) {
    console.error('Failed to batch upsert data objects in Firestore:', err);
  }
}

// ----------------------------------------------------
// 5. RESET ALL DATA TO BLUEPRINT DEFAULTS
// ----------------------------------------------------
export async function resetRemoteAllToDefaults(): Promise<{
  profile: UserProfile;
  dataObjects: DataObjectRecord[];
  outages: OutageGridZone[];
  cases: CaseRecord[];
}> {
  try {
    await ensureAuth();

    // Reset User Profile
    await setDoc(doc(db, COLLECTIONS.USER_PROFILE, PRIMARY_USER_DOC_ID), DEFAULT_USER_PROFILE);

    // Reset Cases
    const casesBatch = writeBatch(db);
    INITIAL_CASES.forEach(c => {
      casesBatch.set(doc(db, COLLECTIONS.CASES, c.id), c);
    });
    await casesBatch.commit();

    // Reset Outages
    const outagesBatch = writeBatch(db);
    INITIAL_OUTAGES.forEach(o => {
      outagesBatch.set(doc(db, COLLECTIONS.OUTAGES, o.id), o);
    });
    await outagesBatch.commit();

    // Reset Data Objects
    const doBatch = writeBatch(db);
    INITIAL_DATA_OBJECTS.forEach(d => {
      doBatch.set(doc(db, COLLECTIONS.DATA_OBJECTS, d.id), d);
    });
    await doBatch.commit();
  } catch (err) {
    console.error('Failed to reset Firestore collections:', err);
  }

  saveLocalProfile(DEFAULT_USER_PROFILE);
  saveLocalCases(INITIAL_CASES);
  saveLocalOutages(INITIAL_OUTAGES);
  saveLocalDataObjects(INITIAL_DATA_OBJECTS);

  return {
    profile: DEFAULT_USER_PROFILE,
    dataObjects: INITIAL_DATA_OBJECTS,
    outages: INITIAL_OUTAGES,
    cases: INITIAL_CASES
  };
}
