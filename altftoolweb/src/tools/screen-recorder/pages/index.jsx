import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, 
  Square, 
  Pause, 
  Play, 
  Download, 
  Trash2, 
  Monitor, 
  Settings,
  Clock,
  Film
} from 'lucide-react';
import Description from "../components/Description";
export default function ToolHome() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [videoURL, setVideoURL] = useState(null);
  const [stream, setStream] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    videoQuality: 'high',
    includeAudio: true,
    frameRate: 30
  });

  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const videoPreviewRef = useRef(null);
 
  const elapsedRef = useRef(0);
 
  const segmentStartRef = useRef(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      clearInterval(timerRef.current);
    };
  }, [stream]);

  // ── Timer helpers ──────────────────────────────────────────────────────────

   useEffect(() => {
    if (!isRecording || isPaused) return;

    segmentStartRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const seconds =
        elapsedRef.current +
        Math.floor((Date.now() - segmentStartRef.current) / 1000);

      setRecordingTime(seconds);
    }, 1000);

    return () => {
      clearInterval(timerRef.current);
      timerRef.current = null;

      if (segmentStartRef.current) {
        elapsedRef.current += Math.floor(
          (Date.now() - segmentStartRef.current) / 1000
        );
        segmentStartRef.current = null;
      }
    };
  }, [isRecording, isPaused]);


  // ── Recording controls 


  const startRecording = async () => {
    try {
      elapsedRef.current = 0;
      setRecordingTime(0);

      const constraints = {
        video: {
          displaySurface: 'monitor',
          frameRate: settings.frameRate
        },
        audio: settings.includeAudio
      };

      const captureStream = await navigator.mediaDevices.getDisplayMedia(constraints);
      setStream(captureStream);

      const options = {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: settings.videoQuality === 'high' ? 2500000 : 1000000
      };

      const mediaRecorder = new MediaRecorder(captureStream, options);
      mediaRecorderRef.current = mediaRecorder;

      const chunks = [];
      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setVideoURL(URL.createObjectURL(blob));
        setRecordedChunks(chunks);
        captureStream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);

      captureStream.getVideoTracks()[0].onended = stopRecording;
    } catch (err) {
      alert('Screen recording permission denied');
    }
  };

  const pauseRecording = () => {
    if (!mediaRecorderRef.current) return;

    if (isPaused) {
      mediaRecorderRef.current.resume();
    } else {
      mediaRecorderRef.current.pause();
    }

    setIsPaused(prev => !prev);
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;

    mediaRecorderRef.current.stop();
    setIsRecording(false);
    setIsPaused(false);
  };


  // ── Playback helpers 

  const downloadRecording = () => {
    if (videoURL) {
      const a = document.createElement('a');
      a.href = videoURL;
      a.download = `screen-recording-${new Date().getTime()}.webm`;
      a.click();
    }
  };

  const deleteRecording = () => {
    setVideoURL(null);
    setRecordedChunks([]);
    setRecordingTime(0);
    if (videoPreviewRef.current) {
      videoPreviewRef.current.src = '';
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

 

  return (
    // <div className="min-h-screen bg-(--background) text-(--foreground) flex items-center justify-center p-4">
    //   <div className="w-full max-w-4xl">
    
    //     <motion.div
    //       initial={{ opacity: 0, y: -20 }}
    //       animate={{ opacity: 1, y: 0 }}
    //       className="text-center mb-8"
    //     >
    //       <div className="flex items-center justify-center gap-3 mb-2">
    //         <Film className="w-10 h-10 text-(--primary)" />
    //         <h1 className="text-4xl font-bold text-(--primary)">Screen Recorder</h1>
    //       </div>
    //       <p className="text-(--foreground)">Capture your screen with ease</p>
    //     </motion.div>

       
    //     <motion.div
    //       initial={{ opacity: 0, scale: 0.95 }}
    //       animate={{ opacity: 1, scale: 1 }}
    //       className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20"
    //     >
      
    //       <div className="mb-6 text-(--foreground)">
    //         <div className="flex items-center justify-between mb-4">
    //           <div className="flex items-center gap-3">
    //             <div className={`w-4 h-4 rounded-full ${isRecording ? (isPaused ? 'bg-yellow-400' : 'bg-red-500 animate-pulse') : 'bg-gray-500'}`} />
    //             <span className="text-(--foreground) font-medium">
    //               {isRecording ? (isPaused ? 'Paused' : 'Recording') : 'Ready'}
    //             </span>
    //           </div>
    //           <motion.button
    //             whileHover={{ scale: 1.05 }}
    //             whileTap={{ scale: 0.95 }}
    //             onClick={() => setShowSettings(!showSettings)}
    //             className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
    //           >
    //             <Settings className="w-5 h-5 text-(--foreground)" />
    //           </motion.button>
    //         </div>

    
    //         <div className="flex items-center justify-center gap-2 bg-(--background) border border-(--border) rounded-sm py-4">
    //           <Clock className="w-5 h-5 text-(--primary)" />
    //           <span className="text-3xl font-mono font-bold text-(--foreground)">
    //             {formatTime(recordingTime)}
    //           </span>
    //         </div>
    //       </div>


    //       <AnimatePresence>
    //         {showSettings && (
    //           <motion.div
    //             initial={{ opacity: 0, height: 0 }}
    //             animate={{ opacity: 1, height: 'auto' }}
    //             exit={{ opacity: 0, height: 0 }}
    //             className="mb-6 overflow-hidden"
    //           >
    //             <div className="bg-(--background) text-(--foreground) border border-(--border) rounded-xl p-4 space-y-3">
    //               <div className="flex items-center justify-between">
    //                 <span className="text-(--foreground)">Video Quality</span>
    //                 <select
    //                   value={settings.videoQuality}
    //                   onChange={(e) => setSettings({ ...settings, videoQuality: e.target.value })}
    //                   className="bg-(--background) text-(--foreground) rounded-lg px-3 py-1 border border-(--border) cursor-pointer"
    //                   disabled={isRecording}
    //                 >
    //                   <option value="standard">Standard</option>
    //                   <option value="high">High</option>
    //                 </select>
    //               </div>
    //               <div className="flex items-center justify-between">
    //                 <span className="text-(--foreground)">Include Audio</span>
    //                 <button
    //                   onClick={() => setSettings({ ...settings, includeAudio: !settings.includeAudio })}
    //                   disabled={isRecording}
    //                   className={`w-12 h-6 rounded-full transition-colors ${settings.includeAudio ? 'bg-(--primary)' : 'bg-gray-600'}`}
    //                 >
    //                   <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.includeAudio ? 'translate-x-6' : 'translate-x-1'}`} />
    //                 </button>
    //               </div>
    //               <div className="flex items-center justify-between">
    //                 <span className="text-(--foreground)">Frame Rate</span>
    //                 <select
    //                   value={settings.frameRate}
    //                   onChange={(e) => setSettings({ ...settings, frameRate: Number(e.target.value) })}
    //                   className="bg-(--background) text-(--foreground) cursor-pointer rounded-lg px-3 py-1 border border-(--border)"
    //                   disabled={isRecording}
    //                 >
    //                   <option value={24}>24 fps</option>
    //                   <option value={30}>30 fps</option>
    //                   <option value={60}>60 fps</option>
    //                 </select>
    //               </div>
    //             </div>
    //           </motion.div>
    //         )}
    //       </AnimatePresence>

      
    //       <div className="flex gap-4 justify-center mb-6">
    //         {!isRecording ? (
    //           <motion.button
    //             whileHover={{ scale: 1.05 }}
    //             whileTap={{ scale: 0.95 }}
    //             onClick={startRecording}
    //             className="flex items-center gap-2 bg-(--primary) cursor-pointer text-white px-8 py-4 rounded-xl font-semibold shadow-lg"
    //           >
    //             <Video className="w-5 h-5" />
    //             Start Recording
    //           </motion.button>
    //         ) : (
    //           <>
    //             <motion.button
    //               whileHover={{ scale: 1.05 }}
    //               whileTap={{ scale: 0.95 }}
    //               onClick={pauseRecording}
    //               className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-600 text-white px-6 py-4 rounded-xl font-semibold shadow-lg"
    //             >
    //               {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
    //               {isPaused ? 'Resume' : 'Pause'}
    //             </motion.button>
    //             <motion.button
    //               whileHover={{ scale: 1.05 }}
    //               whileTap={{ scale: 0.95 }}
    //               onClick={stopRecording}
    //               className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-6 py-4 rounded-xl font-semibold shadow-lg"
    //             >
    //               <Square className="w-5 h-5" />
    //               Stop
    //             </motion.button>
    //           </>
    //         )}
    //       </div>

    
    //       <AnimatePresence>
    //         {videoURL && (
    //           <motion.div
    //             initial={{ opacity: 0, y: 20 }}
    //             animate={{ opacity: 1, y: 0 }}
    //             exit={{ opacity: 0, y: 20 }}
    //             className="space-y-4"
    //           >
    //             <div className="bg-black rounded-xl overflow-hidden">
    //               <video
    //                 ref={videoPreviewRef}
    //                 src={videoURL}
    //                 controls
    //                 className="w-full"
    //               />
    //             </div>
    //             <div className="flex gap-4 justify-center">
    //               <motion.button
    //                 whileHover={{ scale: 1.05 }}
    //                 whileTap={{ scale: 0.95 }}
    //                 onClick={downloadRecording}
    //                 className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
    //               >
    //                 <Download className="w-5 h-5" />
    //                 Download
    //               </motion.button>
    //               <motion.button
    //                 whileHover={{ scale: 1.05 }}
    //                 whileTap={{ scale: 0.95 }}
    //                 onClick={deleteRecording}
    //                 className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
    //               >
    //                 <Trash2 className="w-5 h-5" />
    //                 Delete
    //               </motion.button>
    //             </div>
    //           </motion.div>
    //         )}
    //       </AnimatePresence>

       
    //       {!isRecording && !videoURL && (
    //         <motion.div
    //           initial={{ opacity: 0 }}
    //           animate={{ opacity: 1 }}
    //           className="mt-6 bg-(--background) border rounded-xl p-4"
    //         >
    //           <div className="flex items-start gap-3">
    //             <Monitor className="w-5 h-5 text-(--foreground) mt-0.5" />
    //             <div className="text-sm">
    //               <p className="font-semibold mb-1 text-(--foreground)">Ready to record</p>
    //               <p className="text-(--foreground)">Click "Start Recording" and select which screen or window you want to capture. Your browser will ask for permission.</p>
    //             </div>
    //           </div>
    //         </motion.div>
    //       )}
    //     </motion.div>
    //   </div>
    // </div>

     <div className="min-h-screen bg-(--background) text-(--foreground) flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <Film className="w-10 h-10 text-(--primary)" />
            <h1 className="text-4xl font-bold text-(--primary)">Screen Recorder</h1>
          </div>
          <p className="text-(--foreground)">Capture your screen with ease</p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20"
        >
          {/* Recording Status */}
          <div className="mb-6 text-(--foreground) ">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4  rounded-full ${isRecording ? (isPaused ? 'bg-yellow-400' : 'bg-red-500 animate-pulse') : 'bg-gray-500'}`} />
                <span className="text-(--foreground) font-medium">
                  {isRecording ? (isPaused ? 'Paused' : 'Recording') : 'Ready'}
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Settings className="w-5 h-5 text-(foreground)" />
              </motion.button>
            </div>

            {/* Timer */}
            <div className="flex items-center justify-center gap-2 bg-(--background) border border(--border)  rounded-sm py-4">
              <Clock className="w-5 h-5 text-(--primary)" />
              <span className="text-3xl font-mono font-bold text-(--foreground)">
                {formatTime(recordingTime)}
              </span>
            </div>
          </div>

          {/* Settings Panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="bg-(--background) text-(--foreground) border border(--border) rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-(--foreground)">Video Quality</span>
                    <select
                      value={settings.videoQuality}
                      onChange={(e) => setSettings({ ...settings, videoQuality: e.target.value })}
                      className="bg-(--background) text-(--foreground) rounded-lg px-3 py-1 border border-(--border) cursor-pointer"
                      disabled={isRecording}
                    >
                      <option value="standard">Standard</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-(--foreground)">Include Audio</span>
                    <button
                      onClick={() => setSettings({ ...settings, includeAudio: !settings.includeAudio })}
                      disabled={isRecording}
                      className={`w-12 h-6 rounded-full transition-colors ${settings.includeAudio ? 'bg-(--primary)' : 'bg-gray-600'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.includeAudio ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-(--foreground)">Frame Rate</span>
                    <select
                      value={settings.frameRate}
                      onChange={(e) => setSettings({ ...settings, frameRate: Number(e.target.value) })}
                      className="bg-(--background) text-(--foreground) cursor-pointer rounded-lg px-3 py-1 border border-(--border)"
                      disabled={isRecording}
                    >
                      <option value={24}>24 fps</option>
                      <option value={30}>30 fps</option>
                      <option value={60}>60 fps</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Control Buttons */}
          <div className="flex gap-4 justify-center mb-6">
            {!isRecording ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startRecording}
                className="flex items-center gap-2 bg-(--primary) cursor-pointer text-white px-8 py-4 rounded-xl font-semibold shadow-lg"
              >
                <Video className="w-5 h-5" />
                Start Recording
              </motion.button>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={pauseRecording}
                  className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-4 rounded-xl font-semibold shadow-lg"
                >
                  {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                  {isPaused ? 'Resume' : 'Pause'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={stopRecording}
                  className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-6 py-4 rounded-xl font-semibold shadow-lg"
                >
                  <Square className="w-5 h-5" />
                  Stop
                </motion.button>
              </>
            )}
          </div>

          {/* Video Preview */}
          <AnimatePresence>
            {videoURL && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="space-y-4"
              >
                <div className="bg-black rounded-xl overflow-hidden">
                  <video
                    ref={videoPreviewRef}
                    src={videoURL}
                    controls
                    className="w-full"
                  />
                </div>
                <div className="flex gap-4 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={downloadRecording}
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
                  >
                    <Download className="w-5 h-5" />
                    Download
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={deleteRecording}
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                    Delete
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Info Banner */}
          {!isRecording && !videoURL && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 bg-(--background) border  rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <Monitor className="w-5 h-5 text-(--foreground)mt-0.5" />
                <div className="text-sm text-purple-100">
                  <p className="font-semibold mb-1 text-(--foreground)">Ready to record</p>
                  <p className="text-(--foreground)">Click "Start Recording" and select which screen or window you want to capture. Your browser will ask for permission.</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
        <Description />

      </div>
    </div>
  );
}