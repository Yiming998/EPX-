import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as fabric from 'fabric';
import { Template } from '../types';
import { getTemplateById } from '../store';
import { ArrowLeft, Download, Upload, ZoomIn, Image as ImageIcon } from 'lucide-react';

export const ImageEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const imageObjRef = useRef<fabric.Image | null>(null);
  const maskObjRef = useRef<fabric.Rect | null>(null);
  
  const [zoom, setZoom] = useState(1);
  const [hasImage, setHasImage] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadTemplate = async () => {
      if (id) {
        setLoading(true);
        try {
          const t = await getTemplateById(id);
          if (t) {
            setTemplate(t);
          } else {
            navigate('/');
          }
        } catch (error) {
          console.error('Failed to load template:', error);
          navigate('/');
        } finally {
          setLoading(false);
        }
      }
    };
    loadTemplate();
  }, [id, navigate]);

  useEffect(() => {
    if (!template || !canvasRef.current || !containerRef.current) return;

    // Initialize Fabric Canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: template.width,
      height: template.height,
      backgroundColor: template.backgroundColor,
      preserveObjectStacking: true,
      enableRetinaScaling: true,
    });

    fabricCanvasRef.current = canvas;

    // Create Mask Layer if enabled
    const createMask = () => {
      if (!template.maskEnabled) return null;

      let fill: any = template.maskColor;
      
      if (template.maskType === 'gradient') {
        fill = new fabric.Gradient({
          type: 'linear',
          gradientUnits: 'pixels',
          coords: getGradientCoords(template.maskGradientAngle, template.width, template.height),
          colorStops: [
            { offset: 0, color: template.maskGradientColors[0] },
            { offset: 1, color: template.maskGradientColors[1] }
          ]
        });
      }

      const mask = new fabric.Rect({
        left: -1,
        top: -1,
        originX: 'left',
        originY: 'top',
        width: template.width + 2,
        height: template.height + 2,
        fill: fill,
        opacity: template.maskOpacity / 100,
        selectable: false,
        evented: false,
        objectCaching: false,
        strokeWidth: 0,
        globalCompositeOperation: (template.maskBlendMode as any !== 'normal' ? template.maskBlendMode as any : 'source-over')
      });

      // If opacity is 100% and blend mode is normal, ensure it's truly solid
      if (template.maskOpacity === 100 && template.maskBlendMode === 'normal') {
        mask.globalCompositeOperation = 'source-over';
      }

      return mask;
    };

    const mask = createMask();
    if (mask) {
      maskObjRef.current = mask;
      canvas.add(mask);
    }

    // Handle window resize to scale canvas view
    const handleResize = () => {
      if (!containerRef.current || !fabricCanvasRef.current) return;
      const containerWidth = containerRef.current.clientWidth - 64; // padding
      const containerHeight = containerRef.current.clientHeight - 64;
      
      const scaleX = containerWidth / template.width;
      const scaleY = containerHeight / template.height;
      const scale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond 1
      
      const wrapper = document.querySelector('.canvas-wrapper') as HTMLElement;
      if (wrapper) {
        wrapper.style.transform = `scale(${scale})`;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // Add click handler to canvas if no image
    canvas.on('mouse:down', () => {
      if (!imageObjRef.current) {
        fileInputRef.current?.click();
      }
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
    };
  }, [template]);

    // Helper for gradient angle to match CSS linear-gradient
    const getGradientCoords = (cssAngle: number, width: number, height: number) => {
      // Convert CSS angle to mathematical angle (CSS 0deg is up, 90deg is right)
      const mathAngle = 90 - cssAngle;
      const angleRad = (mathAngle * Math.PI) / 180;
      
      // Calculate the length of the gradient line
      const length = Math.abs(width * Math.cos(angleRad)) + Math.abs(height * Math.sin(angleRad));
      
      // Calculate the start and end points
      const halfLength = length / 2;
      
      // With originX: 'left', originY: 'top', coordinates are relative to the top-left corner
      const centerX = width / 2;
      const centerY = height / 2;
      
      // Since Y axis is inverted in canvas (0 is top), we invert the Y calculation
      const x1 = centerX - Math.cos(angleRad) * halfLength;
      const y1 = centerY + Math.sin(angleRad) * halfLength;
      const x2 = centerX + Math.cos(angleRad) * halfLength;
      const y2 = centerY - Math.sin(angleRad) * halfLength;
      
      return { x1, y1, x2, y2 };
    };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !fabricCanvasRef.current || !template) return;

    const reader = new FileReader();
    reader.onload = (f) => {
      const data = f.target?.result as string;
      const imgElement = new Image();
      imgElement.onload = () => {
        const canvas = fabricCanvasRef.current;
        if (!canvas || !template) return;

        // Create Fabric Image
        const img = new fabric.FabricImage(imgElement, {
          originX: 'center',
          originY: 'center',
          left: template.width / 2,
          top: template.height / 2,
          selectable: true,
          hasControls: false,
          hasBorders: false,
          lockRotation: true,
          opacity: template.imageOpacity / 100,
        });
        
        // Remove existing image if any
        if (imageObjRef.current) {
          canvas.remove(imageObjRef.current);
        }

        // Calculate scale to cover canvas
        const scaleX = template.width / imgElement.width;
        const scaleY = template.height / imgElement.height;
        const scale = Math.max(scaleX, scaleY);
        img.set({ scaleX: scale, scaleY: scale });

        imageObjRef.current = img;
        
        // Add image to canvas at the bottom
        canvas.add(img);
        canvas.sendObjectToBack(img);
        
        // Ensure mask is always at the top
        if (maskObjRef.current) {
          canvas.bringObjectToFront(maskObjRef.current);
        }
        
        canvas.setActiveObject(img);
        canvas.requestRenderAll();
        
        setHasImage(true);
        setZoom(1);
      };
      imgElement.src = data;
    };
    reader.readAsDataURL(file);
  };

  const handleZoom = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = parseFloat(e.target.value);
    setZoom(newZoom);
    
    if (imageObjRef.current && template) {
      const img = imageObjRef.current;
      // Base scale to cover
      const baseScaleX = template.width / img.width!;
      const baseScaleY = template.height / img.height!;
      const baseScale = Math.max(baseScaleX, baseScaleY);
      
      img.set({
        scaleX: baseScale * newZoom,
        scaleY: baseScale * newZoom
      });
      fabricCanvasRef.current?.renderAll();
    }
  };

  const handleDownload = () => {
    if (!fabricCanvasRef.current || !template) return;
    
    // Deselect objects to remove selection borders
    fabricCanvasRef.current.discardActiveObject();
    fabricCanvasRef.current.renderAll();
    
    const dataURL = fabricCanvasRef.current.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1
    });
    
    const link = document.createElement('a');
    link.download = `${template.name.replace(/\s+/g, '_')}_export.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-slate-50 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!template) return null;

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-slate-800">{template.name}</h1>
            <p className="text-xs text-slate-500">{template.width} &times; {template.height} px</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors cursor-pointer">
            <Upload size={18} />
            {hasImage ? '更换图片' : '上传图片'}
            <input 
              type="file" 
              accept="image/png, image/jpeg, image/webp" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleImageUpload}
            />
          </label>
          <button
            onClick={handleDownload}
            disabled={!hasImage}
            className={`px-5 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors ${
              hasImage 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Download size={18} />
            下载
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Controls */}
        <aside className="w-80 bg-white border-r border-slate-200 overflow-y-auto shrink-0 flex flex-col p-6">
          <div className="space-y-8">
            <section>
              <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4">操作说明</h2>
              <ul className="text-sm text-slate-600 space-y-3">
                <li className="flex gap-2">
                  <span className="bg-indigo-100 text-indigo-700 w-5 h-5 rounded-full flex items-center justify-center shrink-0 font-medium text-xs">1</span>
                  点击右上角按钮上传图片。
                </li>
                <li className="flex gap-2">
                  <span className="bg-indigo-100 text-indigo-700 w-5 h-5 rounded-full flex items-center justify-center shrink-0 font-medium text-xs">2</span>
                  在画布上拖拽图片以调整位置。
                </li>
                <li className="flex gap-2">
                  <span className="bg-indigo-100 text-indigo-700 w-5 h-5 rounded-full flex items-center justify-center shrink-0 font-medium text-xs">3</span>
                  使用下方滑块缩放图片。
                </li>
                <li className="flex gap-2">
                  <span className="bg-indigo-100 text-indigo-700 w-5 h-5 rounded-full flex items-center justify-center shrink-0 font-medium text-xs">4</span>
                  满意后点击下载按钮。
                </li>
              </ul>
            </section>

            {hasImage && (
              <>
                <hr className="border-slate-200" />
                <section>
                  <div className="flex items-center gap-2 mb-4 text-slate-800 font-medium">
                    <ZoomIn size={18} />
                    <h2>图片缩放</h2>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="block text-sm font-medium text-slate-700">缩放比例</label>
                      <span className="text-sm text-slate-500">{Math.round(zoom * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="3"
                      step="0.01"
                      value={zoom}
                      onChange={handleZoom}
                      className="w-full"
                    />
                  </div>
                </section>
              </>
            )}
          </div>
        </aside>

        {/* Canvas Area */}
        <main 
          ref={containerRef}
          className="flex-1 bg-slate-200 overflow-hidden flex items-center justify-center relative"
        >
          {/* Checkerboard background for transparency */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
            opacity: 0.2
          }}></div>
          
          {!hasImage && (
            <div 
              className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="bg-white/80 backdrop-blur-sm px-6 py-4 rounded-xl shadow-lg flex flex-col items-center gap-3 hover:scale-105 transition-transform">
                <ImageIcon size={32} className="text-indigo-500" />
                <p className="text-slate-700 font-medium">点击此处或右上角上传图片</p>
              </div>
            </div>
          )}

          <div 
            className={`canvas-wrapper shadow-2xl origin-center transition-transform duration-100 ${!hasImage ? 'cursor-pointer' : ''}`}
            onClick={() => !hasImage && fileInputRef.current?.click()}
          >
            <canvas ref={canvasRef} />
          </div>
        </main>
      </div>
    </div>
  );
};
