import React, { useState, useMemo } from 'react';
import { Viewer3D } from './components/Viewer3D';
import { ControlsSidebar } from './components/ControlsSidebar';
import { CameraState } from './types';
import { generatePrompt } from './utils/promptLogic';
import { Copy, CheckCircle, Terminal } from 'lucide-react';

const App: React.FC = () => {
  const [cameraState, setCameraState] = useState<CameraState>({
    azimuth: 0,
    polar: 90,
    distance: 8
  });
  
  const [isDragging, setIsDragging] = useState(false);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [bgOpacity, setBgOpacity] = useState(0.8); // Default opacity
  const [copied, setCopied] = useState(false);

  // Generate prompt based on state
  const promptData = useMemo(() => generatePrompt(cameraState), [cameraState]);

  // Handler for state updates from 3D view or Sidebar
  const handleCameraChange = (newState: Partial<CameraState>) => {
    setCameraState(prev => ({ ...prev, ...newState }));
  };

  // Handler specifically for sidebar inputs (manual overrides)
  const handleControlUpdate = (key: keyof CameraState, value: number) => {
    setCameraState(prev => ({ ...prev, [key]: value }));
  };

  const handleCopy = async () => {
    const textToCopy = promptData.fullPrompt;
    let copiedSuccessfully = false;

    // 1. Try Modern Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        copiedSuccessfully = true;
      } catch (err) {
        console.warn('Clipboard API failed, falling back to legacy.', err);
      }
    }

    // 2. Fallback to execCommand if API failed or not available
    if (!copiedSuccessfully) {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        
        // Prevent layout disruption and visibility
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        textArea.style.opacity = "0";
        
        // Mobile compatibility
        textArea.contentEditable = "true";
        textArea.readOnly = false;
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        textArea.setSelectionRange(0, 99999); // iOS fix
        
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (success) copiedSuccessfully = true;
      } catch (err) {
        console.error('Legacy copy failed', err);
      }
    }

    if (copiedSuccessfully) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      alert("복사 기능이 차단되었습니다. 텍스트를 직접 드래그하여 복사해주세요.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      
      {/* 
        Mobile Layout Strategy:
        - Order 1: 3D Viewer + Prompt (Top, ~66%)
        - Order 2: Controls Sidebar (Bottom, ~34%)
        - This gives the visual workspace (2/3) priority over controls (1/3).
      */}

      {/* Sidebar Wrapper */}
      <div className="order-2 md:order-1 w-full md:w-auto flex-none h-[34%] md:h-full relative z-20 overflow-hidden border-t md:border-t-0 border-slate-800">
        <ControlsSidebar 
          cameraState={cameraState}
          updateCamera={handleControlUpdate}
          bgImage={bgImage}
          setBgImage={setBgImage}
          bgOpacity={bgOpacity}
          setBgOpacity={setBgOpacity}
        />
      </div>

      {/* Main Content Area (3D Viewer + Prompt) */}
      <div className="order-1 md:order-2 w-full h-[66%] md:h-full md:flex-1 flex flex-col relative z-10">
        
        {/* Prompt Display Area */}
        <div className={`
            z-30 flex flex-col gap-2 transition-all shrink-0
            relative w-full bg-slate-900 border-b border-slate-800
            md:absolute md:top-4 md:left-4 md:right-4 md:w-auto md:bg-transparent md:border-0 md:pointer-events-none
        `}>
          <div className={`
             bg-slate-900/95 backdrop-blur-md 
             p-3 sm:p-4 w-full pointer-events-auto flex flex-col gap-2
             md:border md:border-slate-700 md:rounded-xl md:shadow-2xl
          `}>
             
             {/* Header Row */}
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                  <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">GENERATED PROMPT</span>
                </div>
                {/* Copy Button */}
                <button 
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-md text-xs font-medium transition-all shadow-lg shadow-blue-900/20 active:scale-95 cursor-pointer"
                >
                  {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? '복사됨' : '복사'}
                </button>
             </div>

             {/* Prompt Text - Flexible height with max constraint */}
             <div className="font-mono text-xs sm:text-base text-slate-100 break-words select-all max-h-24 md:max-h-32 overflow-y-auto">
               {promptData.fullPrompt}
             </div>

             {/* Chips (Hidden on very small screens to save space) */}
             <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-800">
                <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 whitespace-nowrap">{promptData.vertical}</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 whitespace-nowrap">{promptData.horizontal}</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 whitespace-nowrap">{promptData.distance}</span>
             </div>
          </div>
        </div>

        {/* 3D Viewer Container */}
        <div className="relative flex-1 bg-gradient-to-b from-slate-900 to-slate-950 overflow-hidden flex items-center justify-center min-h-0">
          
          <div className="absolute inset-0 z-10">
             <Viewer3D 
                cameraState={cameraState} 
                onCameraChange={handleCameraChange} 
                isDragging={isDragging}
                setIsDragging={setIsDragging}
                imageUrl={bgImage}
                imageOpacity={bgOpacity}
             />
          </div>

          {/* Bottom Floating Metadata */}
          <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 pointer-events-none flex z-50">
            <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-lg px-3 py-1.5 flex items-center gap-4 text-[10px] sm:text-xs font-mono shadow-xl">
               <div className="flex flex-col items-center">
                 <span className="text-slate-500">H</span>
                 <span className="text-blue-400">{Math.round(cameraState.azimuth)}°</span>
               </div>
               <div className="w-px h-4 bg-slate-700" />
               <div className="flex flex-col items-center">
                 <span className="text-slate-500">V</span>
                 <span className="text-green-400">{Math.round(cameraState.polar)}°</span>
               </div>
               <div className="w-px h-4 bg-slate-700" />
               <div className="flex flex-col items-center">
                 <span className="text-slate-500">D</span>
                 <span className="text-purple-400">{cameraState.distance}m</span>
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;