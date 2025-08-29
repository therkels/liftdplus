import React from "react";

interface CardScrollerProps {
  children: React.ReactNode;
  title?: string;
}

const CardScroller: React.FC<CardScrollerProps> = ({ children, title }) => {
  return (
    <div className="w-full py-6">
      {title && (
        <h2 className="text-2xl font-bold text-gray-800 mb-4 px-4">{title}</h2>
      )}
      <div className="relative">
        <div className="overflow-x-auto touch-scroll">
          <div className="flex space-x-4 p-4">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default CardScroller;
