import { Plane, TrendingUp, Globe, Activity } from 'lucide-react';
import { Aircraft } from '../types/aircraft';
import { getAircraftStats, formatAltitude, formatSpeed } from '../utils/formatting';

interface StatsPanelProps {
  aircraft: Aircraft[];
  lastUpdate: Date | null;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ aircraft, lastUpdate }) => {
  const stats = getAircraftStats(aircraft);

  const statItems = [
    {
      icon: Plane,
      label: 'Total Aircraft',
      value: stats.total.toLocaleString(),
      color: 'text-blue-400',
    },
    {
      icon: TrendingUp,
      label: 'In Air',
      value: stats.inAir.toLocaleString(),
      color: 'text-green-400',
    },
    {
      icon: Activity,
      label: 'Avg Altitude',
      value: formatAltitude(stats.avgAltitude),
      color: 'text-yellow-400',
    },
    {
      icon: Globe,
      label: 'Countries',
      value: stats.countries.toLocaleString(),
      color: 'text-purple-400',
    },
  ];

  return (
    <div className="glass-panel p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Live Statistics</h2>
        {lastUpdate && (
          <span className="text-xs text-muted-foreground">
            Updated: {lastUpdate.toLocaleTimeString()}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {statItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="stat-card">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${item.color}`} />
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
              <div className="text-xl font-bold">{item.value}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-border">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">On Ground: </span>
            <span className="font-semibold">{stats.onGround}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Avg Speed: </span>
            <span className="font-semibold">{formatSpeed(stats.avgSpeed)}</span>
          </div>
          <div className="col-span-2">
            <span className="text-muted-foreground">Max Altitude: </span>
            <span className="font-semibold">{formatAltitude(stats.maxAltitude)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
