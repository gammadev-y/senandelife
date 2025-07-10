
import React from 'react';

const LightBulbIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 18.375V21m0-11.25A4.123 4.123 0 0116.125 12c0 1.272-.568 2.439-1.48 3.219a4.11 4.11 0 01-5.29 0C8.443 14.439 7.875 13.272 7.875 12 7.875 9.202 9.702 7.125 12 7.125zm0 3.375a.75.75 0 01.75.75v.008a.75.75 0 01-1.5 0v-.008a.75.75 0 01.75-.75zM12 3C7.031 3 3 7.031 3 12s4.031 9 9 9 9-4.031 9-9c0-1.875-.563-3.609-1.5-5.062"
    />
     <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 21a2.25 2.25 0 01-2.244-2.023l-.006-.003-.066-.396a2.25 2.25 0 01-.25-1.153V15h5.125v2.425c0 .425-.083.836-.25 1.22l-.066.393-.006.003A2.25 2.25 0 0114.25 21H9.75z" />
  </svg>
);

export default LightBulbIcon;
