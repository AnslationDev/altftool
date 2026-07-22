import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Trophy
} from "lucide-react";

const StrengthMeter = ({ score }) => {
  let level = "Weak";
  let color = "from-red-500 to-red-400";
  let Icon = AlertTriangle;
  let textColor = "text-red-500";
  let suggestion = "Add more details to improve your resume";

  if (score > 40 && score <= 65) {
    level = "Average";
    color = "from-yellow-400 to-yellow-500";
    Icon = BarChart3;
    textColor = "text-yellow-500";
    suggestion = "+5 points if you add quantified achievements";
  }

  if (score > 65 && score <= 85) {
    level = "Strong";
    color = "from-green-400 to-green-500";
    Icon = CheckCircle2;
    textColor = "text-green-500";
    suggestion = "Great! Add projects to reach elite level";
  }

  if (score > 85) {
    level = "Elite";
    color = "from-blue-400 to-blue-500";
    Icon = Trophy;
    textColor = "text-blue-500";
    suggestion = "🔥 Your resume is top-tier!";
  }

  return (
    <div className="space-y-3 mt-2">


      <div className="w-full h-3 bg-(--border) rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${color} transition-all duration-700 ease-in-out shadow-md`}
          style={{ width: `${score}%` }}
        />
      </div>


      <div className="flex items-center justify-between text-sm">
        <div className={`flex items-center gap-2 font-medium ${textColor}`}>
          <Icon className="w-4 h-4" />
          {level}
        </div>

        <div className="text-(--foreground) font-medium">
          {score}%
        </div>
      </div>


      <p className="text-xs text-(--muted-foreground)">
        💡 {suggestion}
      </p>
    </div>
  );
};

export default StrengthMeter;
