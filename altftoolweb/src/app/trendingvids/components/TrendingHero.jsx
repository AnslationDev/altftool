import ManagedImage from "@/components/ui/ManagedImage";
// import React, { useRef, useState, useEffect } from "react";
// import { Swiper, SwiperSlide } from "swiper/react";
// import "swiper/css";
// import "swiper/css/free-mode";
// import { FreeMode } from "swiper/modules";
// import { sliderImages } from "../data/banner";
// import { Clock, Play, X } from "lucide-react";

// export default function WatchPage() {
//   const [playingId, setPlayingId] = useState(null);
//   const [isMobile, setIsMobile] = useState(false);
//   const isPaused = useRef(false);
//   const translateX = useRef(0);
//   const rafId = useRef(null);
//   const wrapperRef = useRef(null);
//   const trackRef = useRef(null);
//   const speed = 2.5;

//   const duplicatedSlides = [...sliderImages, ...sliderImages];

//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 768);
//     };

//     checkMobile();
//     window.addEventListener("resize", checkMobile);

//     return () => window.removeEventListener("resize", checkMobile);
//   }, []);

//   useEffect(() => {
//     const track = trackRef.current;
//     if (!track) return;

//     const singleSetWidth = track.scrollWidth / 2;

//     const animate = () => {
//       if (!isPaused.current) {
//         translateX.current -= speed;

//         if (Math.abs(translateX.current) >= singleSetWidth) {
//           translateX.current = 0;
//         }

//         track.style.transform = `translate3d(${translateX.current}px, 0px, 0px)`;
//       }

//       rafId.current = requestAnimationFrame(animate);
//     };

//     rafId.current = requestAnimationFrame(animate);

//     return () => cancelAnimationFrame(rafId.current);
//   }, []);

//   const handlePlay = (id) => {
//     setPlayingId(id);
//     isPaused.current = true;

//     if (isMobile && cardRefs.current[id]) {
//       cardRefs.current[id].scrollIntoView({
//         behavior: "smooth",
//         inline: "center",
//         block: "nearest",
//       });
//     }
//   };

//   const closeVideo = () => {
//     setPlayingId(null);
//     isPaused.current = false;
//   };

//   const handleMouseEnter = () => {
//     isPaused.current = true;
//   };

//   const handleMouseLeave = () => {
//     setPlayingId(null);
//     isPaused.current = false;
//   };

//   return (
//     <div className="">
//       <div className="sm:mt-14 flex flex-col items-center text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
//         <h1 className=" text-(--primary) text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold leading-tight">
//           Discover Trending Videos Instantly
//         </h1>
//         <p className="section-subtitle  text-sm sm:text-base md:text-xl ">
//           Stay updated with the most popular videos across categories, regions,
//           and topics — all in one place.
//         </p>
//       </div>

//       <div
//         className=" relative overflow-hidden rounded-lg mt-1 md:[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
//         onMouseEnter={handleMouseEnter}
//         onMouseLeave={handleMouseLeave}
//         ref={wrapperRef}
//       >
//         <div
//           ref={trackRef}
//           className="flex gap-5 will-change-transform"
//           style={{ width: "max-content" }}
//         >
//           {duplicatedSlides.map((item, index) => {
//             const id = `${item.id}-${index}`;
//             const isPlaying = playingId === id;

//             return (
//               <div
//                 key={id}
//                 className="relative rounded-xl overflow-hidden group cursor-pointer flex-shrink-0"
//                 style={{ width: "296px", aspectRatio: "296/405" }}
//                 onClick={() => {
//                   if (!isPlaying) {
//                     setPlayingId(id);
//                     isPaused.current = true;
//                   }
//                 }}
//               >
//                 {isPlaying ? (
//                   <>
//                     <video
//                       src={item.v_url}
//                       autoPlay
//                       controls={!isMobile}
//                       playsInline
//                       className="w-full h-full object-cover"
//                     />

