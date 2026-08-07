import React from "react";
import { Info, HelpCircle, Target, Zap, Utensils } from "lucide-react";

export default function Description() {
  return (
    <div className="mt-12 space-y-8 animate-fade-up">
      <div className="bg-(--card) border border-(--border) rounded-2xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-(--foreground)">
          <HelpCircle className="w-6 h-6 text-(--primary)" />
          How to Use the Macro Calculator
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-(--primary)/10 text-(--primary) flex items-center justify-center font-bold shrink-0 mt-1">1</div>
              <div>
                <h3 className="font-semibold text-(--foreground) mb-1">Enter Your Details</h3>
                <p className="text-sm text-(--muted-foreground) leading-relaxed">
                  Provide your accurate age, gender, weight, and height. You can also optionally enter your body fat percentage for a more precise calculation.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-(--primary)/10 text-(--primary) flex items-center justify-center font-bold shrink-0 mt-1">2</div>
              <div>
                <h3 className="font-semibold text-(--foreground) mb-1">Select Activity Level</h3>
                <p className="text-sm text-(--muted-foreground) leading-relaxed">
                  Choose the activity level that best describes your daily routine, including your workouts. This helps determine your Total Daily Energy Expenditure (TDEE).
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-(--primary)/10 text-(--primary) flex items-center justify-center font-bold shrink-0 mt-1">3</div>
              <div>
                <h3 className="font-semibold text-(--foreground) mb-1">Choose Your Goal</h3>
                <p className="text-sm text-(--muted-foreground) leading-relaxed">
                  Select whether you want to lose fat, maintain your weight, or build muscle. The calculator will adjust your target calories accordingly.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-(--primary)/10 text-(--primary) flex items-center justify-center font-bold shrink-0 mt-1">4</div>
              <div>
                <h3 className="font-semibold text-(--foreground) mb-1">Pick a Macro Split</h3>
                <p className="text-sm text-(--muted-foreground) leading-relaxed">
                  Choose a macro distribution that fits your dietary preferences (e.g., balanced, high protein, low carb).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-(--foreground)">
          <Info className="w-6 h-6 text-(--primary)" />
          Key Terms Explained
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-(--card) border border-(--border) rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-(--foreground)">
              <Zap className="w-5 h-5 text-(--primary)" /> BMR & TDEE
            </h3>
            <p className="text-sm text-(--muted-foreground) leading-relaxed">
              <strong>BMR (Basal Metabolic Rate):</strong> The calories your body burns at rest.
              <br className="mb-2" />
              <strong>TDEE (Total Daily Energy Expenditure):</strong> Your total daily calories burned, factoring in your activity level.
            </p>
          </div>
          <div className="bg-(--card) border border-(--border) rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-(--foreground)">
              <Target className="w-5 h-5 text-(--primary)" /> Goal Calories
            </h3>
            <p className="text-sm text-(--muted-foreground) leading-relaxed">
              To lose weight, you need a calorie deficit (eating less than your TDEE). To gain muscle, you need a calorie surplus. We automatically calculate these targets based on your goal.
            </p>
          </div>
          <div className="bg-(--card) border border-(--border) rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-(--foreground)">
              <Utensils className="w-5 h-5 text-(--primary)" /> Macros
            </h3>
            <p className="text-sm text-(--muted-foreground) leading-relaxed">
              <strong>Protein:</strong> Essential for muscle repair (4 cal/g).
              <br />
              <strong>Carbs:</strong> Primary energy source (4 cal/g).
              <br />
              <strong>Fats:</strong> Vital for hormones and health (9 cal/g).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
