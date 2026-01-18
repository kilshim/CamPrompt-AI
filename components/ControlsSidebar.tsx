import React from 'react';
import { CameraState, Preset } from '../types';
import { Camera, Image as ImageIcon, Rotate3D, Move, Upload } from 'lucide-react';

interface ControlsSidebarProps {
  cameraState: CameraState;
  updateCamera: (key: keyof CameraState, value: number) => void;
  bgImage: string | null;
  setBgImage: (url: string | null) => void;
  bgOpacity: number;
  setBgOpacity: (val: number) => void;
}

const PRESETS: { [key: string]: Preset[] } = {
  horizontal: [
    { label: '정면', value: 0, type: 'horizontal' },
    { label: '좌측면 3/4', value: 45, type: 'horizontal' },
    { label: '좌측면', value: 90, type: 'horizontal' },
    { label: '우측면 3/4', value: 315, type: 'horizontal' },
    { label: '우측면', value: 270, type: 'horizontal' },
    { label: '후면', value: 180, type: 'horizontal' },
  ],
  vertical: [
    { label: '버즈아이 (상공)', value: 15, type: 'vertical' },
    { label: '하이 앵글', value: 45, type: 'vertical' },
    { label: '아이 레벨 (눈높이)', value: 90, type: 'vertical' },
    { label: '로우 앵글', value: 120, type: 'vertical' },
    { label: '웜스아이 (지면)', value: 165, type: 'vertical' },
  ],
  distance: [
    { label: '클로즈업', value: 3, type: 'distance' },
    { label: '미디엄', value: 8, type: 'distance' },
    { label: '전신', value: 18, type: 'distance' },
    { label: '와이드', value: 25, type: 'distance' },
  ]
};

interface PresetButtonProps {
  preset: Preset;
  onApply: (preset: Preset) => void;
}

const PresetButton: React.FC<PresetButtonProps> = ({ preset, onApply }) => (
  <button
    onClick={() => onApply(preset)}
    className="px-2 py-1.5 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors break-keep active:bg-slate-600"
  >
    {preset.label}
  </button>
);

export const ControlsSidebar: React.FC<ControlsSidebarProps> = ({ 
  cameraState, 
  updateCamera, 
  bgImage, 
  setBgImage,
  bgOpacity,
  setBgOpacity
}) => {
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setBgImage(url);
    }
  };

  const applyPreset = (preset: Preset) => {
    const key = preset.type === 'horizontal' ? 'azimuth' : preset.type === 'vertical' ? 'polar' : 'distance';
    updateCamera(key, preset.value);
  };

  return (
    <div className="w-full md:w-80 flex-shrink-0 bg-slate-900 border-t border-r-0 md:border-t-0 md:border-r border-slate-800 flex flex-col h-full overflow-y-auto">
      {/* Header - Sticky on mobile to know where controls are */}
      <div className="p-3 sm:p-4 border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur z-10">
        <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent flex items-center gap-2">
          <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
          CamPrompt AI
        </h1>
        <p className="text-slate-500 text-[10px] sm:text-xs mt-0.5">인터랙티브 3D 프롬프트 빌더</p>
      </div>

      <div className="p-3 sm:p-4 space-y-6 sm:space-y-8 pb-8">
        
        {/* Horizontal Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <Rotate3D className="w-4 h-4 text-blue-400" />
              <span className="font-medium">수평 회전</span>
            </div>
            <span className="font-mono text-blue-400 font-bold">{Math.round(cameraState.azimuth)}°</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="360" 
            value={cameraState.azimuth} 
            onChange={(e) => updateCamera('azimuth', parseInt(e.target.value))}
            className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 touch-action-none"
          />
          <div className="flex flex-wrap gap-2">
            {PRESETS.horizontal.map(p => <PresetButton key={p.label} preset={p} onApply={applyPreset} />)}
          </div>
        </div>

        {/* Vertical Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <Move className="w-4 h-4 text-green-400" />
              <span className="font-medium">수직 회전</span>
            </div>
            <span className="font-mono text-green-400 font-bold">{Math.round(cameraState.polar)}°</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="179" 
            value={cameraState.polar} 
            onChange={(e) => updateCamera('polar', parseInt(e.target.value))}
            className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500 touch-action-none"
          />
          <div className="flex flex-wrap gap-2">
             {PRESETS.vertical.map(p => <PresetButton key={p.label} preset={p} onApply={applyPreset} />)}
          </div>
        </div>

        {/* Distance Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-slate-300">
             <div className="flex items-center gap-2">
              <Move className="w-4 h-4 rotate-45 text-purple-400" />
              <span className="font-medium">거리 (Zoom)</span>
            </div>
            <span className="font-mono text-purple-400 font-bold">{cameraState.distance}m</span>
          </div>
          <input 
            type="range" 
            min="2" 
            max="40" 
            step="0.5"
            value={cameraState.distance} 
            onChange={(e) => updateCamera('distance', parseFloat(e.target.value))}
            className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500 touch-action-none"
          />
           <div className="flex flex-wrap gap-2">
             {PRESETS.distance.map(p => <PresetButton key={p.label} preset={p} onApply={applyPreset} />)}
          </div>
        </div>

        <div className="h-px bg-slate-800 my-4" />

        {/* Reference Image */}
        <div className="space-y-4">
           <div className="flex items-center justify-between text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-yellow-400" />
              <span className="font-medium">레퍼런스 이미지</span>
            </div>
          </div>
          
          <div className="relative">
            <label className="flex flex-col items-center justify-center w-full h-20 sm:h-24 border-2 border-slate-700 border-dashed rounded-lg cursor-pointer bg-slate-800 hover:bg-slate-750 transition-colors active:bg-slate-700">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-6 h-6 mb-2 text-slate-400" />
                <p className="text-xs text-slate-400">클릭하여 이미지 업로드</p>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>
          </div>

          {bgImage && (
            <div className="space-y-2 mt-2">
               <div className="flex justify-between text-xs text-slate-400">
                  <span>투명도</span>
                  <span>{Math.round(bgOpacity * 100)}%</span>
               </div>
               <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05"
                  value={bgOpacity}
                  onChange={(e) => setBgOpacity(parseFloat(e.target.value))}
                  className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500 touch-action-none"
               />
              <button 
                onClick={() => setBgImage(null)}
                className="w-full py-1.5 text-xs text-red-400 hover:text-red-300 border border-red-900/50 bg-red-900/20 rounded mt-2 active:bg-red-900/40"
              >
                이미지 제거
              </button>
            </div>
          )}
        </div>

      </div>
      
      <div className="mt-auto p-4 border-t border-slate-800 text-xs text-slate-600 text-center pb-8 sm:pb-4">
        <a 
          href="https://xn--design-hl6wo12cquiba7767a.com/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-blue-400 transition-colors"
        >
          떨림과울림Design.com
        </a>
      </div>
    </div>
  );
};