import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  Layers, 
  CheckCircle2, 
  Clock, 
  User, 
  Building2, 
  Zap, 
  Cpu, 
  MapPin, 
  CreditCard, 
  Receipt, 
  Calendar, 
  Box,
  Key,
  Plus,
  Edit3,
  Trash2,
  Upload,
  Check,
  X
} from 'lucide-react';
import { DataObjectRecord, DataObjectType } from '../types';

const OBJECT_ICONS: Record<DataObjectType, React.ReactNode> = {
  'Contact': <User className="w-4 h-4 text-blue-400" />,
  'Consumer Account': <User className="w-4 h-4 text-emerald-400" />,
  'Business Account': <Building2 className="w-4 h-4 text-indigo-400" />,
  'Service Account': <Zap className="w-4 h-4 text-amber-400" />,
  'Asset': <Cpu className="w-4 h-4 text-purple-400" />,
  'Location': <MapPin className="w-4 h-4 text-rose-400" />,
  'Transaction': <CreditCard className="w-4 h-4 text-teal-400" />,
  'Statement': <Receipt className="w-4 h-4 text-orange-400" />,
  'Appointment': <Calendar className="w-4 h-4 text-cyan-400" />,
  'Product': <Box className="w-4 h-4 text-emerald-500" />
};

interface DataObjectsViewerProps {
  dataObjects: DataObjectRecord[];
  onOpenMyDataModal: () => void;
  onUpdateDataObject: (updated: DataObjectRecord) => void;
  onDeleteDataObject: (id: string) => void;
}

