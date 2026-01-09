
import React, { useState, useEffect } from 'react';
import { Home, Briefcase, Store, PlaySquare, Plus } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getJobsTotalBadge, getHarajTotalBadge, STORAGE_KEYS } from '../services/badgeCounterService';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCreate: () => void;
}

// Badge component
const Badge: React.FC<{ count: number; color: string }> = ({ count, color }) => {
  if (count <= 0) return null;
  
  const displayCount = count > 99 ? '99+' : count.toString();
  
  return (
    <div 
      className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] ${color} rounded-full flex items-center justify-center px-1`}
      style={{ fontSize: '10px', fontWeight: 'bold', color: 'white' }}
    >
      {displayCount}
    </div>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, onOpenCreate }) => {
  const { t } = useLanguage();
  const isShorts = activeTab === 'shorts';

  // Badge states
  const [jobsBadge, setJobsBadge] = useState(() => getJobsTotalBadge());
  const [harajBadge, setHarajBadge] = useState(() => getHarajTotalBadge());

  // Listen for badge updates
  useEffect(() => {
    const handleBadgeUpdate = (event: CustomEvent) => {
      const { key, count } = event.detail;
      if (key === STORAGE_KEYS.JOBS_TOTAL) {
        setJobsBadge(count);
      } else if (key === STORAGE_KEYS.HARAJ_TOTAL) {
        setHarajBadge(count);
      }
    };

    window.addEventListener('badgeCountUpdated', handleBadgeUpdate as EventListener);
    
    // Also check on interval for any missed updates
    const interval = setInterval(() => {
      setJobsBadge(getJobsTotalBadge());
      setHarajBadge(getHarajTotalBadge());
    }, 5000);

    return () => {
      window.removeEventListener('badgeCountUpdated', handleBadgeUpdate as EventListener);
      clearInterval(interval);
    };
  }, []);

  const navContainerClass = isShorts 
    ? "bg-black border-black" 
    : "bg-white border-gray-200";
    
  const getButtonClass = (tabName: string) => {
    const isActive = activeTab === tabName;
    
    if (isShorts) {
      if (isActive) return "text-white"; 
      return "text-[#888888]";
    } else {
      if (isActive) {
          if (tabName === 'haraj') return "text-orange-600";
          if (tabName === 'jobs') return "text-purple-600";
          return "text-blue-600";
      }
      return "text-gray-400";
    }
  };

  return (
    <nav className={`fixed bottom-0 w-full max-w-md z-50 border-t pb-safe pt-1 ${navContainerClass}`}>
      <div className="flex justify-around items-center px-2 pb-1 h-[48px]">
        
        {/* Home */}
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-0.5 w-14 active:scale-95 transition-transform ${getButtonClass('home')}`}
        >
          <Home size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
          <span className={`text-[9px] ${activeTab === 'home' ? 'font-bold' : 'font-medium'}`}>{t('nav_home')}</span>
        </button>

        {/* Jobs (Wazaef) - with badge */}
        <button 
          onClick={() => setActiveTab('jobs')}
          className={`flex flex-col items-center gap-0.5 w-14 active:scale-95 transition-transform ${getButtonClass('jobs')} relative`}
        >
          <div className="relative">
            <Briefcase size={24} strokeWidth={activeTab === 'jobs' ? 2.5 : 2} />
            <Badge count={jobsBadge} color="bg-purple-600" />
          </div>
          <span className={`text-[9px] ${activeTab === 'jobs' ? 'font-bold' : 'font-medium'}`}>{t('nav_jobs')}</span>
        </button>

        {/* Add (Plus) */}
        <button 
          onClick={onOpenCreate}
          className="flex flex-col items-center justify-center active:scale-90 transition-transform"
        >
          <div className={`p-2 rounded-xl shadow-sm backdrop-blur-sm ${
             isShorts 
               ? 'bg-white/10 text-white' 
               : 'bg-black text-white shadow-gray-300'
          }`}>
            <Plus size={20} strokeWidth={3} />
          </div>
        </button>

        {/* Shorts */}
        <button 
          onClick={() => setActiveTab('shorts')}
          className={`flex flex-col items-center gap-0.5 w-14 active:scale-95 transition-transform ${getButtonClass('shorts')}`}
        >
          <PlaySquare size={24} fill={activeTab === 'shorts' ? "currentColor" : "none"} strokeWidth={activeTab === 'shorts' ? 0 : 2} />
          <span className={`text-[9px] ${activeTab === 'shorts' ? 'font-bold' : 'font-medium'}`}>{t('nav_shorts')}</span>
        </button>

         {/* Haraj (Marketplace) - with badge */}
         <button 
          onClick={() => setActiveTab('haraj')}
          className={`flex flex-col items-center gap-0.5 w-14 active:scale-95 transition-transform ${getButtonClass('haraj')} relative`}
        >
          <div className="relative">
            <Store size={24} strokeWidth={activeTab === 'haraj' ? 2.5 : 2} />
            <Badge count={harajBadge} color="bg-orange-600" />
          </div>
          <span className={`text-[9px] ${activeTab === 'haraj' ? 'font-bold' : 'font-medium'}`}>{t('nav_haraj')}</span>
        </button>

      </div>
    </nav>
  );
};

export default BottomNav;
