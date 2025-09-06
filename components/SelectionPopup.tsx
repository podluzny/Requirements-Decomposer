
import React, { useEffect, useRef } from 'react';
import { CardType } from '../types';
import { CARD_TYPE_DEFINITIONS } from '../constants';

interface SelectionPopupProps {
  position: { x: number; y: number };
  onSelectType: (type: CardType) => void;
  onClose: () => void;
}

const SelectionPopup: React.FC<SelectionPopupProps> = ({ position, onSelectType, onClose }) => {
    const popupRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

  return (
    <div
      ref={popupRef}
      className="absolute z-10 flex items-center bg-gray-700 border border-gray-600 rounded-lg shadow-2xl overflow-hidden"
      style={{ top: `${position.y + 10}px`, left: `${position.x}px` }}
    >
      {Object.values(CardType).map(type => {
        const { name, color, icon: Icon } = CARD_TYPE_DEFINITIONS[type];
        return (
          <button
            key={type}
            onClick={() => onSelectType(type)}
            title={name}
            className={`flex items-center p-2 ${color} hover:bg-gray-600 transition-colors duration-150`}
          >
            <Icon className="h-5 w-5" />
          </button>
        );
      })}
    </div>
  );
};

export default SelectionPopup;
