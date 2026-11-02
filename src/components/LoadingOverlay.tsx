import { useIsFetching } from '@tanstack/react-query';

export function LoadingOverlay() {
  const isFetching = useIsFetching();

  if (!isFetching) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card text-card-foreground rounded-lg p-6 shadow-lg flex items-center space-x-3">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        <span className="text-sm font-medium">Carregando...</span>
      </div>
    </div>
  );
}