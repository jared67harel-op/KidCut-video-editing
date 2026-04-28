import React from 'react';
import { Play, Pause, RotateCcw, Sparkles, Sliders, Type, Download, Share2 } from 'lucide-react';
import { EditorState, TimelineClip } from '../types';
import { cn } from '../lib/utils';

interface ControlsProps {
  state: EditorState;
  onStateChange: (state: Partial<EditorState>) => void;
  onClipUpdate: (id: string, properties: Partial<TimelineClip['properties']>) => void;
  onGenerateMagicText: () => void;
}

export default function Controls({ state, onStateChange, onClipUpdate, onGenerateMagicText }: ControlsProps) {
  const selectedClip = state.clips.find(c => c.id === state.selectedClipId);

  return (
    <div className="w-64 bg-slate-900/30 border-l border-slate-800 flex flex-col shadow-2xl">
      {/* Playback Controls */}
      <div className="h-20 flex items-center justify-center gap-6 bg-slate-950/80 border-b border-slate-800">
        <button 
          onClick={() => onStateChange({ currentTime: 0 })}
          className="text-slate-400 hover:text-white transition-colors"
        >
          ⏪
        </button>
        <button 
          onClick={() => onStateChange({ isPlaying: !state.isPlaying })}
          className={cn(
            "w-12 h-12 bg-white text-slate-950 rounded-full flex items-center justify-center text-xl shadow-lg shadow-white/10 hover:scale-110 active:scale-95 transition-all outline-none",
            state.isPlaying && "shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          )}
        >
          {state.isPlaying ? "⏸️" : "▶️"}
        </button>
        <button 
          className="text-slate-400 hover:text-white transition-colors"
          onClick={() => onStateChange({ currentTime: Math.min(30, state.currentTime + 5) })}
        >
          ⏩
        </button>
      </div>

      {/* Clip Inspector */}
      <div className="flex-1 p-5 overflow-y-auto">
        {!selectedClip ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-3xl bg-slate-800 border-2 border-dashed border-slate-700 flex items-center justify-center mb-6 text-slate-600">
              <Sliders size={32} />
            </div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Select a Clip</h3>
            <p className="text-[10px] text-slate-500 mt-2 font-medium uppercase">To unlock its cool powers!</p>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-right duration-300">
            <div>
              <h2 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-6">Settings</h2>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] text-slate-400 font-black uppercase">Scale</label>
                    <span className="text-[10px] font-mono text-blue-400">{Math.round((selectedClip.properties.scale ?? 1) * 100)}%</span>
                  </div>
                  <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                        className="absolute h-full bg-blue-500 rounded-full shadow-[0_0_8px_#3b82f6] transition-all"
                        style={{ width: `${Math.min(100, (selectedClip.properties.scale ?? 1) * 33)}%` }}
                    />
                    <input 
                      type="range" 
                      min="0.1" 
                      max="3" 
                      step="0.1" 
                      value={selectedClip.properties.scale ?? 1}
                      onChange={(e) => onClipUpdate(selectedClip.id, { scale: parseFloat(e.target.value) })}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] text-slate-400 font-black uppercase">Opacity</label>
                    <span className="text-[10px] font-mono text-purple-400">{Math.round((selectedClip.properties.opacity ?? 1) * 100)}%</span>
                  </div>
                  <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                        className="absolute h-full bg-purple-500 rounded-full shadow-[0_0_8px_#a855f7] transition-all"
                        style={{ width: `${(selectedClip.properties.opacity ?? 1) * 100}%` }}
                    />
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.1" 
                      value={selectedClip.properties.opacity ?? 1}
                      onChange={(e) => onClipUpdate(selectedClip.id, { opacity: parseFloat(e.target.value) })}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                  </div>
                </div>

                {selectedClip.type === 'text' && (
                  <div className="space-y-3">
                    <label className="text-[10px] text-slate-400 font-black uppercase">Your Message</label>
                    <textarea 
                      value={selectedClip.properties.text ?? ''}
                      onChange={(e) => onClipUpdate(selectedClip.id, { text: e.target.value })}
                      className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl text-[10px] font-bold text-slate-200 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
                      rows={3}
                      placeholder="Start typing..."
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="pt-4 space-y-4">
               <label className="text-[10px] text-slate-400 font-black uppercase block">Quick Filters</label>
               <div className="grid grid-cols-2 gap-2">
                  <button className="p-2 bg-slate-800 rounded-lg text-[10px] font-bold border border-slate-700 hover:border-blue-500 transition-colors uppercase tracking-tighter">Retro</button>
                  <button className="p-2 bg-slate-800 rounded-lg text-[10px] font-bold border border-slate-700 hover:border-blue-500 transition-colors uppercase tracking-tighter">Comic</button>
                  <button className="p-2 bg-slate-800 rounded-lg text-[10px] font-bold border border-slate-700 hover:border-blue-500 transition-colors uppercase tracking-tighter">Glow</button>
                  <button className="p-2 bg-blue-600 rounded-lg text-[10px] font-black border border-blue-400 transition-colors uppercase tracking-tighter shadow-lg shadow-blue-600/20">Neon</button>
               </div>
            </div>

            <button 
              onClick={onGenerateMagicText}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/30 hover:-translate-y-0.5 transition-all active:translate-y-0"
            >
              <Sparkles size={16} />
              AI Magic
            </button>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <button className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-600/30 transition-all active:scale-95 text-white">
          Export Video
        </button>
      </div>
    </div>
  );
}
