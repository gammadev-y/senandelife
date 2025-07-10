
import React from 'react';

// Using a simplified path from the user-provided image (Monstera-like plant)
// This path is an approximation for demonstration.
const PlantStockIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ className, style, ...restProps }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64" // Adjusted viewBox for better rendering of a sample path
    fill="currentColor"
    className={className} // Explicitly pass className
    style={style}         // Explicitly pass style
    {...restProps}        // Spread other valid SVG props
  >
    <path d="M52.9,61.9H11.1c-1.6,0-2.9-1.3-2.9-2.9V31.1c0-1.6,1.3-2.9,2.9-2.9h41.8c1.6,0,2.9,1.3,2.9,2.9v27.9 C55.8,60.6,54.5,61.9,52.9,61.9z M14,56.1h36V33.9H14V56.1z M47,28.2h-4V14.8c0-4.9-4-8.8-8.8-8.8s-8.8,4-8.8,8.8v13.3h-4 c-1.6,0-2.9-1.3-2.9-2.9V11.9c0-1.6,1.3-2.9,2.9-2.9h0.1c0.2,0,0.3,0,0.5,0C29.5,3.2,37.3,0,42.8,0c8.8,0,16.1,7.1,16.1,16.1v9.2 C50,26.9,48.7,28.2,47,28.2z M31.2,25.3V14.8c0-2.7,2.2-4.9,4.9-4.9s4.9,2.2,4.9,4.9v10.5H31.2z M20.9,25.3V11.9 c0.1-2.8,2.2-5.5,4.9-5.7c2.7-0.2,4.9,2.2,4.9,4.9v14.2H20.9z"/>
    <path d="M32,58.9c-7.5,0-13.6-6.1-13.6-13.6v-1.7c0-1.6,1.3-2.9,2.9-2.9h21.5c1.6,0,2.9,1.3,2.9,2.9v1.7 C45.6,52.8,39.5,58.9,32,58.9z M21.2,43.6h1.5v8.8c0,5.2,4.2,9.7,9.3,9.7s9.3-4.4,9.3-9.7v-8.8h1.5V43.6z"/>
  </svg>
);

export default PlantStockIcon;
