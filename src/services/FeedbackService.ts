import { toast } from '@/hooks/use-toast';

export class FeedbackService {
  static success(title: string, description?: string) {
    toast({
      variant: 'success',
      title,
      description
    });
  }

  static error(title: string, description?: string) {
    toast({
      variant: 'destructive',
      title,
      description
    });
  }

  static info(title: string, description?: string) {
    toast({
      variant: 'default',
      title,
      description
    });
  }
}