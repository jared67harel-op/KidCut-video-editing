import React, { useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { useDroppable } from '@dnd-kit/core';
import { Scissors, Trash2, Plus, Clock, Move } from 'lucide-react';
import { TimelineClip } from '../types';
import { cn } from '../lib/utils';

interface TimelineProps {
  clips: TimelineClip[];
  currentTime: number;
  totalDuration: number;
  selectedClipId: string | null;
  onClipSelect: (id: string | null) => void;
  onTimeChange: (time: number) => void;
  onClipMove: (id: string, newTime: number) => void;
}

const PIXELS_PER_SECOND = 40;

export default function Timeline({ 
  clips, 
  currentTime, 
  totalDuration, 
  selectedClipId,
  onClipSelect,
  onTimeChange,
  onClipMove
}: TimelineProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'timeline-track',
  });

  const timelineRef = useRef<HTMLDivElement>(null);

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + timelineRef.current.scrollLeft;
    onTimeChange(Math.max(0, x / PIXELS_PER_SECOND));
  };

  return (
    <div className="h-64 bg-slate-900 border-t border-slate-800 flex flex-col relative select-none">
      {/* Timecode ruler */}
      <div className="h-6 border-b border-slate-800 flex items-center px-4 gap-20 text-[10px] text-slate-500 font-mono pointer-events-none">
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} style={{ minWidth: PIXELS_PER_SECOND * 5 }}>00:{String(i * 5).padStart(2, '0')}</span>
        ))}
      </div>

      {/* Tracks Area */}
      <div 
        ref={(node) => {
          setNodeRef(node);
          (timelineRef.current as any) = node;
        }}
        className={cn(
          "flex-1 overflow-x-auto overflow-y-hidden relative group/timeline scrollbar-thin scrollbar-thumb-slate-700",
          isOver && "bg-blue-500/5"
        )}
        onClick={handleTimelineClick}
      >
        <div className="flex flex-col gap-2 p-3 min-w-[200%]">
          {[2, 1, 0].map((layer) => (
            <div 
              key={layer}
              className="h-12 bg-slate-800/40 rounded-lg flex items-center px-2 border border-slate-800/50 relative overflow-hidden"
            >
              <div className="w-16 h-full border-r border-slate-700 flex items-center justify-center text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                {layer === 2 ? 'Text' : layer === 1 ? 'FX' : 'Video'}
              </div>
              
              {clips
                .filter(clip => clip.layer === layer)
                .map(clip => (
                  <motion.div
                    key={clip.id}
                    layoutId={clip.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onClipSelect(clip.id);
                    }}
                    className={cn(
                      "absolute h-10 rounded-md cursor-pointer flex items-center px-3 text-[10px] font-bold uppercase tracking-tight transition-all shadow-lg group/clip overflow-hidden",
                      clip.type === 'video' ? "bg-slate-700 border-2 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]" :
                      clip.type === 'image' ? "bg-purple-600/30 border-2 border-purple-500 text-purple-100" :
                      clip.type === 'text' ? "bg-blue-600/30 border-2 border-blue-500 text-blue-100" :
                      "bg-pink-600/30 border-2 border-pink-500 text-pink-100",
                      selectedClipId === clip.id ? "ring-2 ring-white scale-[1.02] z-10 shadow-white/10" : "hover:border-white/50"
                    )}
                    style={{ 
                      left: 64 + 12 + (clip.startTime * PIXELS_PER_SECOND),
                      width: clip.duration * PIXELS_PER_SECOND
                    }}
                  >
                    <div className="w-6 h-6 bg-slate-800 rounded mr-2 flex-shrink-0 flex items-center justify-center opacity-50">
                        {clip.type === 'video' ? '🎬' : clip.type === 'image' ? '📸' : '✨'}
                    </div>
                    <span className="truncate">{clip.assetId.split('/').pop()}</span>
                  </motion.div>
                ))}
            </div>
          ))}
        </div>

        {/* Playhead */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white z-20 pointer-events-none shadow-[0_0_15px_white]"
          style={{ left: 64 + 12 + (currentTime * PIXELS_PER_SECOND) }}
        >
          <div className="absolute -top-1 -left-1.5 w-4 h-4 bg-white rotate-45 rounded-sm shadow-xl" />
        </div>
      </div>

      {/* Timeline Controls */}
      <div className="h-10 bg-slate-950 flex items-center justify-between px-6 border-t border-slate-800">
        <div className="flex gap-4">
          <button className="text-lg opacity-40 hover:opacity-100 transition-opacity" title="Split">✂️</button>
          <button 
            className={cn(
              "text-lg transition-all",
              selectedClipId ? "opacity-100 hover:scale-110" : "opacity-20 pointer-events-none"
            )} 
            title="Delete"
          >
            🗑️
          </button>
          <button className="text-lg opacity-40 hover:opacity-100 transition-opacity" title="Effects">🎨</button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs opacity-40">➖</span>
          <div className="w-32 h-1 bg-slate-800 rounded-full">
            <div className="h-full w-1/2 bg-slate-500 rounded-full"></div>
          </div>
          <span className="text-xs opacity-100 text-blue-400">➕</span>
        </div>
      </div>
    </div>
  );
}
