import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg = null;

/**
 * Loads and initializes the FFmpeg instance.
 * Using UMD build from unpkg for widest compatibility.
 */
export const loadFFmpeg = async () => {
  if (ffmpeg) return ffmpeg;
  
  ffmpeg = new FFmpeg();
  
  // Load ffmpeg.wasm
  // Using 0.12.6 core as it's stable with @ffmpeg/ffmpeg 0.12.x
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
  
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });
  
  return ffmpeg;
};

/**
 * Compresses a video file using FFmpeg.
 * 
 * @param {File} file - The raw video file to compress
 * @param {Function} onProgress - Callback for compression progress (0-100)
 * @returns {Promise<Blob>} - The compressed video as a Blob
 */
export const compressVideo = async (file, onProgress) => {
  const ffmpegInstance = await loadFFmpeg();
  const inputName = `input_${Date.now()}.mp4`;
  const outputName = `output_${Date.now()}.mp4`;
  
  const progressHandler = ({ progress }) => {
    if (onProgress) {
      // progress is a float between 0 and 1
      onProgress(Math.round(progress * 100));
    }
  };

  ffmpegInstance.on('progress', progressHandler);
  
  try {
    // Write the file to FFmpeg's virtual file system
    await ffmpegInstance.writeFile(inputName, await fetchFile(file));
    
    // Execute compression command
    // -vcodec libx264: H.264 video codec
    // -crf 23: Constant Rate Factor (18-28 is good range, 23 is default/balanced)
    // -preset medium: Compression speed/ratio balance
    // -acodec aac: AAC audio codec
    await ffmpegInstance.exec([
      '-i', inputName,
      '-vcodec', 'libx264',
      '-crf', '23',
      '-preset', 'medium',
      '-acodec', 'aac',
      outputName
    ]);
    
    // Read the output file
    const data = await ffmpegInstance.readFile(outputName);
    
    // Clean up virtual files
    await ffmpegInstance.deleteFile(inputName);
    await ffmpegInstance.deleteFile(outputName);
    
    return new Blob([data.buffer], { type: 'video/mp4' });
  } catch (error) {
    console.error('[VideoCompressionService] Compression failed:', error);
    throw error;
  } finally {
    ffmpegInstance.off('progress', progressHandler);
  }
};

/**
 * Helper to get video duration
 */
export const getVideoMetadata = (file) => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      resolve({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight
      });
    };
    video.src = URL.createObjectURL(file);
  });
};
