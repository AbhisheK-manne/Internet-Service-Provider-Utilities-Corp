import React, { useState } from 'react';
import { 
  Radio, 
  Zap, 
  Truck, 
  Clock, 
  MapPin, 
  Users, 
  ShieldAlert, 
  CheckCircle2, 
  RotateCcw,
  Flame,
  ArrowRight,
  Activity,
  Plus,
  X,
  AlertTriangle
} from 'lucide-react';
import { OutageGridZone } from '../types';

interface OutageCommandCenterProps {
  outages: OutageGridZone[];
  onUpdateOutageStatus: (id: string, newStatus: OutageGridZone['status']) => void;
  onAddOutage: (newOutage: OutageGridZone) => void;
  onTriggerOutageCase?: (zone: OutageGridZone) => void;
}

export const OutageCommandCenter: React.FC<OutageCommandCenterProps> = ({
  outages,
  onUpdateOutageStatus,
  onAddOutage,
  onTriggerOutageCase
}) => {
  const [selectedOutageId, setSelectedOutageId] = useState<string>(outages[0]?.id || '');
  const [isAddingOutage, setIsAddingOutage] = useState(false);

  // New outage form state
  const [zoneName, setZoneName] = useState('');
  const [gridSector, setGridSector] = useState('Sector 4 - Residential North');
  const [substation, setSubstation] = useState('North Metro Substation #4');
  const [severity, setSeverity] = useState<'Critical' | 'Major' | 'Minor'>('Major');
  const [affectedCustomers, setAffectedCustomers] = useState(350);
  const [cause, setCause] = useState('Feeder circuit surge tripping step-down transformer');
  const [estimatedRestorationTime, setEstimatedRestorationTime] = useState('Today within 90 minutes');
  const [leadTechnician, setLeadTechnician] = useState('Dave Miller (Crew Unit 12)');

  const totalAffected = outages.reduce((acc, o) => acc + (o.status !== 'Restored' ? o.affectedCustomers : 0), 0);
  const activeOutageCount = outages.filter(o => o.status !== 'Restored').length;

  const selectedOutage = outages.find(o => o.id === selectedOutageId) || outages[0];

  const handleCreateOutage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneName.trim()) return;

    const newZone: OutageGridZone = {
      id: `OUT-${Math.floor(1000 + Math.random() * 9000)}`,
      zoneName: zoneName.trim(),
      gridSector,
      substation,
      status: 'Investigating',
      severity,
      affectedCustomers: Number(affectedCustomers) || 1,
      cause: cause.trim() || 'Unplanned service disruption reported by customer',
      estimatedRestorationTime,
      startTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
      leadTechnician,
      lat: 44.045 + (Math.random() - 0.5) * 0.04,
      lng: -123.030 + (Math.random() - 0.5) * 0.04
    };

    onAddOutage(newZone);
    setSelectedOutageId(newZone.id);
    setIsAddingOutage(false);
    setZoneName('');
  };

  return (
    <div className="space-y-6">
      
      {/* Grid Ops Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
            <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>SCADA &amp; Outage Management System (OMS) Integration</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Grid Outage &amp; Service Restoration Command
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Live telemetry tracking for power distribution feeders, optical fiber hubs, and emergency field crew deployments across municipal sectors.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 text-right">
            <span className="text-[11px] text-slate-400 block">Total Affected Meters</span>
            <span className="text-xl font-bold text-rose-400 font-mono">
              {totalAffected.toLocaleString()}
            </span>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 text-right">
            <span className="text-[11px] text-slate-400 block">Active Incidents</span>
            <span className="text-xl font-bold text-amber-400 font-mono">
              {activeOutageCount}
            </span>
          </div>
          <button
            onClick={() => setIsAddingOutage(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md shadow-amber-600/30 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Report / Input Outage</span>
          </button>
        </div>
      </div>

      {/* Grid Layout: Outages list & Detailed Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Outage Cards Column */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Active Grid Outages ({outages.length})
            </span>
            <button
              onClick={() => setIsAddingOutage(true)}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Input Outage</span>
            </button>
          </div>

          <div className="space-y-3">
            {outages.map((zone) => {
              const isSelected = zone.id === (selectedOutage?.id);
              return (
                <div
                  key={zone.id}
                  id={`outage-card-${zone.id}`}
                  onClick={() => setSelectedOutageId(zone.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-amber-500 ring-1 ring-amber-500/40 shadow-lg'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                        {zone.id}
                      </span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${
                        zone.severity === 'Critical' ? 'bg-rose-950/80 text-rose-300 border-rose-800' :
                        zone.severity === 'Major' ? 'bg-amber-950/80 text-amber-300 border-amber-800' :
                        'bg-blue-950/80 text-blue-300 border-blue-800'
                      }`}>
                        {zone.severity}
                      </span>
                    </div>

                    <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      {zone.affectedCustomers.toLocaleString()} premises
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white mt-2">{zone.zoneName}</h4>
                  <div className="text-xs text-slate-400 mt-0.5">{zone.gridSector}</div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      ETA: <strong className="text-slate-200">{zone.estimatedRestorationTime}</strong>
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      zone.status === 'Restored' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      zone.status === 'Restoration In Progress' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                      'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      {zone.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Detail Pane */}
        {selectedOutage && (
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
                  <span>{selectedOutage.id}</span>
                  <span>•</span>
                  <span>{selectedOutage.substation}</span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">
                  {selectedOutage.zoneName}
                </h3>
              </div>

              {/* Status Update Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Status:</span>
                <select
                  value={selectedOutage.status}
                  onChange={(e) => onUpdateOutageStatus(selectedOutage.id, e.target.value as any)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Investigating">Investigating</option>
                  <option value="Dispatched">Dispatched</option>
                  <option value="Crews Onsite">Crews Onsite</option>
                  <option value="Restoration In Progress">Restoration In Progress</option>
                  <option value="Restored">Restored</option>
                </select>
              </div>
            </div>

            {/* Grid Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                <span className="text-slate-400 block text-[11px]">Grid Sector</span>
                <span className="font-semibold text-white mt-0.5 block">{selectedOutage.gridSector}</span>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                <span className="text-slate-400 block text-[11px]">Primary Substation</span>
                <span className="font-semibold text-white mt-0.5 block truncate">{selectedOutage.substation}</span>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                <span className="text-slate-400 block text-[11px]">Lead Field Tech</span>
                <span className="font-semibold text-amber-300 mt-0.5 block truncate">{selectedOutage.leadTechnician}</span>
              </div>
            </div>

            {/* Cause & Telemetry Root Cause */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                SCADA Sensor Diagnostics &amp; Cause
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedOutage.cause}
              </p>
              <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-800/80 flex items-center justify-between">
                <span>Outage Commenced: {selectedOutage.startTime}</span>
                <span>Coordinates: {selectedOutage.lat.toFixed(3)}° N, {Math.abs(selectedOutage.lng).toFixed(3)}° W</span>
              </div>
            </div>

            {/* Interactive Grid Schematic / Map representation */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-400" />
                  Feeder Circuit Heartbeat Monitor
                </span>
                <span className="text-[11px] text-emerald-400 font-mono">AMI Telemetry Active</span>
              </div>

              {/* Schematic Nodes */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-500">Substation</div>
                  <div className="font-bold text-emerald-400 mt-0.5">ONLINE</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-500">24kV Feeder</div>
                  <div className={`font-bold mt-0.5 ${selectedOutage.status === 'Restored' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {selectedOutage.status === 'Restored' ? 'NORMAL' : 'ISOLATED'}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-500">Step-Down XFMR</div>
                  <div className={`font-bold mt-0.5 ${selectedOutage.status === 'Restored' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {selectedOutage.status === 'Restored' ? 'ENGAGED' : 'TRIPPED'}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-500">Meter Heartbeats</div>
                  <div className="font-bold text-slate-400 mt-0.5">
                    {selectedOutage.status === 'Restored' ? '100% Online' : '0% Responses'}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => onUpdateOutageStatus(selectedOutage.id, 'Crews Onsite')}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                <span>Confirm Crews Onsite</span>
              </button>

              <button
                onClick={() => onUpdateOutageStatus(selectedOutage.id, 'Restored')}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Broadcast Restoration Complete</span>
              </button>
            </div>

          </div>
        )}

      </div>

      {/* Input / Report Outage Modal */}
      {isAddingOutage && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Input / Report Grid Outage</h3>
              </div>
              <button
                onClick={() => setIsAddingOutage(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOutage} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block font-semibold mb-1">Zone / Premise Name *</label>
                <input
                  type="text"
                  required
                  value={zoneName}
                  onChange={(e) => setZoneName(e.target.value)}
                  placeholder="e.g. Skyline Ridge & Highview Road"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block font-semibold mb-1">Grid Sector</label>
                  <input
                    type="text"
                    value={gridSector}
                    onChange={(e) => setGridSector(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block font-semibold mb-1">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Critical">Critical (Hospital / Life Support)</option>
                    <option value="Major">Major (Feeder / Substation)</option>
                    <option value="Minor">Minor (Lateral / Single Premise)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block font-semibold mb-1">Affected Premises / Meters</label>
                  <input
                    type="number"
                    value={affectedCustomers}
                    onChange={(e) => setAffectedCustomers(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block font-semibold mb-1">Estimated Restoration</label>
                  <input
                    type="text"
                    value={estimatedRestorationTime}
                    onChange={(e) => setEstimatedRestorationTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block font-semibold mb-1">Reported Cause / SCADA Telemetry</label>
                <textarea
                  rows={2}
                  value={cause}
                  onChange={(e) => setCause(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddingOutage(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md shadow-amber-600/30"
                >
                  Add Outage Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
