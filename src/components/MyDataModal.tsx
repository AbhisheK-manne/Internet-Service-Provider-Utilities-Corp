import React, { useState } from 'react';
import { 
  X, 
  User, 
  Database, 
  Upload, 
  Download, 
  RotateCcw, 
  Check, 
  Save, 
  Plus, 
  Trash2, 
  Building2, 
  Zap, 
  Cpu, 
  MapPin, 
  CreditCard, 
  Receipt, 
  Calendar, 
  Box,
  FileText,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { UserProfile, DataObjectRecord, DataObjectType, CaseRecord, OutageGridZone } from '../types';

interface MyDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSaveUserProfile: (profile: UserProfile) => void;
  dataObjects: DataObjectRecord[];
  onAddDataObject: (record: DataObjectRecord) => void;
  onImportDataObjects: (records: DataObjectRecord[]) => void;
  onSyncProfileToDataObjects: (profile: UserProfile) => void;
  onResetAllData: () => void;
}

export const MyDataModal: React.FC<MyDataModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveUserProfile,
  dataObjects,
  onAddDataObject,
  onImportDataObjects,
  onSyncProfileToDataObjects,
  onResetAllData
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'new_object' | 'import_export'>('profile');

  // Profile Form State
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [phone, setPhone] = useState(userProfile.phone);
  const [accountNumber, setAccountNumber] = useState(userProfile.accountNumber);
  const [serviceAddress, setServiceAddress] = useState(userProfile.serviceAddress);
  const [serviceType, setServiceType] = useState(userProfile.serviceType);
  const [meterId, setMeterId] = useState(userProfile.meterId);
  const [substation, setSubstation] = useState(userProfile.substation);
  const [ratePlan, setRatePlan] = useState(userProfile.ratePlan);
  const [isSpecialNeeds, setIsSpecialNeeds] = useState(userProfile.isSpecialNeeds);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  // New Data Object State
  const [newObjectType, setNewObjectType] = useState<DataObjectType>('Contact');
  const [newObjectName, setNewObjectName] = useState('');
  const [newObjectId, setNewObjectId] = useState('');
  const [customFields, setCustomFields] = useState<{ key: string; value: string }[]>([
    { key: 'phone', value: '+1 (555) 000-1234' },
    { key: 'customerTier', value: 'Residential Gold' }
  ]);
  const [objectCreatedSuccess, setObjectCreatedSuccess] = useState(false);

  // Import / Export State
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState('');
  const [importSuccessMsg, setImportSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      name,
      email,
      phone,
      accountNumber,
      serviceAddress,
      serviceType,
      meterId,
      substation,
      ratePlan,
      isSpecialNeeds
    };
    onSaveUserProfile(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleSyncProfile = () => {
    const current: UserProfile = {
      name,
      email,
      phone,
      accountNumber,
      serviceAddress,
      serviceType,
      meterId,
      substation,
      ratePlan,
      isSpecialNeeds
    };
    onSyncProfileToDataObjects(current);
    setSyncSuccess(true);
    setTimeout(() => setSyncSuccess(false), 3000);
  };

  const handleAddCustomField = () => {
    setCustomFields(prev => [...prev, { key: '', value: '' }]);
  };

  const handleRemoveCustomField = (index: number) => {
    setCustomFields(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateDataObject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObjectName.trim()) return;

    const id = newObjectId.trim() || `DO-USER-${Date.now().toString().slice(-4)}`;
    const detailsRecord: Record<string, string | number | boolean> = {};

    customFields.forEach(f => {
      if (f.key.trim()) {
        if (f.value.toLowerCase() === 'true') detailsRecord[f.key.trim()] = true;
        else if (f.value.toLowerCase() === 'false') detailsRecord[f.key.trim()] = false;
        else if (!isNaN(Number(f.value)) && f.value.trim() !== '') detailsRecord[f.key.trim()] = Number(f.value);
        else detailsRecord[f.key.trim()] = f.value;
      }
    });

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newRecord: DataObjectRecord = {
      id,
      objectType: newObjectType,
      name: newObjectName.trim(),
      systemOfRecord: 'Pega(Local)',
      details: detailsRecord,
      updatedAt: now
    };

    onAddDataObject(newRecord);
    setObjectCreatedSuccess(true);
    setNewObjectName('');
    setNewObjectId('');
    setTimeout(() => setObjectCreatedSuccess(false), 2500);
  };

  const handleImportJson = () => {
    setImportError('');
    setImportSuccessMsg('');
    try {
      const parsed = JSON.parse(importJsonText);
      if (Array.isArray(parsed)) {
        // Validate array of DataObjectRecord
        const validRecords: DataObjectRecord[] = parsed.map((item, idx) => ({
          id: item.id || `DO-IMP-${Date.now().toString().slice(-3)}-${idx}`,
          objectType: item.objectType || 'Contact',
          name: item.name || `Imported Item ${idx + 1}`,
          systemOfRecord: 'Pega(Local)',
          details: item.details || {},
          updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
        }));
        onImportDataObjects(validRecords);
        setImportSuccessMsg(`Successfully imported ${validRecords.length} data object records!`);
      } else if (typeof parsed === 'object' && parsed !== null) {
        // Maybe single object or container
        if (parsed.profile) {
          onSaveUserProfile({ ...userProfile, ...parsed.profile });
        }
        if (parsed.dataObjects && Array.isArray(parsed.dataObjects)) {
          onImportDataObjects(parsed.dataObjects);
        }
        setImportSuccessMsg('Successfully loaded and applied data configuration!');
      } else {
        setImportError('JSON must be an array of data objects or a config object.');
      }
    } catch (err: any) {
      setImportError(`Invalid JSON format: ${err.message}`);
    }
  };

  const handleLoadSampleTemplate = () => {
    const sample = [
      {
        id: `DO-USER-ACC`,
        objectType: 'Consumer Account',
        name: `${name}'s Primary Account`,
        details: {
          accountNumber: accountNumber,
          serviceTier: 'Residential Solar + GigSpeed',
          status: 'Active',
          balanceDue: '$0.00',
          autoPayEnabled: true
        }
      },
      {
        id: `DO-USER-MTR`,
        objectType: 'Asset',
        name: `Smart AMI Meter (${meterId})`,
        details: {
          serialNumber: meterId,
          lastPing: 'Just now (Heartbeat Normal)',
          feederSubstation: substation,
          voltage: '121.8 V',
          status: 'Operational'
        }
      },
      {
        id: `DO-USER-LOC`,
        objectType: 'Location',
        name: serviceAddress,
        details: {
          address: serviceAddress,
          type: 'Residential Premise',
          specialNeedsLifeSupport: isSpecialNeeds
        }
      }
    ];
    setImportJsonText(JSON.stringify(sample, null, 2));
  };

  const handleExportData = () => {
    const payload = {
      exportTimestamp: new Date().toISOString(),
      userProfile: {
        name,
        email,
        phone,
        accountNumber,
        serviceAddress,
        serviceType,
        meterId,
        substation,
        ratePlan,
        isSpecialNeeds
      },
      dataObjects: dataObjects
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `gridflow-my-data-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Input &amp; Manage My Data
                </h3>
                <span className="font-mono text-xs text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  Firebase Firestore Connected
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Configure your customer account profile, inject custom System of Record data objects, or import JSON/CSV synced securely to Cloud Firestore.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-800 bg-slate-950/40 flex items-center gap-2 pt-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'profile'
                ? 'border-blue-500 text-blue-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>My Account &amp; Premise</span>
          </button>

          <button
            onClick={() => setActiveTab('new_object')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'new_object'
                ? 'border-indigo-500 text-indigo-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Add Data Object Record</span>
          </button>

          <button
            onClick={() => setActiveTab('import_export')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'import_export'
                ? 'border-cyan-500 text-cyan-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Import / Export JSON</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 text-xs text-slate-300">
          
          {/* TAB 1: User Profile Form */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="bg-blue-950/30 border border-blue-800/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    Personal Utility Profile
                  </h4>
                  <p className="text-slate-400 text-xs mt-0.5">
                    This data is used as your active identity in the Customer portal, autofills case creation wizards, and binds to grid smart meter telemetry.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSyncProfile}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/50 text-indigo-200 text-xs font-semibold transition-colors shrink-0 flex items-center gap-1.5"
                >
                  <Database className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Sync to Pega SoR</span>
                </button>
              </div>

              {syncSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 flex items-center gap-2 text-xs">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Your profile details have been synced into Contact, Consumer Account, Location, and Smart Meter Asset in Pega(Local) Data Objects!</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Full Customer / Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g. Abhishek Manne"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Account Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                    placeholder="e.g. ACCT-RES-994821"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g. abhishekmanne0@gmail.com"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g. +1 (555) 742-8821"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Service Premise Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={serviceAddress}
                    onChange={(e) => setServiceAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g. 142 Skyline Boulevard, Apt 4B, Sector 4"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Primary Service Type
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Electric Grid">Electric Grid</option>
                    <option value="Fiber Internet">Fiber Internet</option>
                    <option value="Natural Gas">Natural Gas</option>
                    <option value="Dual Fuel & Fiber">Dual Fuel & Fiber</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Smart Meter / Asset Serial Number
                  </label>
                  <input
                    type="text"
                    value={meterId}
                    onChange={(e) => setMeterId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                    placeholder="e.g. MTR-AMI-9941829"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Grid Substation / Feeder Hub
                  </label>
                  <input
                    type="text"
                    value={substation}
                    onChange={(e) => setSubstation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g. North Metro Substation #4"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Utility Rate Plan / Tariff
                  </label>
                  <input
                    type="text"
                    value={ratePlan}
                    onChange={(e) => setRatePlan(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g. CleanGrid 100% Solar ($0.142/kWh)"
                  />
                </div>
              </div>

              {/* Special Medical Needs Flag */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4">
                <div>
                  <span className="font-semibold text-white block">Medical Life-Support Equipment Flag</span>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Mandatory life-support registry (oxygen concentrator, home dialysis). Triggers Critical priority escalation on outage reports.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSpecialNeeds}
                    onChange={(e) => setIsSpecialNeeds(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                {saveSuccess && (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-4 h-4" /> Profile Saved!
                  </span>
                )}
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-md shadow-blue-600/30"
                >
                  <Save className="w-4 h-4" />
                  <span>Save My Profile</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Add New Data Object Record */}
          {activeTab === 'new_object' && (
            <form onSubmit={handleCreateDataObject} className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-white">
                  Add Record to Pega System of Record
                </h4>
                <p className="text-slate-400 text-xs mt-0.5">
                  Directly input a new record into any of the 10 Pega Blueprint Data Objects.
                </p>
              </div>

              {objectCreatedSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 flex items-center gap-2 text-xs">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Data Object record successfully added to Pega(Local) SoR!</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Data Object Schema *
                  </label>
                  <select
                    value={newObjectType}
                    onChange={(e) => setNewObjectType(e.target.value as DataObjectType)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Contact">Contact</option>
                    <option value="Consumer Account">Consumer Account</option>
                    <option value="Business Account">Business Account</option>
                    <option value="Service Account">Service Account</option>
                    <option value="Asset">Asset</option>
                    <option value="Location">Location</option>
                    <option value="Transaction">Transaction</option>
                    <option value="Statement">Statement</option>
                    <option value="Appointment">Appointment</option>
                    <option value="Product">Product</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Record ID (optional)
                  </label>
                  <input
                    type="text"
                    value={newObjectId}
                    onChange={(e) => setNewObjectId(e.target.value)}
                    placeholder="e.g. DO-CUSTOM-01"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Record Name / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newObjectName}
                    onChange={(e) => setNewObjectName(e.target.value)}
                    placeholder="e.g. Primary Residence Meter"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Dynamic Attributes */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Custom Attributes (Key-Value pairs)
                  </span>
                  <button
                    type="button"
                    onClick={handleAddCustomField}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Field</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {customFields.map((field, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Property name (e.g. serialNumber)"
                        value={field.key}
                        onChange={(e) => {
                          const updated = [...customFields];
                          updated[idx].key = e.target.value;
                          setCustomFields(updated);
                        }}
                        className="w-1/3 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                      />
                      <input
                        type="text"
                        placeholder="Value (e.g. SN-889123)"
                        value={field.value}
                        onChange={(e) => {
                          const updated = [...customFields];
                          updated[idx].value = e.target.value;
                          setCustomFields(updated);
                        }}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomField(idx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-md shadow-indigo-600/30"
                >
                  <Plus className="w-4 h-4" />
                  <span>Insert Record into SoR</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Import & Export JSON */}
          {activeTab === 'import_export' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Bulk Import &amp; Export Data
                  </h4>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Paste JSON records or export your full configuration for backup and portability.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleLoadSampleTemplate}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                  >
                    Load Template
                  </button>
                  <button
                    type="button"
                    onClick={handleExportData}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export All Data</span>
                  </button>
                </div>
              </div>

              {importError && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 flex items-center gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {importSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 flex items-center gap-2 text-xs">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{importSuccessMsg}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Paste JSON Array of Data Objects or Configuration
                </label>
                <textarea
                  rows={8}
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder={`[\n  {\n    "id": "DO-CUSTOM-01",\n    "objectType": "Contact",\n    "name": "Alex Mercer",\n    "details": { "phone": "+1 555-0199", "email": "alex@example.com" }\n  }\n]`}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 font-mono text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to reset all data back to the default Pega Blueprint template?')) {
                      onResetAllData();
                      onClose();
                    }
                  }}
                  className="text-rose-400 hover:text-rose-300 flex items-center gap-1.5 transition-colors text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Data to Blueprint Defaults</span>
                </button>

                <button
                  type="button"
                  onClick={handleImportJson}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-md shadow-cyan-600/30"
                >
                  <Upload className="w-4 h-4" />
                  <span>Apply &amp; Import JSON</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
