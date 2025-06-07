// src/components/Webcam.tsx
import React, { useEffect } from "react";

interface WebcamProps {
  videoRef?: React.RefObject<HTMLVideoElement>;
  onStreamStart?: () => void;
  onStreamError?: (error: string) => void;
  onCapture?: (blob: Blob) => void;
}

const Webcam: React.FC<WebcamProps> = ({
  videoRef,
  onStreamStart,
  onStreamError,
  onCapture,
}) => {
  const localVideoRef = React.useRef<HTMLVideoElement>(null);
  const ref = videoRef || localVideoRef;

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
        console.error("Error accessing webcam:", error);
        if (onStreamError) onStreamError("Failed to access webcam.");
      }
    };
    startWebcam();
  }, [ref, onStreamStart, onStreamError]);

  const handleCapture = () => {
    if (!ref.current) return;
    const video = ref.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 720;
    canvas.height = video.videoHeight || 560;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob && onCapture) onCapture(blob);
      }, "image/jpeg");
    }
  };
  return (
    <div className="flex flex-col justify-center items-center">
      {" "}
      <video
        ref={ref}
        autoPlay
        muted
        className="w-full max-h-[400px] object-cover rounded-lg border border-[var(--color-border-primary)]"
      />
      {onCapture && (
        <button
          type="button"
          className="mt-3 px-6 py-2 rounded-[14px] bg-[var(--color-bg-button)] text-white border border-[var(--color-border-accent)] shadow-[0_0_10px_1px_var(--color-shadow-button)] hover:shadow-[0_0_15px_3px_var(--color-shadow-button-hover)] transition-all duration-300 font-medium"
          onClick={handleCapture}
        >
          Capture
        </button>
      )}
    </div>
  );
};

export default Webcam;
