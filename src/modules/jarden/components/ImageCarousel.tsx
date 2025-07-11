
import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, PhotoIcon } from '@heroicons/react/24/outline';

interface ImageCarouselProps {
  images: { url: string; alt: string; }[];
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  if (!images || images.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg text-slate-500 dark:text-slate-400">
            <PhotoIcon className="w-8 h-8 mb-2"/>
            <p className="text-sm">No images in this gallery.</p>
        </div>
    );
  }
  
  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === images.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };
  
  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };
  
  // Scroll thumbnail into view
  useEffect(() => {
    if (thumbnailsRef.current) {
        const activeThumbnail = thumbnailsRef.current.children[currentIndex] as HTMLElement;
        if (activeThumbnail) {
            activeThumbnail.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    }
  }, [currentIndex]);


  return (
    <div className="w-full relative">
        <div className="relative h-96 w-full rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700">
            {images.map((image, index) => (
                <div key={index} className={`absolute top-0 left-0 w-full h-full transition-opacity duration-500 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}>
                    <img src={image.url} alt={image.alt} className="w-full h-full object-contain" />
                </div>
            ))}
             {images.length > 1 && (
                <>
                    <button onClick={goToPrevious} className="absolute top-1/2 left-2 -translate-y-1/2 p-2 bg-black/40 text-white rounded-full hover:bg-black/60 transition-colors z-10">
                        <ChevronLeftIcon className="w-6 h-6"/>
                    </button>
                    <button onClick={goToNext} className="absolute top-1/2 right-2 -translate-y-1/2 p-2 bg-black/40 text-white rounded-full hover:bg-black/60 transition-colors z-10">
                        <ChevronRightIcon className="w-6 h-6"/>
                    </button>
                </>
             )}
        </div>

        {images.length > 1 && (
            <div ref={thumbnailsRef} className="mt-3 flex space-x-2 overflow-x-auto pb-2 custom-scrollbar">
                {images.map((image, index) => (
                    <div key={index} onClick={() => goToSlide(index)} className="cursor-pointer flex-shrink-0">
                        <img 
                            src={image.url} 
                            alt={`Thumbnail ${index + 1}`} 
                            className={`w-20 h-20 rounded-md object-cover border-2 transition-all ${currentIndex === index ? 'border-emerald-500' : 'border-transparent hover:border-slate-400'}`}
                        />
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};

export default ImageCarousel;
