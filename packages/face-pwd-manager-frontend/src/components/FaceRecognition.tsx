import * as faceapi from 'face-api.js';
import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface FaceRecognitionProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onAuthenticated: () => void;
  onError: (error: string) => void;
  email: string;
}

const FaceRecognition: React.FC<FaceRecognitionProps> = ({
  videoRef,
  onAuthenticated,
  onError,
  email,
}) => {
  const { login } = useAuth();
  const [initialized, setInitialized] = useState<boolean>(false);
  const [attemptingAuth, setAttemptingAuth] = useState<boolean>(false);

  // Load only the face detector model - we don't need landmarks or descriptors
  // as face matching will be done on the backend
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models';
      try {
        console.log('Loading Face API model...');
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        console.log('Face API model loaded');
        setInitialized(true);
      } catch (error) {
        console.error('Error initializing Face API:', error);
        onError('Failed to initialize face detection.');
      }
    };

    loadModels();
  }, [onError]);
  const captureAndAuthenticate = useCallback(async () => {
    if (!videoRef.current || !initialized || !email || attemptingAuth) return;
    setAttemptingAuth(true);
    try {
      const video = videoRef.current;
      const detection = await faceapi.detectSingleFace(video);
      if (!detection) {
        console.log('No face detected. Please position yourself in the camera view.');
        setAttemptingAuth(false);
        return;
      }

      // Create a smaller canvas for faster processing
      const canvas = document.createElement('canvas');
      const targetWidth = 640; // Reduced from original video dimensions
      const targetHeight = 480;
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not create canvas context');
      }

      // Draw the video frame to the smaller canvas
      ctx.drawImage(video, 0, 0, targetWidth, targetHeight);

      // Convert canvas to blob with reduced quality for faster upload
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          blob => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to create image blob'));
          },
          'image/jpeg',
          0.8 // Reduced quality from 0.95 to 0.8 for faster processing
        );
      });

      // Login with the face image blob
      // The login function will handle encryption of the image
      await login(email, blob);
      const stream = video.srcObject as MediaStream;
      stream.getTracks().forEach(t => t.stop());
      onAuthenticated();
    } catch (err: unknown) {
      console.error('Auth error:', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : err &&
              typeof err === 'object' &&
              'response' in err &&
              err.response &&
              typeof err.response === 'object' &&
              'data' in err.response &&
              err.response.data &&
              typeof err.response.data === 'object' &&
              'message' in err.response.data
            ? String(err.response.data.message)
            : 'Authentication failed';
      onError(errorMessage);
      setAttemptingAuth(false);
    }
  }, [initialized, videoRef, email, login, onAuthenticated, onError, attemptingAuth]);

  const handlePlay = useCallback(() => {
    if (!videoRef.current || !initialized || !email) return;

    const interval = setInterval(() => {
      if (!videoRef.current) {
        clearInterval(interval);
        return;
      }

      captureAndAuthenticate();
    }, 1000); // Check every 1 second

    return () => clearInterval(interval);
  }, [videoRef, initialized, email, captureAndAuthenticate]);

  useEffect(() => {
    if (!initialized || !videoRef.current) return;

    const video = videoRef.current;
    if (video.readyState >= 2 && !video.paused && !video.ended) {
      // Video is already playing
      const cleanup = handlePlay();
      return cleanup;
    } else {
      // Video not playing yet, wait for 'play' event
      const onVideoPlay = () => handlePlay();

      video.addEventListener('play', onVideoPlay);
      return () => {
        video.removeEventListener('play', onVideoPlay);
      };
    }
  }, [initialized, videoRef, handlePlay]);

  return null; // This component doesn't render any UI
};

export default FaceRecognition;
