import React from "react";
import { Utensils, Scale, Droplets, Thermometer, History, Info, ArrowRightLeft, Trash2, Coffee, Wheat } from "lucide-react";

const UnitGuide = () => {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm w-full h-full">
      <h3 className="text-sm font-semibold text-primary flex items-center gap-2 mb-4">
        <Wheat className="h-4 w-4" /> Quick Kitchen Equivalents
      </h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between border-b border-border pb-2">
          <span className="font-bold text-foreground">1 cup all-purpose flour</span>
          <span className="text-primary font-mono">120g / 4.2 oz</span>
        </div>
        <div className="flex justify-between border-b border-border pb-2">
          <span className="font-bold text-foreground">1 cup granulated sugar</span>
          <span className="text-primary font-mono">200g / 7 oz</span>
        </div>
        <div className="flex justify-between border-b border-border pb-2">
          <span className="font-bold text-foreground">1 cup brown sugar (packed)</span>
          <span className="text-primary font-mono">220g / 7.8 oz</span>
        </div>
        <div className="flex justify-between border-b border-border pb-2">
          <span className="font-bold text-foreground">1 stick of butter</span>
          <span className="text-primary font-mono">113g / 8 tbsp / 0.5 cup</span>
        </div>
        <div className="flex justify-between border-b border-border pb-2">
          <span className="font-bold text-foreground">1 tablespoon (tbsp)</span>
          <span className="text-primary font-mono">15 ml / 3 tsp</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold text-foreground">1 fluid ounce (fl oz)</span>
          <span className="text-primary font-mono">29.57 ml / 2 tbsp</span>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-border text-[10px] text-muted flex items-center gap-1">
        <Coffee className="h-3 w-3" />
        <span>Weight measurements are more accurate for baking</span>
      </div>
    </div>
  );
};

export default UnitGuide;
