import CountUp from 'react-countup';
import { Card, CardContent } from '@/components/ui/card';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  format?: 'number' | 'currency' | 'percentage';
  delta?: number;
  className?: string;
  suffix?: string;
}

export function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  format = 'number',
  delta,
  className = '',
  suffix = ''
}: MetricCardProps) {
  const getDeltaColor = (delta: number) => {
    if (delta > 0) return 'text-green-600 dark:text-green-400';
    if (delta < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-500 dark:text-gray-400';
  };

  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return formatCurrency(val);
      case 'percentage':
        return `${val.toFixed(1)}%`;
      default:
        return val.toString();
    }
  };

  return (
    <Card className={`hover:shadow-md transition-all duration-200 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {format === 'currency' ? (
                  <CountUp
                    end={value}
                    duration={2}
                    separator="."
                    decimal=","
                    decimals={2}
                    prefix="R$ "
                  />
                ) : format === 'percentage' ? (
                  <CountUp
                    end={value}
                    duration={2}
                    decimals={1}
                    suffix="%"
                  />
                ) : (
                  <CountUp end={value} duration={2} separator="." suffix={suffix} />
                )}
              </div>
              {delta !== undefined && (
                <span className={`text-sm font-medium ${getDeltaColor(delta)}`}>
                  {delta > 0 ? '+' : ''}{delta.toFixed(1)}%
                </span>
              )}
            </div>
          </div>
          <div className="h-12 w-12 rounded-lg bg-muted/30 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}