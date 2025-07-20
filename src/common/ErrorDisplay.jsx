import React from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from './SafeIcon';

const ErrorDisplay = ({ error, title = "Error", icon = FiIcons.FiAlertTriangle, bgClass = "bg-red-900/50", textClass = "text-red-200", iconClass = "text-red-400", titleClass = "text-red-300" }) => {
  return (
    <div className={`${bgClass} p-4 rounded mb-4`}>
      <div className="flex gap-2 items-center mb-2">
        <SafeIcon icon={icon} className={iconClass} />
        <h2 className={`${titleClass} font-medium`}>{title}</h2>
      </div>
      <p className={textClass}>{error}</p>
    </div>
  );
};

export default ErrorDisplay;