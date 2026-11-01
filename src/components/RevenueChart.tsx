import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ChartData {
  date: string;
  receita: number;
  visitas: number;
}

interface RevenueChartProps {
  data: ChartData[];
  isLoading?: boolean;
  period: number;
  onPeriodChange: (period: number) => void;
}

export function RevenueChart({ data, isLoading, period, onPeriodChange }: RevenueChartProps) {
  const isEmpty = data.every((d) => d.receita === 0 && d.visitas === 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // "YYYY-MM-DD" é dia local; new Date() leria como UTC e mostraria o dia anterior
  const formatDate = (dateStr: string) => `${dateStr.slice(8, 10)}/${dateStr.slice(5, 7)}`;

  if (isLoading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Receita vs Visitas (últimos {period} dias)</CardTitle>
            <div className="h-10 w-32 bg-muted animate-pulse rounded-md"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-muted animate-pulse rounded-md"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Receita vs Visitas (últimos {period} dias)</CardTitle>
          <Select value={String(period)} onValueChange={(v) => onPeriodChange(Number(v))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 dias</SelectItem>
              <SelectItem value="30">30 dias</SelectItem>
              <SelectItem value="90">90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 relative">
          {isEmpty && (
            <div className="absolute inset-0 z-10 flex items-center justify-center text-sm text-muted-foreground">
              Ainda não há vendas pagas nem visitas registradas neste período.
            </div>
          )}
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                className="text-muted-foreground"
              />
              <YAxis 
                yAxisId="receita"
                orientation="left"
                tickFormatter={formatCurrency}
                className="text-muted-foreground"
              />
              <YAxis 
                yAxisId="visitas"
                orientation="right"
                className="text-muted-foreground"
              />
              <Tooltip 
                labelFormatter={(value) => `Data: ${formatDate(value)}`}
                formatter={(value: number, name: string) => [
                  name === 'receita' ? formatCurrency(value) : value,
                  name === 'receita' ? 'Receita' : 'Visitas'
                ]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Line 
                yAxisId="receita"
                type="monotone" 
                dataKey="receita" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
              />
              <Line 
                yAxisId="visitas"
                type="monotone" 
                dataKey="visitas" 
                stroke="#8884d8" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#8884d8', strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span className="text-muted-foreground">Receita (R$)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#8884d8] rounded-full"></div>
            <span className="text-muted-foreground">Visitas</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}