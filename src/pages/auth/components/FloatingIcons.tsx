import React from 'react';
import { 
  ShoppingCart, 
  BarChart3, 
  Users, 
  Package, 
  CreditCard, 
  Smartphone,
  TrendingUp,
  Shield,
  Star,
  Zap
} from 'lucide-react';

export function FloatingIcons() {
  const icons = [
    { Icon: ShoppingCart, delay: '0s', position: 'top-4 left-4', size: 'w-6 h-6', animation: 'floatParallax' },
    { Icon: BarChart3, delay: '0.5s', position: 'top-12 right-8', size: 'w-7 h-7', animation: 'floatParallax' },
    { Icon: Users, delay: '1s', position: 'top-24 left-12', size: 'w-5 h-5', animation: 'floatParallax' },
    { Icon: Package, delay: '1.5s', position: 'bottom-24 right-4', size: 'w-6 h-6', animation: 'floatParallax' },
    { Icon: CreditCard, delay: '2s', position: 'bottom-12 left-8', size: 'w-5 h-5', animation: 'floatParallax' },
    { Icon: Smartphone, delay: '2.5s', position: 'top-32 right-16', size: 'w-6 h-6', animation: 'floatParallax' },
    { Icon: TrendingUp, delay: '3s', position: 'bottom-32 left-16', size: 'w-7 h-7', animation: 'floatParallax' },
    { Icon: Shield, delay: '3.5s', position: 'bottom-4 right-12', size: 'w-5 h-5', animation: 'floatParallax' },
    { Icon: Star, delay: '4s', position: 'top-16 left-1/3', size: 'w-4 h-4', animation: 'fadeInOut' },
    { Icon: Zap, delay: '4.5s', position: 'bottom-16 right-1/3', size: 'w-5 h-5', animation: 'fadeInOut' },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden">
      {icons.map(({ Icon, delay, position, size, animation }, index) => (
        <div
          key={index}
          className={`absolute ${position} opacity-15 hover:opacity-30 transition-opacity duration-500`}
          style={{
            animationDelay: delay,
            animation: `${animation} 8s ease-in-out infinite`,
          }}
        >
          <Icon className={`${size} text-green-600`} />
        </div>
      ))}
      
      {/* Additional animated elements for enhanced parallax */}
      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 opacity-10">
        <div 
          className="w-16 h-16 border-2 border-green-300 rounded-full"
          style={{
            animation: 'pulse 6s ease-in-out infinite',
            animationDelay: '1s'
          }}
        />
      </div>
      
      <div className="absolute bottom-1/4 right-1/4 opacity-8">
        <div 
          className="w-12 h-12 bg-gradient-to-r from-purple-300 to-blue-300 rounded-full"
          style={{
            animation: 'fadeInOut 8s ease-in-out infinite',
            animationDelay: '2s'
          }}
        />
      </div>

      <div className="absolute top-1/3 right-1/3 opacity-12">
        <div 
          className="w-6 h-6 bg-green-300 rounded-full"
          style={{
            animation: 'floatParallax 10s ease-in-out infinite',
            animationDelay: '3s'
          }}
        />
      </div>
    </div>
  );
}