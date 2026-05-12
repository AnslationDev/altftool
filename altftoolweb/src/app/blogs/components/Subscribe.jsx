// import Image from "next/image";
// import { Check } from "lucide-react";

// export default function Subscribe() {
//   return (
//     <section className="section mb-12">
//       <div className="flex flex-col lg:flex-row bg-(--section-highlight) rounded-2xl overflow-hidden">
//         <div className="relative w-full lg:w-1/2 h-[240px] sm:h-[320px] md:h-[380px] lg:h-auto min-h-[300px]">
//           <Image
//             src="/subscribe.png"
//             alt="Subscribe"
//             fill
//             priority
//             className="object-cover object-left"
//             sizes="(max-width: 1024px) 100vw, 50vw"
//           />
//         </div>

//         <div
//           className="w-full lg:w-1/2 flex flex-col justify-center
//                         p-6 sm:p-8 md:p-10 lg:p-12"
//         >
//           <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-4">
//             Stay Updated
//           </h1>

//           {/* Subtitle */}
//           <p className="section-subtitle !mx-0 text-sm sm:text-base md:text-lg">
//             Curated Articles, Tool Updates, And
//             <br className="hidden sm:block" />
//             Productivity Strategies Straight To Your Inbox
//           </p>

//           <form className="flex flex-col  gap-4 mt-6 max-w-xl w-full">
//             <input
//               type="email"
//               placeholder="Enter your email for deal alerts"
//               className="flex-1 rounded-full border border-blue-400
//                          bg-transparent px-5 py-4 outline-none
//                          text-sm sm:text-base"
//             />

//             <button
//               type="submit"
//               className="bg-blue-600 text-white rounded-full
//                          px-8 py-4 font-medium
//                          hover:brightness-110 transition
//                          whitespace-nowrap"
//             >
//               Subscribe
//             </button>
//           </form>

//           <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 mt-6 text-sm">
//             <p className="flex items-center gap-2 text-(--foreground)">
//               <span
//                 className="flex h-5 w-5 rounded-full bg-(--primary)
//                                items-center justify-center shrink-0"
//               >
//                 <Check size={14} strokeWidth={3} className="text-white" />
//               </span>
//               Weekly curated deals
//             </p>

//             <p className="flex items-center gap-2 text-(--foreground)">
//               <span
//                 className="flex h-5 w-5 rounded-full bg-(--primary)
//                                items-center justify-center shrink-0"
//               >
//                 <Check size={14} strokeWidth={3} className="text-white" />
//               </span>
//               No spam, unsubscribe anytime
//             </p>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import { toast } from "react-hot-toast";

import { Toaster } from "react-hot-toast";

export default function Subscribe() {
  const handleSubscribe = (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    toast.success("yehh!! you have subscribed to our blogs page 🎉");

    e.currentTarget.reset();
  };

  return (
    <div className="section mb-12">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#2563eb",
            color: "#fff",
            fontWeight: "500",
            padding: "8px 14px",
            borderRadius: "5px",
          },
        }}
      />

      <div className="flex flex-col lg:flex-row bg-(--section-highlight) rounded-2xl overflow-hidden">
        <div className="relative w-full lg:w-1/2 h-[240px] sm:h-[320px] md:h-[380px] lg:h-auto min-h-[300px]">
          <Image
            src="/subscribe.png"
            alt="Subscribe"
            fill
            priority
            className="object-cover object-left"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        <div className="w-full lg:w-1/2 flex flex-col justify-center p-6 sm:p-8 md:p-10 lg:p-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-4">
            Stay Updated
          </h1>

          <p className="section-subtitle !mx-0 text-sm sm:text-base md:text-lg">
            Curated Articles, Tool Updates, And
            <br className="hidden sm:block" />
            Productivity Strategies Straight To Your Inbox
          </p>

          <form
            onSubmit={handleSubscribe}
            className="flex flex-col gap-4 mt-6 max-w-xl w-full"
          >
            <input
              name="email"
              type="email"
              placeholder="Enter your email for deal alerts"
              className="flex-1 rounded-full border border-blue-400
                         bg-transparent px-5 py-4 outline-none
                         text-sm sm:text-base"
            />

            <button
              type="submit"
              className="bg-blue-600 text-white rounded-full
                         px-8 py-4 font-medium
                         hover:brightness-110 transition
                         whitespace-nowrap cursor-pointer"
            >
              Subscribe
            </button>
          </form>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 mt-6 text-sm">
            <p className="flex items-center gap-2 text-(--foreground)">
              <span className="flex h-5 w-5 rounded-full bg-(--primary) items-center justify-center shrink-0">
                <Check size={14} strokeWidth={3} className="text-white" />
              </span>
              Weekly curated deals
            </p>

            <p className="flex items-center gap-2 text-(--foreground)">
              <span className="flex h-5 w-5 rounded-full bg-(--primary) items-center justify-center shrink-0">
                <Check size={14} strokeWidth={3} className="text-white" />
              </span>
              No spam, unsubscribe anytime
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
