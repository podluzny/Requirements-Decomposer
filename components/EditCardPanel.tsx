import React, { useState, useEffect } from 'react';
import { Card, CardType } from '../types';
import { CARD_TYPE_DEFINITIONS } from '../constants';
import { XMarkIcon, TrashIcon } from './Icons';

interface EditCardPanelProps {
  card: Card;
  onClose: () => void;
  onSave: (cardId: string, updates: Partial<Omit<Card, 'id'>>) => void;
  onDelete: (cardId: string) => void;
}

const EditCardPanel: React.FC<EditCardPanelProps> = ({ card, onClose, onSave, onDelete }) => {
  const [editedType, setEditedType] = useState(card.type);
  const [editedCaption, setEditedCaption] = useState(card.caption || '');

  useEffect(() => {
    setEditedType(card.type);
    setEditedCaption(card.caption || '');
  }, [card]);

  const handleSave = () => {
    onSave(card.id, { type: editedType, caption: editedCaption.trim() });
  };
  
  const handleDelete = () => {
    if (window.confirm('Вы уверены, что хотите удалить эту карточку?')) {
        onDelete(card.id);
    }
  }

  return (
    <div className="fixed top-0 right-0 h-full w-[400px] bg-gray-800 border-l border-gray-700 shadow-2xl z-20 flex flex-col animate-slide-in">
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-100">Редактировать карточку</h2>
        <button
          onClick={onClose}
          className="p-1 rounded-full text-gray-400 hover:bg-gray-600 hover:text-white"
          title="Закрыть"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Исходный текст</label>
          <div className="p-3 bg-gray-900 rounded-md text-gray-300 select-all">
            {card.text}
          </div>
        </div>
        
        <div>
            <label htmlFor="card-type" className="block text-sm font-medium text-gray-400 mb-2">Тип карточки</label>
            <select
                id="card-type"
                value={editedType}
                onChange={(e) => setEditedType(e.target.value as CardType)}
                className={`w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${CARD_TYPE_DEFINITIONS[editedType].color}`}
            >
                {Object.values(CardType).map(type => (
                    <option key={type} value={type}>{CARD_TYPE_DEFINITIONS[type].name}</option>
                ))}
            </select>
        </div>

        <div>
            <label htmlFor="card-caption" className="block text-sm font-medium text-gray-400 mb-2">Подпись</label>
            <textarea
                id="card-caption"
                value={editedCaption}
                onChange={(e) => setEditedCaption(e.target.value)}
                placeholder="Добавить подпись..."
                className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                rows={4}
            />
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-700 flex justify-between items-center">
        <button
          onClick={handleDelete}
          className="flex items-center px-4 py-2 text-sm bg-red-800/50 text-red-300 font-semibold rounded-lg hover:bg-red-800/80 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
          title="Удалить карточку"
        >
          <TrashIcon className="h-5 w-5 mr-2" />
          Удалить
        </button>
        <div className="flex space-x-3">
            <button onClick={onClose} className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-500 font-semibold rounded-lg transition-colors">Отмена</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">Сохранить</button>
        </div>
      </div>
       <style>{`
            @keyframes slide-in {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
            }
            .animate-slide-in {
                animation: slide-in 0.2s ease-out forwards;
            }
        `}</style>
    </div>
  );
};

export default EditCardPanel;
