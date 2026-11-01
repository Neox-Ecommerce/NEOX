import CountUp from 'react-countup';
import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

interface StatsWidgetProps {
  title: string;
  value: number;
  icon: LucideIcon;
  format?: 'number' | 'currency';
  className?: string;
}

export function StatsWidget({ 
  title, 
  value, 
  icon: Icon, 
  format = 'number',
  className = '' 
}: StatsWidgetProps) {
  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
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
              ) : (
                <CountUp end={value} duration={2} separator="." />
              )}
            </div>
          </div>
          <div className="h-12 w-12 rounded-lg bg-primary-muted flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}