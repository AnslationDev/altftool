"use-client";
import React, { useEffect } from "react";
import "./VideoPlayer.css";

const VideoPlayer = ({ videoId, onClose }) => {
  useEffect(() => {
    // Prevent scrolling when popup is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="video-player-overlay">
      <div className="video-player-container">
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
        <div className="video-wrapper">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="video-iframe"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;

// "use-client";

// import React, { useEffect } from "react";

// export default function VideoPlayer({ videoId, onClose }) {
//   useEffect(() => {
//     document.body.style.overflow = "hidden";
//     return () => {
//       document.body.style.overflow = "unset";
//     };
//   }, []);

//   return (
//     <div
//       className="
//         fixed inset-0 z-[1000]
//         bg-black/90
//         flex items-center justify-center
//         animate-fadeIn
//       "
//     >
//       <div
//         className="
//           relative w-[90%] max-w-[1200px]
//           bg-(--card) border border-(--border)
//           rounded-xl shadow-2xl
//           p-4 sm:p-6
//         "
//       >
//         {/* Close Button */}
//         <button
//           onClick={onClose}
//           className="
//             absolute top-3 right-3
//             w-10 h-10 sm:w-10 sm:h-10
//             bg-white/10 hover:bg-red-600
//             text-white
//             rounded-full
//             flex items-center justify-center
//             text-xl
//             transition-all duration-300
//             hover:rotate-90
//           "
//         >
//           ✕
//         </button>

//         {/* Video iframe wrapper */}
//         <div
//           className="
//             relative
//             w-full
//             pb-[56.25%]   /* 16:9 ratio */
//             bg-black
//             rounded-lg
//             overflow-hidden
//           "
//         >
//           <iframe
//             className="absolute inset-0 w-full h-full"
//             src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
//             title="YouTube video player"
//             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//             allowFullScreen
//           />
//         </div>
//       </div>
//     </div>
//   );
// }
