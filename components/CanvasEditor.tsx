import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { ToolMode, CanvasEditorHandle } from '../types';

interface CanvasEditorProps {
  imageData: string | null;
  mode: ToolMode;
  onDrawEnd: () => void;
}

interface Selection {
  x: number;
  y: number;
  w: number;
  h: number;
}

const CanvasEditor = forwardRef<CanvasEditorHandle, CanvasEditorProps>(({ imageData, mode, onDrawEnd }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  
  // Selection State
  const [selection, setSelection] = useState<Selection | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragAction, setDragAction] = useState<'CREATE' | 'MOVE' | 'RESIZE'>('CREATE');
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activeHandle, setActiveHandle] = useState<string>('');

  // Initialize canvas context
  useEffect(() => {
    if (canvasRef.current) {
      const context = canvasRef.current.getContext('2d', { willReadFrequently: true });
      setCtx(context);
    }
  }, []);

  // Clear selection when mode changes or image changes
  useEffect(() => {
    if (mode !== ToolMode.CIRCLE) {
      setSelection(null);
    }
  }, [mode, imageData]);

  // Handle image loading
  useEffect(() => {
    if (!ctx || !canvasRef.current) return;

    if (imageData) {
      const img = new Image();
      img.src = imageData;
      img.onload = () => {
        if (!canvasRef.current || !ctx) return;
        canvasRef.current.width = img.width;
        canvasRef.current.height = img.height;
        ctx.drawImage(img, 0, 0);
      };
    } else {
      canvasRef.current.width = 1024;
      canvasRef.current.height = 1024;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 40px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('Generated Image Area', canvasRef.current.width / 2, canvasRef.current.height / 2);
    }
  }, [imageData, ctx]);

  // Helper: Get coordinate relative to container
  const getLocalCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  // Helper: "Bake" the selection into the image data for the API
  const getMarkedImageData = () => {
    if (!canvasRef.current || !selection || !containerRef.current) return '';
    
    // Create a temporary canvas to draw the red circle on top of the image
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvasRef.current.width;
    tempCanvas.height = canvasRef.current.height;
    const tCtx = tempCanvas.getContext('2d');
    if (!tCtx) return '';

    // Draw original image
    tCtx.drawImage(canvasRef.current, 0, 0);

    // Calculate scaling between CSS pixels (container) and Canvas pixels (resolution)
    // The canvas has style { width: 'auto', height: 'auto', maxHeight: '600px', maxWidth: '100%' }
    // We need to match the visual aspect ratio to the actual aspect ratio.
    const rect = canvasRef.current.getBoundingClientRect(); // Visual size
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    // Draw red circle (ellipse)
    tCtx.beginPath();
    const centerX = (selection.x + selection.w / 2) * scaleX;
    const centerY = (selection.y + selection.h / 2) * scaleY;
    const radiusX = Math.abs(selection.w / 2) * scaleX;
    const radiusY = Math.abs(selection.h / 2) * scaleY;

    tCtx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
    tCtx.strokeStyle = '#ef4444'; // Red
    tCtx.lineWidth = Math.max(5, tempCanvas.width / 150); // Scale line width
    tCtx.stroke();

    return tempCanvas.toDataURL('image/png');
  };

  useImperativeHandle(ref, () => ({
    getImageData: () => {
      if (!canvasRef.current) return '';
      return canvasRef.current.toDataURL('image/png');
    },
    getMarkedImageData
  }));

  // --- Interaction Handlers ---

  const handleMouseDown = (e: React.MouseEvent) => {
    if (mode !== ToolMode.CIRCLE) return;
    e.preventDefault(); // Prevent text selection
    const { x, y } = getLocalCoordinates(e);

    // Check if clicking a handle
    if (selection) {
      const handles = ['nw', 'ne', 'sw', 'se'];
      for (const h of handles) {
        const handleEl = containerRef.current?.querySelector(`[data-handle="${h}"]`);
        if (handleEl && handleEl.contains(e.target as Node)) {
          setIsDragging(true);
          setDragAction('RESIZE');
          setActiveHandle(h);
          setDragStart({ x, y });
          return;
        }
      }

      // Check if clicking inside selection to move
      if (x >= selection.x && x <= selection.x + selection.w &&
          y >= selection.y && y <= selection.y + selection.h) {
        setIsDragging(true);
        setDragAction('MOVE');
        setDragStart({ x, y });
        return;
      }
    }

    // Otherwise, create new
    setIsDragging(true);
    setDragAction('CREATE');
    setSelection({ x, y, w: 0, h: 0 });
    setDragStart({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || mode !== ToolMode.CIRCLE) return;
    const { x, y } = getLocalCoordinates(e);

    if (dragAction === 'CREATE') {
      const w = x - dragStart.x;
      const h = y - dragStart.y;
      setSelection({
        x: w < 0 ? x : dragStart.x,
        y: h < 0 ? y : dragStart.y,
        w: Math.abs(w),
        h: Math.abs(h)
      });
    } else if (dragAction === 'MOVE' && selection) {
      const dx = x - dragStart.x;
      const dy = y - dragStart.y;
      setSelection({
        ...selection,
        x: selection.x + dx,
        y: selection.y + dy
      });
      setDragStart({ x, y });
    } else if (dragAction === 'RESIZE' && selection) {
      // Simplified resize logic based on active handle
      let newX = selection.x;
      let newY = selection.y;
      let newW = selection.w;
      let newH = selection.h;

      // This is a basic implementation, can be robustified
      const dx = x - dragStart.x;
      const dy = y - dragStart.y;

      if (activeHandle.includes('e')) newW += dx;
      if (activeHandle.includes('s')) newH += dy;
      if (activeHandle.includes('w')) { newX += dx; newW -= dx; }
      if (activeHandle.includes('n')) { newY += dy; newH -= dy; }

      setSelection({ x: newX, y: newY, w: Math.max(10, newW), h: Math.max(10, newH) });
      setDragStart({ x, y });
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      onDrawEnd(); // Notify parent that a shape exists
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full flex items-center justify-center bg-slate-900 rounded-lg overflow-hidden border-2 border-slate-700 shadow-xl relative select-none touch-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <canvas
        ref={canvasRef}
        className="max-w-full max-h-[600px] object-contain shadow-lg"
        style={{ width: 'auto', height: 'auto', pointerEvents: 'none' }} // Canvas is visual only now
      />
      
      {/* Selection Overlay */}
      {selection && mode === ToolMode.CIRCLE && (
        <div 
          className="absolute border-2 border-red-500 bg-red-500/10 rounded-[50%]"
          style={{
            left: selection.x,
            top: selection.y,
            width: selection.w,
            height: selection.h,
            cursor: 'move'
          }}
        >
          {/* Resize Handles */}
          {['nw', 'ne', 'sw', 'se'].map(h => (
            <div
              key={h}
              data-handle={h}
              className={`absolute w-3 h-3 bg-white border border-red-500 rounded-full z-10 
                ${h === 'nw' ? '-top-1.5 -left-1.5 cursor-nw-resize' : ''}
                ${h === 'ne' ? '-top-1.5 -right-1.5 cursor-ne-resize' : ''}
                ${h === 'sw' ? '-bottom-1.5 -left-1.5 cursor-sw-resize' : ''}
                ${h === 'se' ? '-bottom-1.5 -right-1.5 cursor-se-resize' : ''}
              `}
            />
          ))}
        </div>
      )}

      {/* Overlay hint for circle mode */}
      {mode === ToolMode.CIRCLE && !selection && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-800/90 text-white px-4 py-2 rounded-full text-xs font-semibold pointer-events-none shadow-lg backdrop-blur-sm animate-pulse z-20 border border-slate-600">
          Click and drag to circle an area
        </div>
      )}
    </div>
  );
});

export default CanvasEditor;
