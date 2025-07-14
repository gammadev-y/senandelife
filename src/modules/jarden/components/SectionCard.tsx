
import React from 'react';

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  actionButton?: React.ReactNode;
  icon?: React.ElementType; // Changed from React.ReactElement
  titleSize?: 'text-lg' | 'text-xl' | 'text-2xl';
}

const SectionCard: React.FC<SectionCardProps> = ({ title, children, actionButton, icon: IconComponent, titleSize = "text-lg" }) => {
  return (
    // M3 Filled Card style using new palette
    <div className="bg-white border border-[#E5E3DD] shadow-sm rounded-2xl p-4 md:p-5">
      <div className="flex justify-between items-center mb-3 md:mb-4">
        <div className="flex items-center">
          {IconComponent && (
            <span className="mr-2.5 text-[#6C8C61]">
              <IconComponent className="w-5 h-5" />
            </span>
          )}
          <h3 className={`${titleSize} font-medium text-[#1D3117]`}>{title}</h3>
        </div>
        {actionButton}
      </div>
      <div className="text-[#2C2C2C] prose prose-sm max-w-none text-sm leading-relaxed">
        {children}
      </div>
    </div>
  );
};

export default SectionCard;