//                     {/* CLOSE BUTTON */}
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         closeVideo();
//                       }}
//                       className="absolute top-2 right-2 bg-gray-200 text-white rounded-full p-1"
//                     >
//                       <X size={20} />
//                     </button>
//                   </>
//                 ) : (
//                   <>
//                     <ManagedImage
//                       src={item.image}
//                       alt=""
//                       className="w-full h-full object-cover"
//                     />

//                     {isMobile && (
//                       <div className="absolute inset-0 flex items-center justify-center">
//                         <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200">
//                           <Play size={20} />
//                         </div>
//                       </div>
//                     )}

//                     {/* DESKTOP HOVER UI */}
//                     {!isMobile && (
//                       <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-3">
//                         <p className="text-white text-md line-clamp-2 mb-8">
//                           {item.description}
//                         </p>

//                         <div className="flex justify-between items-center mt-2 mb-5">
//                           <span className="text-sm flex gap-3 items-center text-gray-300">
//                             <Clock size={16} /> {item.time}
//                           </span>

//                           <button className="flex items-center gap-2 bg-black/50 text-white w-18 h-6 text-sm rounded-full justify-center">
//                             <Play size={16} /> play
//                           </button>
//                         </div>
//                       </div>
//                     )}
//                   </>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }

// import React, { useRef, useState, useEffect, useCallback } from "react";
// import { Clock, Play, X } from "lucide-react";
// import { sliderImages } from "../data/banner";

// export default function WatchPage() {
//   const [playingId, setPlayingId] = useState(null);
//   const [isMobile, setIsMobile] = useState(false);
//   const isPaused = useRef(false);
//   const translateX = useRef(0);
//   const rafId = useRef(null);
//   const trackRef = useRef(null);
//   const cardRefs = useRef({});
//   const speed = 2.5;

//   const duplicatedSlides = [...sliderImages, ...sliderImages];

//   useEffect(() => {
//     const checkMobile = () => setIsMobile(window.innerWidth < 768);
//     checkMobile();
//     window.addEventListener("resize", checkMobile);
//     return () => window.removeEventListener("resize", checkMobile);
//   }, []);

//   useEffect(() => {
//     const track = trackRef.current;
//     if (!track) return;
//     const singleSetWidth = track.scrollWidth / 2;

//     const animate = () => {
//       if (!isPaused.current) {
//         translateX.current -= speed;
//         if (Math.abs(translateX.current) >= singleSetWidth) {
//           translateX.current = 0;
//         }
//         track.style.transform = `translate3d(${translateX.current}px, 0px, 0px)`;
//       }
//       rafId.current = requestAnimationFrame(animate);
//     };

//     rafId.current = requestAnimationFrame(animate);
//     return () => cancelAnimationFrame(rafId.current);
//   }, []);

//   useEffect(() => {
//     if (playingId && isMobile) {
//       document.body.style.overflow = "hidden";
//     } else {
//       document.body.style.overflow = "";
//     }

//     return () => {
//       document.body.style.overflow = "";
//     };
//   }, [playingId, isMobile]);

//   const handlePlay = (id) => {
//     setPlayingId(id);
//     isPaused.current = true;

//     if (isMobile && cardRefs.current[id]) {
//       cardRefs.current[id].scrollIntoView({
//         behavior: "smooth",
//         inline: "center",
//         block: "nearest",
//       });
//     }
//   };

//   const closeVideo = () => {
//     setPlayingId(null);
//     isPaused.current = false;
//   };

//   return (
//     <div>
//       <div className=" mt-5 sm:mt-14 flex flex-col items-center text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
//         <h1 className="text-(--primary) text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold leading-tight">
//           Discover Trending Videos Instantly
//         </h1>
//         <p className="section-subtitle text-sm sm:text-base md:text-xl">
//           Stay updated with the most popular videos across categories, regions,
//           and topics — all in one place.
//         </p>
//       </div>

