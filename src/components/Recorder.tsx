import React, { useState, useRef, useEffect } from 'react';
import { Camera, Monitor, Square, Circle, X, Download } from 'lucide-react';
import { cn } from '../lib/utils';

interface RecorderProps {
  onRecordComplete: (url: string, type: 'video' | 'screen') => void;
  onClose: () => void;
}

export default function Recorder({ onRecordComplete, onClose }: RecorderProps) {
  const [mode, setMode] = useState<'camera' | 'screen' | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  const startStream = async (type: 'camera' | 'screen') => {
    try {
      let stream: MediaStream;
      if (type === 'camera') {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
      } else {
        stream = await navigator.mediaDevices.getDisplayMedia({ 
          video: true,
          audio: true
        });
      }
      setPreviewStream(stream);
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }
      setMode(type);
    } catch (err) {
      console.error("Error accessing media devices:", err);
      alert("Oops! We couldn't access your camera or screen. Make sure you gave permission! 🎥");
    }
  };

  const startRecording = () => {
    if (!previewStream) return;

    setRecordedChunks([]);
    const mediaRecorder = new MediaRecorder(previewStream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setRecordedChunks((prev) => [...prev, event.data]);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      onRecordComplete(url, mode === 'screen' ? 'screen' : 'video');
      stopStream();
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const stopStream = () => {
    if (previewStream) {
      previewStream.getTracks().forEach(track => track.stop());
      setPreviewStream(null);
    }
    setMode(null);
    setIsRecording(false);
  };

  useEffect(() => {
    return () => stopStream();
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 md:p-12 overflow-hidden">
      <div className="relative w-full max-w-4xl aspect-video bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 flex items-center justify-between border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400">
               {mode === 'screen' ? <Monitor size={20} /> : <Camera size={20} />}
             </div>
             <h2 className="text-sm font-black uppercase tracking-widest text-slate-300">
               {mode ? (mode === 'screen' ? 'Recording Screen' : 'Recording You') : 'Capture Magic'}
             </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-500 hover:text-white transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 relative bg-black flex items-center justify-center">
          {!mode ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-12 w-full max-w-2xl">
              <button 
                onClick={() => startStream('camera')}
                className="group p-8 rounded-3xl bg-slate-800 border-2 border-dashed border-slate-700 hover:border-pink-500 hover:bg-pink-500/10 transition-all flex flex-col items-center gap-4 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-pink-500/20 text-pink-500 flex items-center justify-center transform group-hover:scale-110 transition-transform">
                  <Camera size={40} />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-100 uppercase tracking-tight">Record Me</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase mt-1">Use your webcam!</p>
                </div>
              </button>

              <button 
                onClick={() => startStream('screen')}
                className="group p-8 rounded-3xl bg-slate-800 border-2 border-dashed border-slate-700 hover:border-blue-500 hover:bg-blue-500/10 transition-all flex flex-col items-center gap-4 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-blue-500/20 text-blue-500 flex items-center justify-center transform group-hover:scale-110 transition-transform">
                  <Monitor size={40} />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-100 uppercase tracking-tight">Record Screen</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase mt-1">Share your display!</p>
                </div>
              </button>
            </div>
          ) : (
            <div className="w-full h-full relative">
              <video 
                ref={videoPreviewRef} 
                autoPlay 
                muted 
                playsInline 
                className={cn(
                  "w-full h-full object-cover",
                  mode === 'camera' && "scale-x-[-1]" // Mirror camera for natural feel
                )}
              />
              
              {isRecording && (
                <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1 bg-red-600 rounded-full animate-pulse shadow-lg shadow-red-600/40">
                  <Circle size={12} fill="white" className="text-white" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Recording</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer / Controls */}
        {mode && (
          <div className="p-8 flex items-center justify-center bg-slate-900 border-t border-slate-800">
             <div className="flex items-center gap-6">
                {!isRecording ? (
                  <button 
                    onClick={startRecording}
                    className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/30 hover:scale-110 active:scale-95 transition-all text-white border-4 border-white/20"
                  >
                    <Circle size={32} fill="white" />
                  </button>
                ) : (
                  <button 
                    onClick={stopRecording}
                    className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center shadow-lg shadow-white/10 hover:scale-110 active:scale-95 transition-all text-slate-900 border-4 border-slate-900/20"
                  >
                    <Square size={32} fill="currentColor" />
                  </button>
                )}
                
                <button 
                  onClick={stopStream}
                  className="px-6 py-2 rounded-full border border-slate-700 text-xs font-black uppercase text-slate-500 hover:text-white hover:border-slate-500 transition-all"
                >
                  Cancel
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
