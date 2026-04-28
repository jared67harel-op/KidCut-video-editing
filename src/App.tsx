/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DndContext, DragEndEvent, DragOverEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { GoogleGenAI } from "@google/genai";
import { EditorState, TimelineClip, MediaAsset } from './types';
import MediaLibrary from './components/MediaLibrary';
import Timeline from './components/Timeline';
import Preview from './components/Preview';
import Controls from './components/Controls';
import Recorder from './components/Recorder';
import { cn } from './lib/utils';
import { Sparkles, Film, Video } from 'lucide-react';

const SAMPLE_ASSETS: MediaAsset[] = [
  { id: 'v1', type: 'video', name: 'Fun Beach Day', url: 'https://assets.mixkit.co/videos/preview/mixkit-girl-running-on-the-beach-at-sunset-1249-large.mp4', duration: 10 },
  { id: 'v2', type: 'video', name: 'Puppy Play', url: 'https://assets.mixkit.co/videos/preview/mixkit-little-puppy-running-on-the-grass-3212-large.mp4', duration: 15 },
  { id: 'v3', type: 'video', name: 'Sky Adventure', url: 'https://assets.mixkit.co/videos/preview/mixkit-underwater-view-of-ocean-waves-1587-large.mp4', duration: 12 },
  { id: 'i1', type: 'image', name: 'Magic Star', url: 'https://picsum.photos/seed/star/800/600' },
  { id: 'i2', type: 'image', name: 'Cool Robot', url: 'https://picsum.photos/seed/robot/800/600' },
];

const INITIAL_STATE: EditorState = {
  clips: [],
  currentTime: 0,
  totalDuration: 30, // 30 seconds default
  selectedClipId: null,
  isPlaying: false,
};