//       {playingId && isMobile && (
//         <div
//           className="fixed inset-0 z-50 flex items-center justify-center"
//           style={{
//             backgroundColor: "rgba(215, 206, 206, 0.09)",
//             backdropFilter: "blur(4px)",
//             touchAction: "none",
//             overscrollBehavior: "contain",
//           }}
//         >
//           <button
//             onClick={closeVideo}
//             className="absolute top-4 right-4 bg-black/20 text-white rounded-full p-2 z-10"
//           >
//             <X size={22} />
//           </button>

//           <div
//             className="rounded-xl overflow-hidden"
//             style={{ width: "90vw", aspectRatio: "296/405" }}
//           >
//             {duplicatedSlides.map((item, index) => {
//               const id = `${item.id}-${index}`;
//               if (id !== playingId) return null;
//               return (
//                 <video
//                   key={id}
//                   src={item.v_url}
//                   autoPlay
//                   controls
//                   playsInline
//                   className="w-full h-full object-cover"
//                   onEnded={closeVideo}
//                 />
//               );
//             })}
//           </div>
//         </div>
//       )}

//       <div className="relative overflow-hidden rounded-lg mt-1 md:[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
//         <div
//           ref={trackRef}
//           className="flex gap-5 will-change-transform"
//           style={{ width: "max-content" }}
//         >
//           {duplicatedSlides.map((item, index) => {
//             const id = `${item.id}-${index}`;
//             const isPlaying = playingId === id;

//             return (
//               <div
//                 key={id}
//                 ref={(el) => (cardRefs.current[id] = el)}
//                 className="relative rounded-xl overflow-hidden group cursor-pointer flex-shrink-0"
//                 style={{ width: "296px", aspectRatio: "296/405" }}
//                 onClick={() => {
//                   if (!isPlaying) handlePlay(id);
//                 }}
//               >
//                 <ManagedImage
//                   src={item.image}
//                   alt=""
//                   className="w-full h-full object-cover"
//                 />

//                 {isMobile && (
//                   <div className="absolute inset-0 flex items-center justify-center">
//                     <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200/80">
//                       <Play size={20} className="text-(--foreground)" />
//                     </div>
//                   </div>
//                 )}

//                 {!isMobile && (
//                   <>
//                     {isPlaying ? (
//                       <>
//                         <video
//                           src={item.v_url}
//                           autoPlay
//                           controls
//                           playsInline
//                           className="absolute inset-0 w-full h-full object-cover"
//                           onEnded={closeVideo}
//                         />
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             closeVideo();
//                           }}
//                           className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 z-10"
//                         >
//                           <X size={20} />
//                         </button>
//                       </>
//                     ) : (
//                       <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-3">
//                         <p className="text-white text-md line-clamp-2 mb-8">
//                           {item.description}
//                         </p>
//                         <div className="flex justify-between items-center mt-2 mb-5">
//                           <span className="text-sm flex gap-3 items-center text-gray-300">
//                             <Clock size={16} /> {item.time}
//                           </span>
//                           <button className="flex items-center gap-2 bg-black/50 text-white w-18 h-6 text-sm rounded-full justify-center">
//                             <Play size={16} /> play
//                           </button>
//                         </div>
//                       </div>
//                     )}
//                   </>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useRef, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import { FreeMode } from "swiper/modules";
import { sliderImages } from "../data/banner";
import { Clock, Play, X } from "lucide-react";

