
import { useRef, useState, useCallback, useEffect } from 'react';

interface UseImageDragAdjustOptions {
  initialPosition?: number; // Percentage (0-100)
  onPositionChange: (newPosition: number) => void;
  imageContainerRef: React.RefObject<HTMLElement>; // Ref to the image's direct container
}

const useImageDragAdjust = ({
  initialPosition = 50,
  onPositionChange,
  imageContainerRef,
}: UseImageDragAdjustOptions) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPosition, setDragStartPosition] = useState(0); // Mouse Y position at drag start
  const [initialObjectPosition, setInitialObjectPosition] = useState(initialPosition); // Image object-position-y at drag start

  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLElement>) => {
    // Only allow left-click drag
    if (event.button !== 0) return;
    
    event.preventDefault();
    setIsDragging(true);
    setDragStartPosition(event.clientY);
    setInitialObjectPosition(initialPosition); // Capture current position from props at drag start
  }, [initialPosition]);

  const handleTouchStart = useCallback((event: React.TouchEvent<HTMLElement>) => {
    event.preventDefault(); // Prevent page scroll while dragging image
    setIsDragging(true);
    setDragStartPosition(event.touches[0].clientY);
    setInitialObjectPosition(initialPosition);
  }, [initialPosition]);

  const handleDragMove = useCallback((clientY: number) => {
    if (!isDragging || !imageContainerRef.current) return;

    const containerHeight = imageContainerRef.current.offsetHeight;
    if (containerHeight === 0) return; // Avoid division by zero if container not rendered

    const deltaY = clientY - dragStartPosition;
    
    // Sensitivity adjustment: how much drag translates to position change
    // A larger divisor means less sensitivity (more drag needed for same change)
    // Here, drag_delta_percentage is how much the drag moved relative to container height
    const dragDeltaPercentage = (deltaY / containerHeight) * 100;

    // Apply this percentage change to the initial object position.
    // Inverting deltaY because dragging mouse down should move image content up (increase Y position)
    let newPosition = initialObjectPosition - dragDeltaPercentage; 
    newPosition = Math.max(0, Math.min(100, newPosition)); // Clamp between 0 and 100

    onPositionChange(newPosition);
  }, [isDragging, dragStartPosition, initialObjectPosition, onPositionChange, imageContainerRef]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    handleDragMove(event.clientY);
  }, [handleDragMove]);
  
  const handleTouchMove = useCallback((event: TouchEvent) => {
    handleDragMove(event.touches[0].clientY);
  }, [handleDragMove]);


  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      // Position already updated via onPositionChange during drag, final save happens in parent
    }
  }, [isDragging]);
  
  const handleTouchEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
    }
  }, [isDragging]);


  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);
  
  // Update initialObjectPosition if the prop changes from outside
  useEffect(() => {
    if (!isDragging) {
      setInitialObjectPosition(initialPosition);
    }
  }, [initialPosition, isDragging]);


  return {
    isDragging,
    dragHandlers: {
      onMouseDown: handleMouseDown,
      onTouchStart: handleTouchStart,
    },
  };
};

export default useImageDragAdjust;
