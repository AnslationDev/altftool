import React from "react";
import { motion } from "framer-motion";

export default function StatsDashboard({ gpaTrend, creditDist }) {
  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="bg-(--background) p-8 rounded-2xl border border-(--border) shadow-sm">
        <h4 className="text-xs font-black text-(--muted-foreground) uppercase tracking-[0.2em] mb-8">Academic Growth Trend</h4>
        <div className="flex items-end gap-4 h-48 px-2 border-b border-(--border) pb-1">
          {gpaTrend.map((val, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-3 group h-full justify-end">
              <div className="text-xs font-bold text-(--primary) opacity-0 group-hover:opacity-100 transition-all mb-1">
                {val}
              </div>
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: `${(val / 10) * 100}%` }}
                className="w-full max-w-[60px] bg-gradient-to-t from-(--primary) to-blue-400 rounded-t-xl relative transition-all shadow-lg shadow-blue-500/10 hover:shadow-blue-500/30"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-all rounded-t-xl"></div>
              </motion.div>
              <span className="text-xs font-black text-(--muted-foreground) mt-2">SEM {i+1}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-(--background) p-5 rounded-2xl border border-(--border) shadow-sm">
        <h4 className="text-[10px] font-black text-(--muted-foreground) uppercase tracking-widest mb-4">Credit Distribution</h4>
        <div className="space-y-4">
          {creditDist.map((item, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-bold gap-2">
                <span className="text-(--muted-foreground) truncate flex-1">{item.name}</span>
                <span className="shrink-0">{item.credits} Credits</span>
              </div>
              <div className="w-full h-1.5 bg-(--card) rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.credits / 30) * 100}%` }} // Max 30 credits for scale
                  className="h-full bg-blue-500"
                ></motion.div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
