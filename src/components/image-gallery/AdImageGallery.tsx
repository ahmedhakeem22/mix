
import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AdImageGalleryProps {
  images: string[];
  title: string;
}

export function AdImageGallery({ images, title }: AdImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageZoom, setImageZoom] = useState(1);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleZoomIn = () => {
    setImageZoom(prev => Math.min(prev + 0.1, 3));
  };
  
  const handleZoomOut = () => {
    setImageZoom(prev => Math.max(prev - 0.1, 1));
    if (imageZoom <= 1.1) {
      setDragOffset({ x: 0, y: 0 });
    }
  };
  
  const handleResetZoom = () => {
    setImageZoom(1);
    setDragOffset({ x: 0, y: 0 });
  };
  
  const handlePrevImage = () => {
    if (!images || !images.length) return;
    setCurrentImageIndex((prev) => prev === 0 ? images.length - 1 : prev - 1);
    handleResetZoom();
  };
  
  const handleNextImage = () => {
    if (!images || !images.length) return;
    setCurrentImageIndex((prev) => prev === images.length - 1 ? 0 : prev + 1);
    handleResetZoom();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (imageZoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && imageZoom > 1) {
      const newX = dragOffset.x + (e.clientX - dragStart.x);
      const newY = dragOffset.y + (e.clientY - dragStart.y);
      
      // Limit dragging to ensure the image doesn't get dragged out of view
      const maxDrag = (imageZoom - 1) * 100; // Approx max drag distance
      const clampedX = Math.max(Math.min(newX, maxDrag), -maxDrag);
      const clampedY = Math.max(Math.min(newY, maxDrag), -maxDrag);
      
      setDragOffset({ x: clampedX, y: clampedY });
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (imageZoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && imageZoom > 1) {
      const newX = dragOffset.x + (e.touches[0].clientX - dragStart.x);
      const newY = dragOffset.y + (e.touches[0].clientY - dragStart.y);
      
      // Limit dragging
      const maxDrag = (imageZoom - 1) * 100;
      const clampedX = Math.max(Math.min(newX, maxDrag), -maxDrag);
      const clampedY = Math.max(Math.min(newY, maxDrag), -maxDrag);
      
      setDragOffset({ x: clampedX, y: clampedY });
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  if (!images || images.length === 0) {
    return (
      <div className="rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 h-64 flex items-center justify-center">
        <p className="text-neutral-500 dark:text-neutral-400">لا توجد صور</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700">
      <div className="relative bg-neutral-100 dark:bg-neutral-800">
        <Dialog>
          <DialogTrigger asChild>
            <div className="cursor-zoom-in relative h-64 md:h-96">
              <img 
                ref={imageRef}
                src={images[currentImageIndex]} 
                alt={title} 
                className="w-full h-full object-contain"
              />
              
              <div className="absolute top-2 right-2 bg-black/30 text-white p-2 rounded-full">
                <Maximize className="h-5 w-5" />
              </div>
            </div>
          </DialogTrigger>
          
          <DialogContent className="max-w-5xl w-[90vw] h-[90vh] p-0 bg-black/95"
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchEnd={handleTouchEnd}
          >
            <div 
              className="relative w-full h-full flex items-center justify-center p-4"
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
            >
              <div className="absolute top-4 right-4 flex gap-2 z-40">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="bg-black/50 hover:bg-black/70 text-white rounded-full"
                  onClick={handleZoomIn}
                >
                  <ZoomIn className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="bg-black/50 hover:bg-black/70 text-white rounded-full"
                  onClick={handleZoomOut}
                >
                  <ZoomOut className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="bg-black/50 hover:bg-black/70 text-white rounded-full"
                  onClick={handleResetZoom}
                >
                  <Maximize className="h-5 w-5" />
                </Button>
              </div>
              
              <img 
                src={images[currentImageIndex]} 
                alt={title} 
                className="max-w-full max-h-full object-contain transition-transform duration-200"
                style={{ 
                  transform: `scale(${imageZoom}) translate(${dragOffset.x}px, ${dragOffset.y}px)`,
                  cursor: imageZoom > 1 ? 'move' : 'default'
                }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
              />
              
              {images.length > 1 && (
                <>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full z-30"
                    onClick={handlePrevImage}
                  >
                    <ArrowRight className="h-6 w-6" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full z-30"
                    onClick={handleNextImage}
                  >
                    <ArrowLeft className="h-6 w-6" />
                  </Button>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1 z-30">
                    {images.map((_, index) => (
                      <button 
                        key={index}
                        className={`w-2 h-2 rounded-full ${currentImageIndex === index ? 'bg-white' : 'bg-white/50'}`}
                        onClick={() => {
                          setCurrentImageIndex(index);
                          handleResetZoom();
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
        
        {images.length > 1 && (
          <>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white/70 dark:bg-neutral-700/80 hover:bg-white dark:hover:bg-neutral-600 rounded-full"
              onClick={handlePrevImage}
            >
              <ChevronRight className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white/70 dark:bg-neutral-700/80 hover:bg-white dark:hover:bg-neutral-600 rounded-full"
              onClick={handleNextImage}
            >
              <ChevronLeft className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
            </Button>
            
            {/* Pagination dots */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
              {images.map((_, index) => (
                <button 
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full ${currentImageIndex === index ? 'bg-brand' : 'bg-gray-300 dark:bg-gray-600'}`}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </div>
          </>
        )}
      </div>
      
      {images.length > 1 && (
        <div className="flex p-2 gap-2 overflow-x-auto bg-neutral-50 dark:bg-neutral-800 scroll-container no-scrollbar">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-16 h-16 flex-shrink-0 rounded overflow-hidden border-2 transition-all ${
                index === currentImageIndex 
                  ? 'border-brand' 
                  : 'border-transparent hover:border-neutral-300 dark:hover:border-neutral-600'
              }`}
            >
              <img 
                src={image} 
                alt={`صورة ${index + 1}`} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