export const DataObjectsViewer: React.FC<DataObjectsViewerProps> = ({
  dataObjects,
  onOpenMyDataModal,
  onUpdateDataObject,
  onDeleteDataObject
}) => {
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeObjectId, setActiveObjectId] = useState<string>(dataObjects[0]?.id || '');
  
  // Inline editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editFields, setEditFields] = useState<{ key: string; value: string }[]>([]);

  const objectTypes: string[] = [
    'All',
    'Contact',
    'Consumer Account',
    'Business Account',
    'Service Account',
    'Asset',
    'Location',
    'Transaction',
    'Statement',
    'Appointment',
    'Product'
  ];

  const filtered = dataObjects.filter(item => {
    if (selectedType !== 'All' && item.objectType !== selectedType) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchId = item.id.toLowerCase().includes(q);
      if (!matchName && !matchId) return false;
    }
    return true;
  });

  const activeRecord = dataObjects.find(d => d.id === activeObjectId) || filtered[0] || dataObjects[0];

  const handleStartEdit = () => {
    if (!activeRecord) return;
    setEditName(activeRecord.name);
    const fields = Object.entries(activeRecord.details).map(([k, v]) => ({
      key: k,
      value: String(v)
    }));
    setEditFields(fields);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!activeRecord) return;
    const detailsRecord: Record<string, string | number | boolean> = {};
    editFields.forEach(f => {
      if (f.key.trim()) {
        if (f.value.toLowerCase() === 'true') detailsRecord[f.key.trim()] = true;
        else if (f.value.toLowerCase() === 'false') detailsRecord[f.key.trim()] = false;
        else if (!isNaN(Number(f.value)) && f.value.trim() !== '') detailsRecord[f.key.trim()] = Number(f.value);
        else detailsRecord[f.key.trim()] = f.value;
      }
    });

    const updated: DataObjectRecord = {
      ...activeRecord,
      name: editName.trim() || activeRecord.name,
      details: detailsRecord,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    onUpdateDataObject(updated);
    setIsEditing(false);
  };

  const handleDeleteRecord = (id: string) => {
    if (window.confirm(`Are you sure you want to delete data object record ${id}?`)) {
      onDeleteDataObject(id);
      const remaining = dataObjects.filter(d => d.id !== id);
      if (remaining.length > 0) {
        setActiveObjectId(remaining[0].id);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Context */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <Database className="w-4 h-4 text-indigo-400" />
            <span>Pega Blueprint Data Model • 10 Core Data Objects</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Data Objects &amp; System of Record Directory
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Live directory of all 10 unified schemas operating under Pega(Local) SoR. You can input custom data records, edit properties, and import JSON/CSV.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMyDataModal}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Input / Import My Data</span>
          </button>

          <span className="px-3 py-1.5 rounded-xl bg-indigo-950/80 text-indigo-300 border border-indigo-800 text-xs font-mono hidden sm:inline-block">
            {dataObjects.length} Records Loaded
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search data records by ID or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9.5 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Object Types Pill List */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
          {objectTypes.map(t => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedType === t
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Master Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Records List */}
        <div className="lg:col-span-5 space-y-2 max-h-[580px] overflow-y-auto pr-1">
          {filtered.map(record => {
            const isSelected = record.id === (activeRecord?.id);
            return (
              <div
                key={record.id}
                id={`data-object-${record.id}`}
                onClick={() => {
                  setActiveObjectId(record.id);
                  setIsEditing(false);
                }}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-800/90 border-indigo-500 shadow-md ring-1 ring-indigo-500/40 text-white'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {OBJECT_ICONS[record.objectType]}
                    <span className="text-xs font-semibold text-indigo-400">
                      {record.objectType}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-500">
                    {record.id}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white mt-1 truncate">
                  {record.name}
                </h4>

                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/60">
                  <span className="text-slate-500">SoR: {record.systemOfRecord}</span>
                  <span className="font-mono text-slate-500">Updated {record.updatedAt}</span>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="p-8 text-center bg-slate-900 rounded-xl border border-slate-800 text-slate-400 text-xs">
              No matching records found. Click "Input / Import My Data" to add one!
            </div>
          )}
        </div>

        {/* Right Detail / Edit Inspector */}
        {activeRecord && (
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  {OBJECT_ICONS[activeRecord.objectType]}
                  <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                    {activeRecord.objectType}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="font-mono text-xs text-slate-400">{activeRecord.id}</span>
                </div>
                
                {isEditing ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-base font-bold text-white w-full focus:outline-none focus:border-indigo-500"
                  />
                ) : (
                  <h3 className="text-lg font-bold text-white mt-1">
                    {activeRecord.name}
                  </h3>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveEdit}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleStartEdit}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
                      title="Edit this record"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteRecord(activeRecord.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Properties Table */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Key-Value Attributes
                </span>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => setEditFields(prev => [...prev, { key: '', value: '' }])}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Attribute</span>
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-2">
                  {editFields.map((field, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={field.key}
                        onChange={(e) => {
                          const updated = [...editFields];
                          updated[idx].key = e.target.value;
                          setEditFields(updated);
                        }}
                        placeholder="Property key"
                        className="w-1/3 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                      <input
                        type="text"
                        value={field.value}
                        onChange={(e) => {
                          const updated = [...editFields];
                          updated[idx].value = e.target.value;
                          setEditFields(updated);
                        }}
                        placeholder="Property value"
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setEditFields(prev => prev.filter((_, i) => i !== idx))}
                        className="p-1 text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-950 rounded-xl border border-slate-800 divide-y divide-slate-800/80 overflow-hidden">
                  {Object.entries(activeRecord.details).map(([key, val]) => (
                    <div key={key} className="px-4 py-2.5 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </span>
                      <span className="font-mono text-slate-200 font-semibold text-right max-w-xs truncate">
                        {typeof val === 'boolean' ? (val ? 'True (Flagged)' : 'False') : String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* System Metadata */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
              <span className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider">
                System of Record Integration
              </span>
              <p className="text-slate-300 leading-relaxed">
                Persisted under Pega Infinity™ Data Layer with full synchronization to grid dispatch OMS and customer billing databases.
              </p>
              <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span>Record UID: <strong className="font-mono text-slate-400">{activeRecord.id}</strong></span>
                <span>System: <strong className="font-mono text-indigo-400">Pega(Local)</strong></span>
                <span>Last Updated: <strong className="font-mono text-slate-400">{activeRecord.updatedAt}</strong></span>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
