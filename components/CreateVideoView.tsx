
import React, { useRef, useEffect, useState } from 'react';
import { X, SwitchCamera, Image as ImageIcon, Video, Circle, StopCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface CreateVideoViewProps {
  onClose: () => void;
  onVideoReady: (file: File) => void;
}

const CreateVideoView: React.FC<CreateVideoViewProps> = ({ onClose, onVideoReady }) => {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('user');
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState(true);
  
  // New States for Countdown and Timer
  const [countdown, setCountdown] = useState<number | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const timerIntervalRef = useRef<any>(null);

  const startCamera = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // OPTIMIZATION: 
      // 1. Audio: Disable processing (echo/noise) to reduce CPU load significantly (fixes lag).
      // 2. Video: Target 720p height (ideal for mobile vertical) at exactly 30fps.
      //    30fps Locked is smoother than variable frame rates.
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
            facingMode: cameraFacingMode,
            height: { ideal: 720 }, // 720p is the sweet spot for mobile web performance
            frameRate: { ideal: 30, max: 30 } // Lock FPS to prevent jitter
        },
        audio: {
            echoCancellation: false, // OFF for performance
            noiseSuppression: false, // OFF for performance
            autoGainControl: false   // OFF for performance
        }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasPermission(true);
    } catch (err) {
      console.error("Camera access denied:", err);
      setHasPermission(false);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [cameraFacingMode]);

  const toggleCamera = () => {
    if (isRecording || countdown !== null) return;
    setCameraFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      onVideoReady(file);
    }
  };
  
  // 1. Initiate Countdown
  const handleStartSequence = () => {
    setCountdown(3);
    
    let count = 3;
    const interval = setInterval(() => {
        count--;
        if (count > 0) {
            setCountdown(count);
        } else {
            clearInterval(interval);
            setCountdown(null);
            startRecording();
        }
    }, 1000);
  };

  // 2. Actual Recording Start
  const startRecording = () => {
    if (streamRef.current) {
      chunksRef.current = [];
      try {
        // PERFORMANCE FIX: 
        // 1. Codec: Prioritize H.264 (MP4). This is Hardware Accelerated on phones = NO LAG.
        // 2. Bitrate: Cap at 2.5 Mbps. High bitrates choke the CPU causing stutter.
        let mimeType = '';
        
        if (MediaRecorder.isTypeSupported('video/mp4')) {
            mimeType = 'video/mp4'; // iOS / Modern Android (Best)
        } else if (MediaRecorder.isTypeSupported('video/webm;codecs=h264')) {
            mimeType = 'video/webm;codecs=h264'; // Android H.264 (Good)
        } else {
            mimeType = 'video/webm'; // Fallback
        }

        const options: MediaRecorderOptions = {
            mimeType: mimeType ? mimeType : undefined,
            videoBitsPerSecond: 2500000 // 2.5 Mbps (Perfect for 720p mobile)
        };
            
        mediaRecorderRef.current = new MediaRecorder(streamRef.current, options);
      } catch (e) {
        console.warn("MediaRecorder options failed, using default", e);
        mediaRecorderRef.current = new MediaRecorder(streamRef.current);
      }

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const rawMimeType = mediaRecorderRef.current?.mimeType || 'video/webm';
        const simpleMimeType = rawMimeType.split(';')[0]; 
        
        const videoBlob = new Blob(chunksRef.current, { type: simpleMimeType });
        
        // Determine extension
        let ext = 'webm';
        if (simpleMimeType.includes('mp4')) ext = 'mp4';
        else if (simpleMimeType.includes('quicktime')) ext = 'mov';
        
        const videoFile = new File([videoBlob], `recorded-video.${ext}`, { type: simpleMimeType });
        
        onVideoReady(videoFile);
      };
      
      mediaRecorderRef.current.start(); 
      
      setIsRecording(true);
      
      setRecordingDuration(0);
      timerIntervalRef.current = setInterval(() => {
          setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };
  
  const handleRecordClick = () => {
      if (isRecording) {
          handleStopRecording();
      } else {
          handleStartSequence();
      }
  };

  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!hasPermission) {
    return (
        <div className="fixed inset-0 z-[100] bg-gray-900 text-white flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-300">
            <div className="bg-red-500/20 p-6 rounded-full mb-6 animate-pulse">
                <Video size={48} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-bold mb-3">{t('camera_access_required')}</h2>
            <p className="text-gray-400 mb-8 max-w-xs leading-relaxed">
                {t('camera_access_desc')}
                <br/>
                <span className="text-sm mt-2 block text-gray-500">
                    يرجى السماح بالأذونات من إعدادات النظام للمتابعة.
                </span>
            </p>
            <div className="flex flex-col gap-3 w-full max-w-xs">
                <button 
                    onClick={startCamera} 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-900/20"
                >
                    {t('retry')}
                </button>
                <button 
                    onClick={onClose} 
                    className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 px-6 py-3.5 rounded-xl font-bold transition-colors"
                >
                    {t('cancel')}
                </button>
            </div>
        </div>
    );
  }

  const isBusy = isRecording || countdown !== null;

  return (
    <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col animate-in fade-in duration-300 h-[100dvh]">
      
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center pt-safe">
        {!isBusy && (
            <button onClick={onClose} className="p-2 bg-black/30 rounded-full backdrop-blur-md">
                <X size={24} />
            </button>
        )}

        {isRecording && (
            <div className="flex items-center gap-2 bg-red-600/80 px-4 py-1.5 rounded-full mx-auto backdrop-blur-md animate-in slide-in-from-top duration-300">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="font-bold text-sm">{t('recording')}</span>
                <span className="font-mono text-sm w-10 text-center">{formatTime(recordingDuration)}</span>
            </div>
        )}
      </div>

      {/* Main Video View */}
      <div className="flex-1 relative overflow-hidden bg-gray-900">
        <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover" 
        />
        
        {countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-30">
                <span className="text-[120px] font-black text-white drop-shadow-2xl animate-in zoom-in duration-300 key={countdown}">
                    {countdown}
                </span>
            </div>
        )}
      </div>
      
      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-6 pb-safe flex items-center justify-around bg-gradient-to-t from-black/50 to-transparent">
        
        <button 
            onClick={() => fileInputRef.current?.click()} 
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${isBusy ? 'opacity-0 pointer-events-none scale-50' : 'opacity-80 hover:opacity-100'}`}
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-black/40 backdrop-blur-md">
            <ImageIcon size={20} />
          </div>
        </button>
        <input type="file" ref={fileInputRef} className="hidden" accept="video/*" onChange={handleFileUpload} />

        <button 
          onClick={handleRecordClick}
          disabled={countdown !== null}
          className="relative transition-transform active:scale-95"
        >
          {isRecording ? (
             <div className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center">
                 <div className="w-8 h-8 bg-red-600 rounded-md animate-in zoom-in duration-200"></div>
             </div>
          ) : (
             <div className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center">
                 <div className="w-16 h-16 bg-white rounded-full"></div>
             </div>
          )}
        </button>

        <button 
            onClick={toggleCamera} 
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${isBusy ? 'opacity-0 pointer-events-none scale-50' : 'opacity-80 hover:opacity-100'}`}
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-black/40 backdrop-blur-md">
            <SwitchCamera size={20} />
          </div>
        </button>
      </div>
    </div>
  );
};

export default CreateVideoView;
