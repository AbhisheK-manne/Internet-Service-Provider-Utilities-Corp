/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PersonaBanner } from './components/PersonaBanner';
import { CaseList } from './components/CaseList';
import { CaseDetailModal } from './components/CaseDetailModal';
import { NewCaseModal } from './components/NewCaseModal';
import { PegaWorkflowDesigner } from './components/PegaWorkflowDesigner';
import { OutageCommandCenter } from './components/OutageCommandCenter';
import { DataObjectsViewer } from './components/DataObjectsViewer';
import { AiCopilotDrawer } from './components/AiCopilotDrawer';
import { PegaBlueprintModal } from './components/PegaBlueprintModal';
import { MyDataModal } from './components/MyDataModal';

import { CaseRecord, PersonaType, WorkflowType, UserProfile, DataObjectRecord, OutageGridZone } from './types';
import { BLUEPRINT_META } from './data/pegaBlueprintData';
import { 
  loadUserProfile, 
  saveUserProfile, 
  loadDataObjects, 
  saveDataObjects, 
  loadOutages, 
  saveOutages, 
  loadCases, 
  saveCases, 
  resetAllToDefaults 
} from './utils/storage';
import {
  getRemoteUserProfile,
  setRemoteUserProfile,
  getRemoteCases,
  upsertRemoteCase,
  getRemoteOutages,
  upsertRemoteOutage,
  getRemoteDataObjects,
  upsertRemoteDataObject,
  deleteRemoteDataObject,
  batchUpsertRemoteDataObjects,
  resetRemoteAllToDefaults
} from './services/firestoreService';

