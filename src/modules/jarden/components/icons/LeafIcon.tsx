
import React from 'react';

const LeafIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
      d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.62a8.983 8.983 0 013.362-3.797A8.23 8.23 0 0115.362 5.214zM15.362 5.214A8.252 8.252 0 0012 3C9.27 3 7.074 4.31 6.038 6.048c-.32.56-.486 1.15-.486 1.758 0 .656.193 1.28.548 1.843A8.25 8.25 0 0012 21a8.25 8.25 0 005.962-14.952A8.23 8.23 0 0015.362 5.214z"
    />
  </svg>
);

export default LeafIcon;
