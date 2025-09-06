import React from 'react';
import { Card } from '../types';
import { CARD_TYPE_DEFINITIONS } from '../constants';
import { XMarkIcon } from './Icons';

interface CardItemProps {
  card: Card;
  isActive: boolean;
  onDelete: (id: string) => void;
  onSetActive: (id: string | null) => void;
  onSetEditing: (id: string | null) => void;
  className?: string;
}

const CardItem: React.FC<CardItemProps> = ({ 
    card, 
    isActive, 
    onDelete, 
    onSetActive, 
    onSetEditing, 
    className = '' 
}) => {
  const { name, color, bgColor, icon: Icon } = CARD_TYPE_DEFINITIONS[card.type];
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('cardId', card.id);
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onMouseEnter={() => onSetActive(card.id)}
      onMouseLeave={() => onSetActive(null)}
      onDoubleClick={() => onSetEditing(card.id)}
      className={`relative p-3 rounded-lg border cursor-grab active:cursor-grabbing transition-all duration-200 ${bgColor} ${isActive ? 'ring-2 ring-white border-transparent' : 'border-gray-700 hover:border-gray-500'} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className={`flex items-center text-sm font-semibold mb-2 ${color}`}>
          <Icon className="h-5 w-5 mr-2" />
          <span>{name}</span>
        </div>
        <button 
          onClick={() => onDelete(card.id)}
          className="text-gray-500 hover:text-red-400 transition-colors rounded-full p-1 -mt-1 -mr-1"
          title="Delete card"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
      <p className="text-gray-200">{card.text}</p>
      {card.caption && (
        <p className="mt-2 text-sm text-gray-400 italic border-l-2 border-gray-600 pl-2">
            {card.caption}
        </p>
      )}
    </div>
  );
};

export default CardItem;