export default function App() {
  const [state, setState] = useState<EditorState>(INITIAL_STATE);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);
  const [customAssets, setCustomAssets] = useState<MediaAsset[]>([]);
  const timerRef = useRef<number | null>(null);

  const allAssets = [...SAMPLE_ASSETS, ...customAssets];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Playback logic
  useEffect(() => {
    if (state.isPlaying) {
      timerRef.current = window.setInterval(() => {
        setState(prev => {
          const nextTime = prev.currentTime + 0.1;
          if (nextTime >= prev.totalDuration) {
            return { ...prev, isPlaying: false, currentTime: prev.totalDuration };
          }
          return { ...prev, currentTime: nextTime };
        });
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.isPlaying]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && over.id === 'timeline-track') {
      const asset = active.data.current as MediaAsset;
      if (!asset) return;

      const newClip: TimelineClip = {
        id: `clip-${Date.now()}`,
        assetId: asset.url,
        startTime: state.currentTime,
        duration: asset.duration ?? 5,
        offset: 0,
        layer: 0,
        type: asset.type,
        properties: {
          scale: 1,
          opacity: 1,
          text: asset.type === 'text' ? 'Hello World!' : undefined,
          fontSize: asset.type === 'text' ? 48 : undefined,
          color: asset.type === 'text' ? '#ffffff' : undefined,
        },
      };

      setState(prev => ({
        ...prev,
        clips: [...prev.clips, newClip],
        selectedClipId: newClip.id,
      }));
    }
  };

  const updateClipProperties = (id: string, properties: Partial<TimelineClip['properties']>) => {
    setState(prev => ({
      ...prev,
      clips: prev.clips.map(c => 
        c.id === id ? { ...c, properties: { ...c.properties, ...properties } } : c
      ),
    }));
  };

  const generateMagicText = async () => {
    if (!process.env.GEMINI_API_KEY) {
      console.error("Gemini API key missing");
      return;
    }

    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "You are a creative helper for kids making videos. Generate a short, super fun and exciting 4-word caption or title for a video about puppies, superheroes, or space adventures. Return only the caption.",
        config: {
          temperature: 0.9,
        }
      });

      const magicText = response.text?.replace(/["']/g, '') || "MAGIC MOMENT! ✨";

      const newClip: TimelineClip = {
        id: `clip-${Date.now()}`,
        assetId: 'text-asset',
        startTime: state.currentTime,
        duration: 3,
        offset: 0,
        layer: 2, // Always on top
        type: 'text',
        properties: {
          scale: 1,
          opacity: 1,
          text: magicText,
          fontSize: 64,
          color: '#ffffff',
          y: -50,
        },
      };

      setState(prev => ({
        ...prev,
        clips: [...prev.clips, newClip],
        selectedClipId: newClip.id,
      }));
    } catch (error) {
      console.error("Magic fail:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRecordComplete = (url: string, type: 'video' | 'screen') => {
    const newAsset: MediaAsset = {
      id: `record-${Date.now()}`,
      type: 'video',
      url: url,
      name: type === 'screen' ? 'Screen Record' : 'My Video',
      duration: 10, // Default duration, in real app would get from metadata
    };
    setCustomAssets(prev => [newAsset, ...prev]);
    setIsRecorderOpen(false);
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden font-sans selection:bg-blue-500/30">
        {/* Header */}
        <header className="h-14 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between shadow-lg z-30">
          <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left duration-500">
            <div className="w-8 h-8 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20 transform -rotate-3 hover:rotate-0 transition-transform cursor-pointer">
                <Film className="text-white" size={18} />
            </div>
            <h1 className="text-lg font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">KIDCUT PRO</h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex bg-slate-800 rounded-full p-1 shadow-inner">
              <button className="px-4 py-1 text-xs font-bold leading-none bg-slate-700 rounded-full text-slate-100 shadow-sm transition-all">Edit</button>
              <button className="px-4 py-1 text-xs font-bold leading-none text-slate-500 hover:text-slate-300 transition-colors">Review</button>
            </div>
            
            <button 
              onClick={generateMagicText}
              disabled={isGenerating}
              className={cn(
                "flex items-center gap-2 px-6 py-1.5 rounded-full font-bold text-sm transition-all shadow-lg active:scale-95",
                isGenerating 
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                  : "bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/30"
              )}
            >
              <Sparkles size={16} className={cn(isGenerating && "animate-spin")} />
              {isGenerating ? "Casting..." : "Magic Title"}
            </button>
          </div>
        </header>

        <main className="flex-1 flex overflow-hidden">
          {/* Library Sidebar */}
          <MediaLibrary assets={allAssets} onOpenRecorder={() => setIsRecorderOpen(true)} />

          {/* Central Workspace */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            <Preview 
              clips={state.clips} 
              currentTime={state.currentTime} 
              selectedClipId={state.selectedClipId}
              onSelectClip={(id) => setState(prev => ({ ...prev, selectedClipId: id }))}
            />
            
            <Timeline 
              clips={state.clips}
              currentTime={state.currentTime}
              totalDuration={state.totalDuration}
              selectedClipId={state.selectedClipId}
              onClipSelect={(id) => setState(prev => ({ ...prev, selectedClipId: id }))}
              onTimeChange={(time) => setState(prev => ({ ...prev, currentTime: time }))}
              onClipMove={(id, newTime) => setState(prev => ({
                ...prev,
                clips: prev.clips.map(c => c.id === id ? { ...c, startTime: newTime } : c)
              }))}
            />
          </div>

          {/* Controls Sidebar */}
          <Controls 
            state={state} 
            onStateChange={(s) => setState(prev => ({ ...prev, ...s }))}
            onClipUpdate={updateClipProperties}
            onGenerateMagicText={generateMagicText}
          />
        </main>

        {isRecorderOpen && (
          <Recorder 
            onRecordComplete={handleRecordComplete} 
            onClose={() => setIsRecorderOpen(false)} 
          />
        )}

        {/* Global Loading Overlay for Magic */}
        {isGenerating && (
          <div className="fixed inset-0 bg-white/40 backdrop-blur-sm z-[100] flex flex-col items-center justify-center">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <Sparkles className="absolute inset-0 m-auto text-blue-600 animate-pulse" size={32} />
            </div>
            <p className="mt-6 text-xl font-black text-gray-900 animate-bounce">Mixing Magic Potions...</p>
            <p className="text-gray-500 font-medium italic">Almost ready for your masterpiece!</p>
          </div>
        )}
      </div>
    </DndContext>
  );
}

