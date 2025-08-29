import React from 'react';
import Image from 'next/image';

interface NavigationProps {
  currentScreen: 'city' | 'army' | 'battle' | 'shop';
  onScreenChange: (screen: 'city' | 'army' | 'battle' | 'shop') => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentScreen, onScreenChange }) => {
  const screens = [
    { name: 'city', label: 'City' },
    { name: 'army', label: 'Army' },
    { name: 'battle', label: 'Battle' },
    { name: 'shop', label: 'Shop' }
  ];

  return (
    <nav className="bg-gray-900/95 border-b border-gray-700 py-1 px-4 h-[100px]">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center -mt-2 -ml-8">
            <Image 
              src="/l.png" 
              alt="Logo"
              width={256}
              height={128}
              className="object-contain"
            />
          </div>
        </div>
        <div className="flex space-x-2">
          {screens.map((screen) => (
            <button
              key={screen.name}
              onClick={() => onScreenChange(screen.name as 'city' | 'army' | 'battle' | 'shop')}
              className={`w-20 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 shadow-lg hover:shadow-xl ${
                currentScreen === screen.name
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-blue-500/25 scale-105'
                  : 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-600 border border-gray-600 hover:border-gray-500'
              }`}
            >
              {screen.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};
