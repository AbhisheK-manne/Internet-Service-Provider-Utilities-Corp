import React from 'react';
import { 
  Users, 
  Layers, 
  ArrowRightLeft, 
  CheckCircle2, 
  SlidersHorizontal,
  Edit3
} from 'lucide-react';
import { PersonaType, UserProfile } from '../types';
import { PERSONAS } from '../data/pegaBlueprintData';

interface PersonaBannerProps {
  activePersona: PersonaType;
  onSelectPersona: (persona: PersonaType) => void;
  userProfile?: UserProfile;
  onOpenMyData?: () => void;
}

export const PersonaBanner: React.FC<PersonaBannerProps> = ({
  activePersona,
  onSelectPersona,
  userProfile,
  onOpenMyData
}) => {
  const persona = PERSONAS.find(p => p.id === activePersona) || PERSONAS[0];

  return (
    <div className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-sm text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          
          {/* Active Role Info */}
          <div className="flex items-start sm:items-center gap-3">
            <div className={`w-9 h-9 rounded-lg ${persona.avatarBg} text-white flex items-center justify-center font-bold text-sm shadow-md shrink-0`}>
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs uppercase tracking-wider font-semibold text-blue-400">
                  Active Persona Context
                </span>
                <span className="text-slate-500">•</span>
                <span className="font-bold text-sm text-white">{persona.title}</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] bg-slate-800 text-slate-300 border border-slate-700">
                  {persona.channel}
                </span>

                {activePersona === 'customer' && userProfile && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-xs font-medium">
                    <span>Account: {userProfile.name} ({userProfile.accountNumber})</span>
                    {onOpenMyData && (
                      <button
                        onClick={onOpenMyData}
                        className="text-emerald-400 hover:text-emerald-200 ml-1 underline flex items-center gap-0.5"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit My Data</span>
                      </button>
                    )}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5 max-w-3xl">
                {persona.description}
              </p>
            </div>
          </div>

          {/* Quick Persona Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap mr-1 flex items-center gap-1">
              <ArrowRightLeft className="w-3 h-3" />
              Switch:
            </span>
            {PERSONAS.map(p => {
              const isActive = p.id === activePersona;
              return (
                <button
                  key={p.id}
                  onClick={() => onSelectPersona(p.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all whitespace-nowrap flex items-center gap-1.5 border ${
                    isActive
                      ? 'bg-blue-600/30 text-blue-300 border-blue-500/60 shadow-sm'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700/60 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${p.avatarBg}`} />
                  <span>{p.title.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Persona Capabilities Bar */}
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3 text-slate-400" />
            Persona Capabilities:
          </span>
          {persona.capabilities.map((cap, i) => (
            <span 
              key={i} 
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/90 text-slate-300 text-[11px] border border-slate-700/60"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              {cap}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
