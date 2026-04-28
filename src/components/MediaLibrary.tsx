import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Play, Image as ImageIcon, Music, Type, Camera } from 'lucide-react';
import { MediaAsset } from '../types';
import { cn } from '../lib/utils';

function DraggableAsset({ asset }: { asset: MediaAsset }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `asset-${asset.id}`,
    data: asset,
  });

  const Icon = asset.type === 'video' ? Play : asset.type === 'image' ? ImageIcon : asset.type === 'audio' ? Music : Type;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "group relative flex flex-col items-center justify-center p-3 rounded-xl bg-white/80 border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50 scale-95 border-blue-500 shadow-lg"
      )}
    >
      <div className={cn(
        "w-full aspect-square rounded-lg mb-2 flex items-center justify-center transition-colors",
        asset.type === 'video' ? "bg-amber-100 text-amber-600" :
        asset.type === 'image' ? "bg-purple-100 text-purple-600" :
        asset.type === 'audio' ? "bg-emerald-100 text-emerald-600" :
        "bg-blue-100 text-blue-600"
      )}>
        <Icon size={32} />
      </div>
      <span className="text-xs font-semibold text-gray-700 truncate w-full text-center">{asset.name}</span>
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-1 rounded-full bg-blue-500 text-white shadow-sm hover:bg-blue-600">
          <Plus size={12} />
        </button>
      </div>
    </div>
  );
}

interface MediaLibraryProps {
  assets: MediaAsset[];
  onOpenRecorder: () => void;
}

export default function MediaLibrary({ assets, onOpenRecorder }: MediaLibraryProps) {
  return (
    <div className="flex flex-col h-full bg-slate-900/30 border-r border-slate-800 p-4 w-64 overflow-y-auto">
      <div className="p-4 border-b border-slate-800 mb-6 flex justify-around text-xs font-bold text-slate-400 uppercase tracking-widest">
        <span className="text-blue-400 border-b-2 border-blue-400 pb-2">Media</span>
        <span className="hover:text-slate-200 cursor-pointer transition-colors">Text</span>
        <span className="hover:text-slate-200 cursor-pointer transition-colors">Music</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div 
          onClick={onOpenRecorder}
          className="group relative aspect-square bg-slate-800 rounded-xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-pink-500 hover:bg-pink-500/10 transition-all"
        >
          <span className="text-2xl mb-1 text-slate-400 group-hover:text-pink-400 group-hover:scale-110 transition-all">
            <Camera size={24} />
          </span>
          <span className="text-[10px] font-black text-slate-500 group-hover:text-pink-400 transition-colors uppercase">RECORD</span>
        </div>
        {assets.map((asset) => (
          <DraggableAsset key={asset.id} asset={asset} />
        ))}
      </div>

      <div className="mt-8 p-4 bg-slate-800/20 border border-slate-800 rounded-xl">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-tighter mb-4">PRO EFFECTS</h3>
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-xl cursor-help hover:bg-purple-500/30 transition-colors shadow-lg shadow-purple-500/10">✨</div>
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-xl cursor-help hover:bg-blue-500/30 transition-colors shadow-lg shadow-blue-500/10">⚡</div>
          <div className="w-10 h-10 rounded-lg bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-xl cursor-help hover:bg-pink-500/30 transition-colors shadow-lg shadow-pink-500/10">🌈</div>
        </div>
      </div>

      <div className="mt-8 p-4 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-xl relative overflow-hidden group cursor-pointer active:scale-95 transition-all">
        <div className="relative z-10">
          <h3 className="font-black text-[10px] text-white/50 uppercase tracking-widest mb-1">AI Magic! ✨</h3>
          <p className="text-xs font-bold leading-tight">
            Drop a clip to unleash magic!
          </p>
        </div>
        <div className="absolute -bottom-4 -right-4 opacity-20 transform group-hover:scale-110 transition-transform">
          <Play size={80} />
        </div>
      </div>
    </div>
  );
}
