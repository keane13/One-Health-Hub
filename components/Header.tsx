
import React from 'react';
import { Link } from 'react-router-dom';
import { LogoIcon } from './icons/UiIcons';

interface HeaderProps {
  showBackButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ showBackButton = false }) => {
  return (
    <header className="py-4 px-4 md:px-8 bg-gray-900/50 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 text-xl font-bold text-white hover:opacity-80 transition-opacity">
          <LogoIcon className="h-8 w-8 text-green-400" />
          <span>OH<sup>2</sup> (One Health Hub)</span>
        </Link>
        {showBackButton && (
          <Link to="/" className="bg-gray-700 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
            <span>Home</span>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;