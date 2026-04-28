import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TimelineClip } from '../types';
import { cn } from '../lib/utils';

interface PreviewProps {
  clips: TimelineClip[];
  currentTime: number;
  selectedClipId: string | null;
  onSelectClip: (id: string | null) => void;
}

export default function Preview({ clips, currentTime, selectedClipId, onSelectClip }: PreviewProps) {
  // Sort clips by layer to ensure correct stacking
  const visibleClips = clips
    .filter(clip => currentTime >= clip.startTime && currentTime <= clip.startTime + clip.duration)
    .sort((a, b) => a.layer - b.layer);

  return (
    <div 
      className="relative flex-1 bg-black overflow-hidden flex items-center justify-center group"
      onClick={() => onSelectClip(null)}
    >
      {/* 16:9 aspect ratio container */}
      <div className="relative aspect-video w-full max-w-4xl bg-slate-900 rounded-2xl shadow-2xl overflow-hidden ring-4 ring-slate-800 transition-all group-hover:ring-slate-700">
        <AnimatePresence mode="popLayout">
          {visibleClips.map((clip) => (
            <motion.div
              key={clip.id}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: clip.properties.opacity ?? 1,
                scale: clip.properties.scale ?? 1,
                rotate: clip.properties.rotation ?? 0,
                x: clip.properties.x ?? 0,
                y: clip.properties.y ?? 0,
              }}
              exit={{ opacity: 0 }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectClip(clip.id);
              }}
              className={cn(
                "absolute inset-0 flex items-center justify-center transition-all",
                selectedClipId === clip.id && "ring-2 ring-blue-500 z-50 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
              )}
            >
              {clip.type === 'video' && (
                <video
                  src={clip.assetId} 
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                />
              )}
              {clip.type === 'image' && (
                <img
                  src={clip.assetId} 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                  alt="Clip"
                />
              )}
              {clip.type === 'text' && (
                <div 
                  className="p-4 text-center font-black drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
                  style={{ 
                    fontSize: `${clip.properties.fontSize ?? 48}px`,
                    color: clip.properties.color ?? '#ffffff'
                  }}
                >
                  {clip.properties.text}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {visibleClips.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700 italic">
            <div className="w-16 h-16 border-2 border-dashed border-slate-800 rounded-full mb-4 animate-pulse" />
            <p className="font-bold text-sm tracking-widest uppercase opacity-40">Ready for Magic 🎨</p>
          </div>
        )}
        
        <div className="absolute bottom-0 w-full h-1 bg-white/10">
          <div 
            className="h-full bg-blue-500 transition-all duration-100 shadow-[0_0_8px_#3b82f6]"
            style={{ width: `${(currentTime / 30) * 100}%` }}
          />
        </div>
      </div>

      {/* Overlay controls */}
      <div className="absolute top-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-black text-slate-300 ring-1 ring-white/10 uppercase tracking-widest">
          {new Date(currentTime * 1000).toISOString().substr(14, 5)} / 00:30
        </span>
      </div>
    </div>
  );
}