export default function WatchPage() {
  const [playingId, setPlayingId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const isPaused = useRef(false);
  const translateX = useRef(0);
  const rafId = useRef(null);
  const wrapperRef = useRef(null);
  const trackRef = useRef(null);
  const cardRefs = useRef({});
  const speed = 2.5;

  const duplicatedSlides = [...sliderImages, ...sliderImages];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const singleSetWidth = track.scrollWidth / 2;

    const animate = () => {
      if (!isPaused.current) {
        translateX.current -= speed;
        if (Math.abs(translateX.current) >= singleSetWidth) {
          translateX.current = 0;
        }
        track.style.transform = `translate3d(${translateX.current}px, 0px, 0px)`;
      }
      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId.current);
  }, []);

  useEffect(() => {
    if (playingId && isMobile) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [playingId, isMobile]);

  const handleMouseEnter = () => {
    isPaused.current = true;
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setPlayingId(null);
    }
    isPaused.current = false;
  };

  const handlePlay = (id) => {
    setPlayingId(id);
    isPaused.current = true;

    if (isMobile && cardRefs.current[id]) {
      cardRefs.current[id].scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  };

  const closeVideo = () => {
    setPlayingId(null);
    isPaused.current = false;
  };

  return (
    <div className="">
      <div className=" mt-6 sm:mt-14 flex flex-col items-center text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <h1 className="text-(--primary) text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold leading-tight">
          Discover Trending Videos Instantly
        </h1>
        <p className="section-subtitle text-sm sm:text-base md:text-xl">
          Stay updated with the most popular videos across categories, regions,
          and topics — all in one place.
        </p>
      </div>

      {playingId && isMobile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            backgroundColor: "rgba(186, 182, 182, 0.09)",
            backdropFilter: "blur(4px)",
            touchAction: "none",
            overscrollBehavior: "contain",
          }}
        >
          <button
            onClick={closeVideo}
            className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-1 z-10"
          >
            <X size={20} />
          </button>

          <div
            className="rounded-xl overflow-hidden"
            style={{ width: "90vw", aspectRatio: "296/405" }}
          >
            {duplicatedSlides.map((item, index) => {
              const id = `${item.id}-${index}`;
              if (id !== playingId) return null;
              return (
                <video
                  key={id}
                  src={item.v_url}
                  autoPlay
                  controls={!isMobile}
                  playsInline
                  className="w-full h-full object-cover"
                  onEnded={closeVideo}
                />
              );
            })}
          </div>
        </div>
      )}

      <div
        className="relative overflow-hidden rounded-lg mt-1 md:[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        ref={wrapperRef}
      >
        <div
          ref={trackRef}
          className="flex gap-5 will-change-transform"
          style={{ width: "max-content" }}
        >
          {duplicatedSlides.map((item, index) => {
            const id = `${item.id}-${index}`;
            const isPlaying = playingId === id;

            return (
              <div
                key={id}
                ref={(el) => (cardRefs.current[id] = el)}
                className="relative rounded-xl overflow-hidden group cursor-pointer flex-shrink-0"
                style={{ width: "296px", aspectRatio: "296/405" }}
                onClick={() => {
                  if (!isPlaying) handlePlay(id);
                }}
              >
                <ManagedImage
                  src={item.image}
                  alt=""
                  className="w-full h-full object-cover  group-hover:scale-105"
                />

                {isMobile && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200/80">
                      <Play size={20} />
                    </div>
                  </div>
                )}

                {!isMobile && (
                  <>
                    {isPlaying ? (
                      <>
                        <video
                          src={item.v_url}
                          autoPlay
                          controls
                          playsInline
                          className="absolute inset-0 w-full h-full object-cover"
                          onEnded={closeVideo}
                        />
                        {/* <button
                          onClick={(e) => {
                            e.stopPropagation();
                            closeVideo();
                          }}
                          className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 z-10"
                        >
                          <X size={20} />
                        </button> */}
                      </>
                    ) : (
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-3">
                        <p className="text-white text-md line-clamp-2 mb-8">
                          {item.description}
                        </p>
                        <div className="flex justify-between items-center mt-2 mb-5">
                          <span className="text-sm flex gap-3 items-center text-gray-300">
                            <Clock size={16} /> {item.time}
                          </span>
                          <button className="flex items-center gap-2 bg-black/50 text-white w-18 h-6 text-sm rounded-full justify-center cursor-pointer">
                            <Play size={16} /> play
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
