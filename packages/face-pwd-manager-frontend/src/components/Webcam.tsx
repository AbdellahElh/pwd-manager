// src/components/Webcam.tsx
import React, { useCallback, useEffect, useState } from 'react';

interface WebcamProps {
  videoRef?: React.RefObject<HTMLVideoElement>;
  onStreamStart?: () => void;
  onStreamError?: (error: string) => void;
  onCapture?: (blob: Blob) => void;
}

const Webcam: React.FC<WebcamProps> = ({ videoRef, onStreamStart, onStreamError, onCapture }) => {
  const localVideoRef = React.useRef<HTMLVideoElement>(null);
  const ref = videoRef || localVideoRef;
  const [isCapturing, setIsCapturing] = useState(false);
  const handleCapture = useCallback(() => {
    if (!ref.current || isCapturing) return;

    // Start capture animation
    setIsCapturing(true);

    const video = ref.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 720;
    canvas.height = video.videoHeight || 560;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => {
        if (blob && onCapture) onCapture(blob);

        // Reset animation after a brief delay
        setTimeout(() => {
          setIsCapturing(false);
        }, 300);
      }, 'image/jpeg');
    }
  }, [ref, onCapture, isCapturing]);

  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (ref.current) {
          ref.current.srcObject = stream;
          ref.current.onloadedmetadata = () => {
            ref.current?.play();
            if (onStreamStart) onStreamStart();
          };
        }
      } catch (error) {
        console.error('Error accessing webcam:', error);
        if (onStreamError) onStreamError('Failed to access webcam.');
      }
    };
    startWebcam();
  }, [ref, onStreamStart, onStreamError]);

  // Add keyboard event listener for Enter key to trigger capture
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && onCapture) {
        event.preventDefault();
        handleCapture();
      }
    };

    // Only add the event listener if onCapture is provided (capture functionality is available)
    if (onCapture) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [onCapture, handleCapture, isCapturing]);
  return (
    <div className='flex flex-col justify-center items-center'>
      {' '}
      <video
        ref={ref}
        autoPlay
        muted
        className='w-full max-h-[400px] object-cover rounded-lg border border-[var(--color-border-primary)]'
      />
      {onCapture && (
        <button
          type='button'
          className={`mt-3 px-6 py-2 rounded-[14px] bg-[var(--color-bg-button)] text-white border border-[var(--color-border-accent)] font-medium transition-all duration-300 ${
            isCapturing
              ? 'shadow-[0_0_20px_5px_var(--color-shadow-button-hover)] scale-95 opacity-80'
              : 'shadow-[0_0_10px_1px_var(--color-shadow-button)] hover:shadow-[0_0_15px_3px_var(--color-shadow-button-hover)] hover:scale-105'
          }`}
          onClick={handleCapture}
          disabled={isCapturing}
        >
          {isCapturing ? 'Capturing...' : 'Capture'}
        </button>
      )}
    </div>
  );
};

export default Webcam;