export default function App() {
  // Persistent runtime states
  const [userProfile, setUserProfile] = useState<UserProfile>(loadUserProfile);
  const [dataObjects, setDataObjects] = useState<DataObjectRecord[]>(loadDataObjects);
  const [outages, setOutages] = useState<OutageGridZone[]>(loadOutages);
  const [cases, setCases] = useState<CaseRecord[]>(loadCases);
  const [isFirestoreSyncing, setIsFirestoreSyncing] = useState<boolean>(true);

  // Load from Cloud Firestore on mount
  useEffect(() => {
    let isMounted = true;
    async function loadCloudData() {
      try {
        setIsFirestoreSyncing(true);
        const [cloudProfile, cloudCases, cloudOutages, cloudDataObjects] = await Promise.all([
          getRemoteUserProfile(),
          getRemoteCases(),
          getRemoteOutages(),
          getRemoteDataObjects()
        ]);

        if (isMounted) {
          if (cloudProfile) setUserProfile(cloudProfile);
          if (cloudCases && cloudCases.length > 0) setCases(cloudCases);
          if (cloudOutages && cloudOutages.length > 0) setOutages(cloudOutages);
          if (cloudDataObjects && cloudDataObjects.length > 0) setDataObjects(cloudDataObjects);
        }
      } catch (err) {
        console.warn('Initial Firestore sync completed with local cache fallback:', err);
      } finally {
        if (isMounted) setIsFirestoreSyncing(false);
      }
    }

    loadCloudData();
    return () => {
      isMounted = false;
    };
  }, []);

  const [activePersona, setActivePersona] = useState<PersonaType>('csr');
  const [activeTab, setActiveTab] = useState<'cases' | 'workflows' | 'outages' | 'data_objects' | 'ai_copilot'>('cases');
  
  const [selectedCase, setSelectedCase] = useState<CaseRecord | null>(null);
  const [isNewCaseOpen, setIsNewCaseOpen] = useState(false);
  const [preselectedWorkflow, setPreselectedWorkflow] = useState<WorkflowType | undefined>(undefined);
  const [isBlueprintModalOpen, setIsBlueprintModalOpen] = useState(false);
  const [isMyDataModalOpen, setIsMyDataModalOpen] = useState(false);

  // Critical counts
  const criticalCasesCount = cases.filter(c => c.priority === 'Critical' && c.currentStage !== 'resolved').length;
  const activeOutagesCount = outages.filter(o => o.status !== 'Restored').length;

  // Case updates
  const handleUpdateCase = (updated: CaseRecord) => {
    setCases(prev => {
      const next = prev.map(c => c.id === updated.id ? updated : c);
      saveCases(next);
      return next;
    });
    setSelectedCase(updated);
    upsertRemoteCase(updated);
  };

  const handleCreateCase = (newCase: CaseRecord) => {
    setCases(prev => {
      const next = [newCase, ...prev];
      saveCases(next);
      return next;
    });
    setSelectedCase(newCase);
    upsertRemoteCase(newCase);
  };

  // Outage updates
  const handleUpdateOutageStatus = (id: string, newStatus: OutageGridZone['status']) => {
    setOutages(prev => {
      const next = prev.map(o => {
        if (o.id === id) {
          const updated = { ...o, status: newStatus };
          upsertRemoteOutage(updated);
          return updated;
        }
        return o;
      });
      saveOutages(next);
      return next;
    });
  };

  const handleAddOutage = (newOutage: OutageGridZone) => {
    setOutages(prev => {
      const next = [newOutage, ...prev];
      saveOutages(next);
      return next;
    });
    upsertRemoteOutage(newOutage);
  };

  // Data Objects updates
  const handleAddDataObject = (record: DataObjectRecord) => {
    setDataObjects(prev => {
      const next = [record, ...prev];
      saveDataObjects(next);
      return next;
    });
    upsertRemoteDataObject(record);
  };

  const handleUpdateDataObject = (updated: DataObjectRecord) => {
    setDataObjects(prev => {
      const next = prev.map(d => d.id === updated.id ? updated : d);
      saveDataObjects(next);
      return next;
    });
    upsertRemoteDataObject(updated);
  };

  const handleDeleteDataObject = (id: string) => {
    setDataObjects(prev => {
      const next = prev.filter(d => d.id !== id);
      saveDataObjects(next);
      return next;
    });
    deleteRemoteDataObject(id);
  };

  const handleImportDataObjects = (importedRecords: DataObjectRecord[]) => {
    setDataObjects(prev => {
      // deduplicate by id
      const existingIds = new Set(importedRecords.map(r => r.id));
      const remaining = prev.filter(p => !existingIds.has(p.id));
      const next = [...importedRecords, ...remaining];
      saveDataObjects(next);
      return next;
    });
    batchUpsertRemoteDataObjects(importedRecords);
  };

  // User profile updates
  const handleSaveUserProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    saveUserProfile(profile);
    setRemoteUserProfile(profile);
  };

  // Sync profile into Pega System of Record
  const handleSyncProfileToDataObjects = (profile: UserProfile) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const syncedItems: DataObjectRecord[] = [
      {
        id: 'DO-USER-CONTACT',
        objectType: 'Contact',
        name: profile.name,
        systemOfRecord: 'Pega(Local)',
        details: {
          fullName: profile.name,
          email: profile.email,
          phone: profile.phone,
          accountNumber: profile.accountNumber,
          customerType: 'Primary Residential Account Holder'
        },
        updatedAt: now
      },
      {
        id: 'DO-USER-ACCOUNT',
        objectType: 'Consumer Account',
        name: `${profile.name} Primary Account`,
        systemOfRecord: 'Pega(Local)',
        details: {
          accountNumber: profile.accountNumber,
          serviceType: profile.serviceType,
          ratePlan: profile.ratePlan,
          status: 'Active (Current Balance $0.00)',
          autoPay: true
        },
        updatedAt: now
      },
      {
        id: 'DO-USER-LOCATION',
        objectType: 'Location',
        name: profile.serviceAddress,
        systemOfRecord: 'Pega(Local)',
        details: {
          address: profile.serviceAddress,
          substationHub: profile.substation,
          medicalLifeSupportRegistry: profile.isSpecialNeeds,
          premiseType: 'Residential Premise'
        },
        updatedAt: now
      },
      {
        id: 'DO-USER-METER',
        objectType: 'Asset',
        name: `Smart AMI Meter (${profile.meterId})`,
        systemOfRecord: 'Pega(Local)',
        details: {
          serialNumber: profile.meterId,
          feederSubstation: profile.substation,
          voltageReading: '121.6 V',
          status: 'Operational Heartbeat Normal'
        },
        updatedAt: now
      }
    ];

    handleImportDataObjects(syncedItems);
    handleSaveUserProfile(profile);
  };

  // Reset to blueprint defaults
  const handleResetAllData = async () => {
    setIsFirestoreSyncing(true);
    try {
      const defaults = await resetRemoteAllToDefaults();
      setUserProfile(defaults.profile);
      setDataObjects(defaults.dataObjects);
      setOutages(defaults.outages);
      setCases(defaults.cases);
    } catch (err) {
      console.warn('Resetting locally:', err);
      const defaults = resetAllToDefaults();
      setUserProfile(defaults.profile);
      setDataObjects(defaults.dataObjects);
      setOutages(defaults.outages);
      setCases(defaults.cases);
    } finally {
      setIsFirestoreSyncing(false);
    }
  };

  const handleLaunchCaseWithWorkflow = (workflowId: WorkflowType) => {
    setPreselectedWorkflow(workflowId);
    setIsNewCaseOpen(true);
  };

  const handleLaunchCaseFromAi = (workflow: WorkflowType, text: string, priority: 'Low' | 'Medium' | 'High' | 'Critical') => {
    setPreselectedWorkflow(workflow);
    setIsNewCaseOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Top Application Bar */}
      <Header
        activePersona={activePersona}
        onSelectPersona={setActivePersona}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenNewCase={() => {
          setPreselectedWorkflow(undefined);
          setIsNewCaseOpen(true);
        }}
        onOpenWorkflowDesigner={() => setIsBlueprintModalOpen(true)}
        onOpenMyData={() => setIsMyDataModalOpen(true)}
        criticalCasesCount={criticalCasesCount}
        activeOutagesCount={activeOutagesCount}
        isFirestoreSyncing={isFirestoreSyncing}
      />

      {/* Role Context Notification Banner */}
      <PersonaBanner
        activePersona={activePersona}
        onSelectPersona={setActivePersona}
        userProfile={userProfile}
        onOpenMyData={() => setIsMyDataModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'cases' && (
          <CaseList
            cases={cases}
            onSelectCase={(record) => setSelectedCase(record)}
            onOpenNewCase={() => {
              setPreselectedWorkflow(undefined);
              setIsNewCaseOpen(true);
            }}
            activePersona={activePersona}
          />
        )}

        {activeTab === 'workflows' && (
          <PegaWorkflowDesigner
            onTriggerNewCaseWithWorkflow={handleLaunchCaseWithWorkflow}
          />
        )}

        {activeTab === 'outages' && (
          <OutageCommandCenter
            outages={outages}
            onUpdateOutageStatus={handleUpdateOutageStatus}
            onAddOutage={handleAddOutage}
            onTriggerOutageCase={() => {
              handleLaunchCaseWithWorkflow('service_outage_report');
            }}
          />
        )}

        {activeTab === 'data_objects' && (
          <DataObjectsViewer
            dataObjects={dataObjects}
            onOpenMyDataModal={() => setIsMyDataModalOpen(true)}
            onUpdateDataObject={handleUpdateDataObject}
            onDeleteDataObject={handleDeleteDataObject}
          />
        )}

        {activeTab === 'ai_copilot' && (
          <AiCopilotDrawer
            onLaunchCaseWithDraft={handleLaunchCaseFromAi}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800/80 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Pega Blueprint™ Customer Service Engine</span>
            <span>•</span>
            <span className="font-mono text-blue-400">{BLUEPRINT_META.id}</span>
            <span>•</span>
            <span>Active Profile: <strong className="text-slate-300">{userProfile.name}</strong> ({userProfile.accountNumber})</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMyDataModalOpen(true)}
              className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
            >
              Input / Manage My Data
            </button>
            <span>•</span>
            <button
              onClick={() => setIsBlueprintModalOpen(true)}
              className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
              View Blueprint Specification
            </button>
          </div>
        </div>
      </footer>

      {/* Case Detail Lifecycle Modal */}
      {selectedCase && (
        <CaseDetailModal
          caseRecord={selectedCase}
          onClose={() => setSelectedCase(null)}
          onUpdateCase={handleUpdateCase}
          activePersona={activePersona}
        />
      )}

      {/* New Case Creation Wizard */}
      <NewCaseModal
        isOpen={isNewCaseOpen}
        onClose={() => setIsNewCaseOpen(false)}
        onCreateCase={handleCreateCase}
        preselectedWorkflowId={preselectedWorkflow}
        userProfile={userProfile}
      />

      {/* Pega Blueprint Architecture Specification Modal */}
      <PegaBlueprintModal
        isOpen={isBlueprintModalOpen}
        onClose={() => setIsBlueprintModalOpen(false)}
      />

      {/* Input My Data & System of Record Management Modal */}
      <MyDataModal
        isOpen={isMyDataModalOpen}
        onClose={() => setIsMyDataModalOpen(false)}
        userProfile={userProfile}
        onSaveUserProfile={handleSaveUserProfile}
        dataObjects={dataObjects}
        onAddDataObject={handleAddDataObject}
        onImportDataObjects={handleImportDataObjects}
        onSyncProfileToDataObjects={handleSyncProfileToDataObjects}
        onResetAllData={handleResetAllData}
      />

    </div>
  );
}
