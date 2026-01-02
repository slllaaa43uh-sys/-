
import React, { useState } from 'react';
import { Hexagon, Briefcase } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const SplashScreen: React.FC = () => {
  const { t } = useLanguage();
  const [imgError, setImgError] = useState(false);
  // Using absolute path from public directory for Vite
  const AppLogo = "/assets/images/app-logo.jpg"; 

  return (
    <div className="fixed inset-0 z-[9999] bg-white dark:bg-black flex flex-col items-center justify-between pb-10 pt-safe">
      
      {/* الجزء العلوي - فارغ للموازنة */}
      <div className="flex-1"></div>

      {/* المنتصف - شعار التطبيق واسمه - ثابت بدون حركة */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-24 h-24 rounded-2xl shadow-xl shadow-blue-200 dark:shadow-none mb-4 overflow-hidden bg-white flex items-center justify-center">
           {!imgError ? (
             <img 
               src={AppLogo} 
               alt="مهنتي لي" 
               className="w-full h-full object-contain"
               onError={() => setImgError(true)} 
             />
           ) : (
             <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <Briefcase size={40} className="text-white" />
             </div>
           )}
        </div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{t('app_name')}</h1>
      </div>

      {/* الأسفل - شعار الشركة والمطور - ثابت بدون حركة */}
      <div className="flex-1 flex flex-col justify-end items-center w-full">
        <div className="flex flex-col items-center gap-3">
          <span className="text-gray-400 text-[10px] tracking-widest font-medium uppercase">From</span>
          
          <div className="flex items-center gap-2.5">
            {/* شعار الشركة الصغير */}
            <div className="relative w-8 h-8 flex items-center justify-center">
                <Hexagon size={32} className="text-gray-300 dark:text-gray-700 absolute" strokeWidth={1} />
                <div className="w-4 h-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-sm rotate-45 shadow-sm"></div>
            </div>
            
            {/* اسم المطور */}
            <span className="text-lg font-bold text-gray-800 dark:text-gray-200 font-sans tracking-wide">
              مهدلي
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default SplashScreen;
