import React, { useState, useRef } from 'react';
import CanvasEditor from './components/CanvasEditor';
import Button from './components/Button';
import { generateImageFromText, editImage } from './services/geminiService';
import { ToolMode, ProcessingState, CanvasEditorHandle } from './types';

// Predefined Angles
const ANGLES = [
  "Isometric",
  "Overhead View",
  "Front View",
  "Low Angle",
  "Wide Angle"
];

// Predefined Filters
const FILTERS = [
  "Grayscale",
  "Sepia",
  "Vintage",
  "Cyberpunk",
  "Watercolor"
];

// Icons
const MagicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

const EraserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12l2.25-2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.796-.33z" />
  </svg>
);

const ArrowUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
  </svg>
);

const CircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" />
  </svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);

const CameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
  </svg>
);

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-2.25m0-3h2.25M16.5 18.75v-2.25m0 2.25v2.25m0 2.25h2.25m-2.25 0h-2.25" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [circlePrompt, setCirclePrompt] = useState('');
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  
  // Preview Flow State
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [historyImage, setHistoryImage] = useState<string | null>(null);

  const [status, setStatus] = useState<ProcessingState>({ isLoading: false, statusMessage: '' });
  const [toolMode, setToolMode] = useState<ToolMode>(ToolMode.NONE);
  const [isCircleDrawn, setIsCircleDrawn] = useState(false);

  const canvasRef = useRef<CanvasEditorHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPreviewMode = !!previewImage;

  // Unified handler for the main action button
  const handleMainAction = async () => {
    if (!prompt.trim()) return;

    // If we have an image, treat the prompt as an edit instruction
    if (currentImage) {
      await handleTextEdit();
    } else {
      // If no image, treat it as a generation request
      await handleGenerate();
    }
  };

  const handleGenerate = async () => {
    setStatus({ isLoading: true, statusMessage: 'Generating Image...' });
    setToolMode(ToolMode.NONE);
    setIsCircleDrawn(false);
    
    try {
      const result = await generateImageFromText(prompt);
      setCurrentImage(result);
    } catch (error) {
      alert('Failed to generate image. Please try again.');
    } finally {
      setStatus({ isLoading: false, statusMessage: '' });
    }
  };

  const handleTextEdit = async () => {
    setStatus({ isLoading: true, statusMessage: 'Applying changes...' });
    try {
      const currentCanvasData = canvasRef.current?.getImageData();
      if (!currentCanvasData) throw new Error("No image data");
      
      const result = await editImage(currentCanvasData, prompt);
      setCurrentImage(result);
    } catch (error) {
      alert('Failed to edit image.');
    } finally {
      setStatus({ isLoading: false, statusMessage: '' });
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert("File is too large. Please upload an image smaller than 5MB.");
      event.target.value = ''; // Reset input to allow retrying
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setCurrentImage(result);
      setToolMode(ToolMode.NONE);
      setIsCircleDrawn(false);
      setPreviewImage(null);
      
      // Reset input value to allow uploading the same file again if deleted
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveBackground = async () => {
    if (!currentImage) return;

    setStatus({ isLoading: true, statusMessage: 'Removing background...' });
    try {
      const currentCanvasData = canvasRef.current?.getImageData();
      if (!currentCanvasData) throw new Error("No image data");

      const result = await editImage(currentCanvasData, "Remove the background from this image. Return a clean image with white or transparent background.");
      setCurrentImage(result);
    } catch (error) {
       alert('Failed to remove background.');
    } finally {
      setStatus({ isLoading: false, statusMessage: '' });
    }
  };

  const handleUpscale = async () => {
    if (!currentImage) return;

    setStatus({ isLoading: true, statusMessage: 'Upscaling image...' });
    try {
      const currentCanvasData = canvasRef.current?.getImageData();
      if (!currentCanvasData) throw new Error("No image data");

      const result = await editImage(currentCanvasData, "Upscale this image. Make it higher resolution, sharper, and more detailed while maintaining the original content.");
      setCurrentImage(result);
    } catch (error) {
      alert('Failed to upscale image.');
    } finally {
      setStatus({ isLoading: false, statusMessage: '' });
    }
  };

  const handleAngleChange = async (angle: string) => {
    if (!currentImage) return;

    setStatus({ isLoading: true, statusMessage: `Changing perspective to ${angle}...` });
    try {
      const currentCanvasData = canvasRef.current?.getImageData();
      if (!currentCanvasData) throw new Error("No image data");

      const editPrompt = `Change the camera angle/perspective of this image to ${angle}. Maintain the same subject, style, and composition as much as possible, just shift the viewpoint.`;
      
      const result = await editImage(currentCanvasData, editPrompt);
      setCurrentImage(result);
    } catch (error) {
      alert('Failed to change angle.');
    } finally {
      setStatus({ isLoading: false, statusMessage: '' });
    }
  };

  const handleFilterApply = async (filter: string) => {
    if (!currentImage) return;
    
    setStatus({ isLoading: true, statusMessage: `Applying ${filter} filter...` });
    try {
      const currentCanvasData = canvasRef.current?.getImageData();
      if (!currentCanvasData) throw new Error("No image data");

      const editPrompt = `Apply a ${filter} filter style to this image. Keep the content exactly the same, just change the visual style.`;
      const result = await editImage(currentCanvasData, editPrompt);
      setCurrentImage(result);
    } catch (error) {
      alert('Failed to apply filter.');
    } finally {
      setStatus({ isLoading: false, statusMessage: '' });
    }
  };

  const handleCircleToolToggle = () => {
    if (toolMode === ToolMode.CIRCLE) {
      setToolMode(ToolMode.NONE);
      setCirclePrompt('');
      setIsCircleDrawn(false);
    } else {
      setToolMode(ToolMode.CIRCLE);
      setIsCircleDrawn(false);
      setPreviewImage(null);
    }
  };

  const onCircleDrawEnd = () => {
    setIsCircleDrawn(true);
  };

  const handleCirclePreview = async () => {
    if (!isCircleDrawn || !circlePrompt.trim()) return;

    setStatus({ isLoading: true, statusMessage: 'Generating preview...' });
    
    try {
      // Get the image with the RED circle drawn on it for the AI
      const imageWithRedCircle = canvasRef.current?.getMarkedImageData();
      if (!imageWithRedCircle) throw new Error("No canvas data");

      const editingPrompt = `Edit the image: replace the area inside the red circle with ${circlePrompt}. Blend it naturally with the surroundings. Remove the red outline from the final result.`;
      
      const result = await editImage(imageWithRedCircle, editingPrompt);
      
      // Store current as history and show result as preview
      setHistoryImage(currentImage);
      setPreviewImage(result);
      
    } catch (error) {
      alert('Failed to generate preview.');
    } finally {
      setStatus({ isLoading: false, statusMessage: '' });
    }
  };

  const handleAcceptPreview = () => {
    if (previewImage) {
      setCurrentImage(previewImage);
      setPreviewImage(null);
      setHistoryImage(null);
      setToolMode(ToolMode.NONE);
      setCirclePrompt('');
      setIsCircleDrawn(false);
    }
  };

  const handleDiscardPreview = () => {
    setPreviewImage(null);
    setHistoryImage(null);
    // Tool mode remains active so user can adjust circle
  };

  const handleClearCanvas = () => {
    if (window.confirm("Are you sure you want to remove the current image?")) {
      setCurrentImage(null);
      setPreviewImage(null);
      setPrompt('');
      setToolMode(ToolMode.NONE);
      setIsCircleDrawn(false);
    }
  };

  const handleDownload = () => {
    const imgToDownload = previewImage || currentImage;
    if (!imgToDownload) return;
    const link = document.createElement('a');
    link.href = imgToDownload;
    link.download = `nano-banana-art-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <span className="font-bold text-slate-900 text-lg">N</span>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-orange-400">
              Nano Banana Studio
            </h1>
          </div>
          <div className="text-xs font-mono text-slate-500 hidden sm:block flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
            Gemini Nano Banana
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8 flex flex-col lg:flex-row gap-6">
        
        {/* Left Panel: Canvas */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex-1 min-h-[400px] lg:min-h-[600px] relative flex items-center justify-center bg-slate-900/50 rounded-lg group">
            <CanvasEditor 
              ref={canvasRef}
              imageData={previewImage || currentImage}
              mode={isPreviewMode ? ToolMode.NONE : toolMode} // Disable interaction during preview
              onDrawEnd={onCircleDrawEnd}
            />
            
            {(currentImage || previewImage) && (
              <button
                type="button"
                onClick={handleClearCanvas}
                disabled={status.isLoading}
                className="absolute top-4 right-4 z-50 p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
                title="Remove Image"
              >
                <div className="w-5 h-5"><TrashIcon /></div>
              </button>
            )}

            {/* Preview Banner */}
            {isPreviewMode && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-indigo-600/90 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-xl border border-indigo-400/50 backdrop-blur-sm">
                Preview Mode
              </div>
            )}

            {status.isLoading && (
              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-lg">
                 <div className="w-16 h-16 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin mb-4"></div>
                 <p className="text-lg font-medium text-yellow-200 animate-pulse">{status.statusMessage}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Controls */}
        <div className="w-full lg:w-96 flex flex-col gap-6">
          
          {/* Main Action Section - Disabled during preview */}
          <div className={`bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl ${isPreviewMode ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                {currentImage ? "Edit Image" : "Start Here"}
              </h2>
              <div className="flex gap-2">
                 <button 
                   type="button"
                   onClick={handleUploadClick} 
                   className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded transition-colors flex items-center gap-1"
                   disabled={status.isLoading}
                 >
                    <UploadIcon />
                    <span className="hidden sm:inline">Upload</span>
                 </button>
                 <input 
                   type="file" 
                   ref={fileInputRef} 
                   className="hidden" 
                   accept="image/*" 
                   onChange={handleFileChange} 
                 />
              </div>
            </div>
            <div className="space-y-4">
              <textarea 
                className="w-full bg-slate-800 border-slate-700 text-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all resize-none h-24"
                placeholder={currentImage ? "Describe how you want to change the image..." : "Describe your imagination..."}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <Button 
                onClick={handleMainAction} 
                disabled={!prompt.trim() || toolMode === ToolMode.CIRCLE} 
                isLoading={status.isLoading}
                className="w-full bg-yellow-600 hover:bg-yellow-500 text-slate-900 font-bold shadow-yellow-500/20 focus:ring-yellow-500"
                icon={<MagicIcon />}
              >
                {currentImage ? "Apply Edit" : "Generate Image"}
              </Button>
            </div>
          </div>

          {/* Tools Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex-1 flex flex-col gap-6">
            
            {/* Quick Edits */}
            <div className={isPreviewMode ? 'opacity-50 pointer-events-none' : ''}>
               <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Quick Edits</h2>
               <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="secondary" 
                  onClick={handleRemoveBackground}
                  disabled={!currentImage || status.isLoading || toolMode === ToolMode.CIRCLE}
                  className="text-xs"
                  icon={<EraserIcon />}
                >
                  Remove BG
                </Button>
                <Button 
                  variant="secondary"
                  onClick={handleUpscale}
                  disabled={!currentImage || status.isLoading || toolMode === ToolMode.CIRCLE}
                  className="text-xs"
                  icon={<ArrowUpIcon />}
                >
                  Upscale
                </Button>
              </div>
            </div>
            
            {/* Filters */}
             <div className={isPreviewMode ? 'opacity-50 pointer-events-none' : ''}>
               <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                 <span className="w-4 h-4 flex items-center justify-center"><SparklesIcon /></span> Filters
               </h2>
               <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {FILTERS.map((filter) => (
                    <button
                      type="button"
                      key={filter}
                      onClick={() => handleFilterApply(filter)}
                      disabled={!currentImage || status.isLoading || toolMode === ToolMode.CIRCLE}
                      className="text-xs bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700 text-slate-300 rounded px-2 py-2 transition-all hover:border-slate-500 truncate"
                    >
                      {filter}
                    </button>
                  ))}
               </div>
            </div>

            {/* Change Angle Tool */}
            <div className={isPreviewMode ? 'opacity-50 pointer-events-none' : ''}>
               <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                 <span className="w-4 h-4 flex items-center justify-center"><CameraIcon /></span> Change Angle
               </h2>
               <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ANGLES.map((angle) => (
                    <button
                      type="button"
                      key={angle}
                      onClick={() => handleAngleChange(angle)}
                      disabled={!currentImage || status.isLoading || toolMode === ToolMode.CIRCLE}
                      className="text-xs bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700 text-slate-300 rounded px-2 py-2 transition-all hover:border-slate-500 truncate"
                    >
                      {angle}
                    </button>
                  ))}
               </div>
            </div>

            {/* Circle Tool - Modified for Preview Flow */}
            <div className="border-t border-slate-800 pt-6 mt-auto">
              <div className="flex items-center justify-between mb-4">
                 <h3 className="text-slate-200 font-medium flex items-center gap-2">
                   <CircleIcon />
                   Circle to Add
                 </h3>
                 {!isPreviewMode && (
                   <button 
                     type="button"
                     onClick={handleCircleToolToggle}
                     disabled={!currentImage || status.isLoading}
                     className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                       toolMode === ToolMode.CIRCLE 
                         ? 'bg-red-500/20 text-red-400 border border-red-500/50' 
                         : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                     } disabled:opacity-50`}
                   >
                     {toolMode === ToolMode.CIRCLE ? 'Active' : 'Enable'}
                   </button>
                 )}
              </div>

              {toolMode === ToolMode.CIRCLE && !isPreviewMode && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-xs text-slate-400">
                    Draw & resize the circle, then describe object.
                  </p>
                  <input 
                    type="text"
                    className="w-full bg-slate-800 border-slate-700 text-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="e.g., A vintage clock"
                    value={circlePrompt}
                    onChange={(e) => setCirclePrompt(e.target.value)}
                  />
                  <Button 
                    variant="danger"
                    onClick={handleCirclePreview}
                    disabled={!isCircleDrawn || !circlePrompt.trim() || status.isLoading}
                    className="w-full"
                  >
                    Generate Preview
                  </Button>
                </div>
              )}

              {/* Preview Actions */}
              {isPreviewMode && (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                   <p className="text-xs text-yellow-300 font-medium text-center">
                     Does this look correct?
                   </p>
                   <div className="grid grid-cols-2 gap-3">
                     <Button 
                       variant="secondary"
                       onClick={handleDiscardPreview}
                       className="bg-slate-700 hover:bg-slate-600 text-slate-200"
                       icon={<XIcon />}
                     >
                       Discard
                     </Button>
                     <Button 
                       onClick={handleAcceptPreview}
                       className="bg-green-600 hover:bg-green-500 text-white shadow-green-500/20"
                       icon={<CheckIcon />}
                     >
                       Keep
                     </Button>
                   </div>
                </div>
              )}
            </div>
          </div>

          {/* Download */}
          {(currentImage || previewImage) && (
             <Button 
                variant="ghost" 
                onClick={handleDownload}
                className="w-full border border-slate-700"
                icon={<DownloadIcon />}
              >
                Download Image
              </Button>
          )}

        </div>
      </main>
    </div>
  );
}