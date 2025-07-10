
import React from 'react';

const GroundStockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    // stroke="none" // Removed this line
    {...props}
  >
    <path d="M20 6H4C2.897 6 2 6.897 2 8v10c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V8c0-1.103-.897-2-2-2zm-2 11H6v-2h12v2zm0-3H6v-2h12v2zm0-3H6V9h12v2z" />
    {/* Simplified representation of some plants/soil */}
    <path d="M5 16h2v-1H5zM8 16h2v-1H8zM11 16h2v-1h-2zM14 16h2v-1h-2zM17 16h2v-1h-2z" />
    <path d="M5 13h2v-1H5zM8 13h2v-1H8zM11 13h2v-1h-2zM14 13h2v-1h-2zM17 13h2v-1h-2z" />
    <path d="M5 10h2V9H5zM8 10h2V9H8zM11 10h2V9h-2zM14 10h2V9h-2zM17 10h2V9h-2z" />
  </svg>
);

export default GroundStockIcon;