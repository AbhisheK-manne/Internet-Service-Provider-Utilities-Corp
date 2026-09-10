import { UserProfile, DataObjectRecord, OutageGridZone, CaseRecord } from '../types';
import { INITIAL_DATA_OBJECTS, INITIAL_OUTAGES, INITIAL_CASES } from '../data/pegaBlueprintData';

const KEYS = {
  USER_PROFILE: 'gridflow_user_profile_v1',
  DATA_OBJECTS: 'gridflow_data_objects_v1',
  OUTAGES: 'gridflow_outages_v1',
  CASES: 'gridflow_cases_v1'
};

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Abhishek Manne',
  email: 'abhishekmanne0@gmail.com',
  phone: '+1 (555) 742-8821',
  accountNumber: 'ACCT-RES-994821',
  serviceAddress: '142 Skyline Boulevard, Apt 4B, Sector 4',
  serviceType: 'Dual Fuel & Fiber',
  meterId: 'MTR-AMI-9941829',
  substation: 'North Metro Substation #4',
  ratePlan: 'CleanGrid 100% Solar + GigSpeed Fiber ($0.142/kWh)',
  isSpecialNeeds: false
};

export function loadUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(KEYS.USER_PROFILE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load user profile from storage', e);
  }
  return DEFAULT_USER_PROFILE;
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save user profile', e);
  }
}

export function loadDataObjects(): DataObjectRecord[] {
  try {
    const raw = localStorage.getItem(KEYS.DATA_OBJECTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load data objects from storage', e);
  }
  return INITIAL_DATA_OBJECTS;
}

export function saveDataObjects(items: DataObjectRecord[]): void {
  try {
    localStorage.setItem(KEYS.DATA_OBJECTS, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save data objects', e);
  }
}

export function loadOutages(): OutageGridZone[] {
  try {
    const raw = localStorage.getItem(KEYS.OUTAGES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load outages from storage', e);
  }
  return INITIAL_OUTAGES;
}

export function saveOutages(items: OutageGridZone[]): void {
  try {
    localStorage.setItem(KEYS.OUTAGES, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save outages', e);
  }
}

export function loadCases(): CaseRecord[] {
  try {
    const raw = localStorage.getItem(KEYS.CASES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load cases from storage', e);
  }
  return INITIAL_CASES;
}

export function saveCases(items: CaseRecord[]): void {
  try {
    localStorage.setItem(KEYS.CASES, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save cases', e);
  }
}

export function resetAllToDefaults(): {
  profile: UserProfile;
  dataObjects: DataObjectRecord[];
  outages: OutageGridZone[];
  cases: CaseRecord[];
} {
  try {
    localStorage.removeItem(KEYS.USER_PROFILE);
    localStorage.removeItem(KEYS.DATA_OBJECTS);
    localStorage.removeItem(KEYS.OUTAGES);
    localStorage.removeItem(KEYS.CASES);
  } catch (e) {
    console.error('Error clearing localStorage', e);
  }
  return {
    profile: DEFAULT_USER_PROFILE,
    dataObjects: INITIAL_DATA_OBJECTS,
    outages: INITIAL_OUTAGES,
    cases: INITIAL_CASES
  };
}
