import React, { useState, useEffect } from 'react';
import i18n from '../utils/i18n';

const DigitalClock: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const [is24Hour, setIs24Hour] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    const isRTL = i18n.isRTL();
    
    if (isRTL) {
      // Arabic time format
      const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: !is24Hour,
        timeZone: 'Asia/Riyadh' // Saudi Arabia timezone
      };
      return new Intl.DateTimeFormat('ar-SA', options).format(date);
    } else {
      // English time format
      const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: !is24Hour
      };
      return new Intl.DateTimeFormat('en-US', options).format(date);
    }
  };

  const formatDate = (date: Date) => {
    const isRTL = i18n.isRTL();
    
    if (isRTL) {
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      return new Intl.DateTimeFormat('ar-SA', options).format(date);
    } else {
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      return new Intl.DateTimeFormat('en-US', options).format(date);
    }
  };

  const isRTL = i18n.isRTL();

  return (
    <div className={`flex flex-col items-center gap-1 ${isRTL ? 'text-right' : 'text-left'}`}>
      <div 
        className="text-lg font-mono font-bold text-white cursor-pointer hover:text-purple-400 transition-colors"
        onClick={() => setIs24Hour(!is24Hour)}
        title={isRTL ? 'انقر لتغيير تنسيق الوقت' : 'Click to toggle time format'}
      >
        {formatTime(time)}
      </div>
      <div className="text-xs text-gray-400 font-medium">
        {formatDate(time)}
      </div>
    </div>
  );
};

export default DigitalClock;