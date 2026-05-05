// import {
//   Clock,
//   Target,
//   Zap,
//   Coffee,
//   Hourglass,
// } from "lucide-react";

// export default function Result({ data }) {
//   if (!data) return null;

//   const stats = [
//     { label: "Total Time", value: `${data.totalMinutes} min`, icon: Clock },
//     { label: "Focus Sessions", value: data.focusSessions, icon: Target },
//     { label: "Focus Duration", value: `${data.focusTime} min`, icon: Zap },
//     { label: "Break Duration", value: `${data.breakTime} min`, icon: Coffee },
//     { label: "Remaining Time", value: `${data.remainingTime} min`, icon: Hourglass },
//   ];

//   return (
//     <div className="mt-6">
//       <p className="font-bold text-[1.1rem] text-[var(--foreground)] mb-3.5">
//         📊 Your Focus Plan
//       </p>

//       <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(140px,1fr))]">
//         {stats.map((stat) => {
//           const Icon = stat.icon;

//           return (
//             <div
//               key={stat.label}
//               className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-4 text-center"
//             >
//               <div className="flex justify-center mb-1.5">
//                 <Icon
//                   size={22}
//                   className="text-[var(--muted-foreground)]"
//                 />
//               </div>

//               <p className="font-extrabold text-[1.4rem] text-[var(--primary)] mb-1">
//                 {stat.value}
//               </p>

//               <p className="text-xs text-[var(--muted-foreground)] m-0">
//                 {stat.label}
//               </p>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }