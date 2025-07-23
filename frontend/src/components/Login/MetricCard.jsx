import { Clock, Target, TrendingUp } from "lucide-react";

// Componente reutilizável
const MetricCard = ({ icon: Icon, text, color }) => {
  return (
    <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-3 text-center hover:bg-slate-800/50 hover:scale-105 transition-all duration-300 group">
      <Icon
        className={`h-4 w-4 ${color.icon} mx-auto mb-1 group-hover:animate-pulse`}
      />
      <p className={`${color.text} text-xs font-semibold`}>{text}</p>
    </div>
  );
};

export default MetricCard;
