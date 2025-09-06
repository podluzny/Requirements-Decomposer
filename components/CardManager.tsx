import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardType } from '../types';
import CardItem from './CardItem';
import { CARD_TYPE_DEFINITIONS } from '../constants';
import { TableCellsIcon, MapIcon, MagnifyingGlassIcon, ViewColumnsIcon, AdjustmentsHorizontalIcon, PlusIcon } from './Icons';

interface CardManagerProps {
  cards: Card[];
  activeCardId: string | null;
  visibleColumns: Record<CardType, boolean>;
  onVisibleColumnsChange: React.Dispatch<React.SetStateAction<Record<CardType, boolean>>>;
  onCardDelete: (id: string) => void;
  onSetActiveCardId: (id: string | null) => void;
  onSetEditingCardId: (id: string | null) => void;
  onCardUpdate: (cardId: string, updates: Partial<Omit<Card, 'id'>>) => void;
  onCreateArbitraryCard: (type: CardType) => void;
}

type ViewMode = 'table' | 'map' | 'columns';

const CardManager: React.FC<CardManagerProps> = ({ 
  cards, 
  activeCardId, 
  visibleColumns,
  onVisibleColumnsChange,
  onCardDelete, 
  onSetActiveCardId,
  onSetEditingCardId,
  onCardUpdate,
  onCreateArbitraryCard
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('columns');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<CardType | 'all'>('all');
  const [draggedOverColumn, setDraggedOverColumn] = useState<CardType | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
            setShowSettings(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggleColumn = (type: CardType) => {
    onVisibleColumnsChange(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch = card.text.toLowerCase().includes(lowerSearch) || 
                            (card.caption && card.caption.toLowerCase().includes(lowerSearch));
      const matchesType = filterType === 'all' || card.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [cards, searchTerm, filterType]);

  const groupedCards = useMemo(() => {
    return filteredCards.reduce((acc, card) => {
      (acc[card.type] = acc[card.type] || []).push(card);
      return acc;
    }, {} as Record<CardType, Card[]>);
  }, [filteredCards]);

  const visibleCardTypes = useMemo(() => {
      return Object.values(CardType).filter(type => visibleColumns[type]);
  }, [visibleColumns]);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, type: CardType) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('cardId');
    const draggedCard = cards.find(c => c.id === cardId);
    if (draggedCard && draggedCard.type !== type) {
        onCardUpdate(cardId, { type });
    }
    setDraggedOverColumn(null);
  };

  return (
    <div className="flex flex-col h-full bg-gray-800">
      <div className="p-3 border-b border-gray-700 bg-gray-800/70 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center space-x-2">
          <div className="relative flex-grow">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
            <input
              type="text"
              placeholder="Поиск по карточкам..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md pl-10 pr-4 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as CardType | 'all')}
            className="bg-gray-700 border border-gray-600 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">Все типы</option>
            {Object.values(CardType).map(type => (
              <option key={type} value={type}>{CARD_TYPE_DEFINITIONS[type].name}</option>
            ))}
          </select>
           <div className="relative" ref={settingsRef}>
             <button
                onClick={() => setShowSettings(s => !s)}
                className="p-1.5 rounded-md text-gray-400 hover:bg-gray-600 hover:text-white"
                title="Настроить колонки"
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5" />
             </button>
             {showSettings && (
                <div className="absolute right-0 mt-2 w-56 bg-gray-700 border border-gray-600 rounded-lg shadow-xl z-20">
                    <div className="p-3 border-b border-gray-600">
                        <p className="text-sm font-semibold text-gray-200">Отображаемые колонки</p>
                    </div>
                    <div className="p-2 space-y-1">
                        {Object.values(CardType).map(type => (
                            <label key={type} className="flex items-center space-x-3 px-2 py-1.5 rounded-md hover:bg-gray-600 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={visibleColumns[type]}
                                    onChange={() => handleToggleColumn(type)}
                                    className="h-4 w-4 rounded bg-gray-800 border-gray-500 text-blue-500 focus:ring-blue-600"
                                />
                                <span className="text-sm text-gray-200">{CARD_TYPE_DEFINITIONS[type].name}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
           </div>
          <div className="flex items-center bg-gray-700 rounded-md p-0.5">
            <button
              onClick={() => setViewMode('columns')}
              className={`p-1.5 rounded-md ${viewMode === 'columns' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-600'}`}
              title="Columns View"
            >
              <ViewColumnsIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-600'}`}
              title="Table View"
            >
              <TableCellsIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-1.5 rounded-md ${viewMode === 'map' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-600'}`}
              title="Map View"
            >
              <MapIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {viewMode === 'table' && (
          <div className="space-y-6 p-4">
            {Object.entries(groupedCards).map(([type, cardList]) => (
              <div key={type}>
                <h3 className={`text-lg font-semibold mb-2 flex items-center ${CARD_TYPE_DEFINITIONS[type as CardType].color}`}>
                   {React.createElement(CARD_TYPE_DEFINITIONS[type as CardType].icon, { className: 'h-5 w-5 mr-2' })}
                   {CARD_TYPE_DEFINITIONS[type as CardType].name}
                   <span className="ml-2 text-sm text-gray-400 bg-gray-700 px-2 py-0.5 rounded-full">{cardList.length}</span>
                </h3>
                <div className="space-y-2">
                  {cardList.map(card => (
                    <CardItem
                      key={card.id}
                      card={card}
                      isActive={card.id === activeCardId}
                      onDelete={onCardDelete}
                      onSetActive={onSetActiveCardId}
                      onSetEditing={onSetEditingCardId}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {viewMode === 'columns' && (
           <div className="h-full flex p-4 gap-4">
                {visibleCardTypes.map(type => {
                    const cardList = groupedCards[type] || [];
                    return (
                        <div 
                            key={type} 
                            className={`flex-1 min-w-0 bg-gray-900/50 rounded-lg flex flex-col max-h-full transition-colors ${draggedOverColumn === type ? 'bg-blue-500/10' : ''}`}
                            onDragOver={(e) => e.preventDefault()}
                            onDragEnter={() => setDraggedOverColumn(type)}
                            onDragLeave={() => setDraggedOverColumn(null)}
                            onDrop={(e) => handleDrop(e, type)}
                        >
                             <h3 className={`text-base font-semibold p-3 flex items-center border-b border-gray-700 bg-gray-800 rounded-t-lg ${CARD_TYPE_DEFINITIONS[type as CardType].color}`}>
                                {React.createElement(CARD_TYPE_DEFINITIONS[type as CardType].icon, { className: 'h-5 w-5 mr-2' })}
                                {CARD_TYPE_DEFINITIONS[type as CardType].name}
                                <span className="ml-2 text-sm text-gray-400 bg-gray-700 px-2 py-0.5 rounded-full">{cardList.length}</span>
                                <button 
                                  onClick={() => onCreateArbitraryCard(type)}
                                  className="ml-auto text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-600"
                                  title="Добавить карточку"
                                >
                                    <PlusIcon className="h-4 w-4"/>
                                </button>
                            </h3>
                            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                                {cardList.map(card => (
                                    <CardItem
                                        key={card.id}
                                        card={card}
                                        isActive={card.id === activeCardId}
                                        onDelete={onCardDelete}
                                        onSetActive={onSetActiveCardId}
                                        onSetEditing={onSetEditingCardId}
                                    />
                                ))}
                                {cardList.length === 0 && (
                                     <div className="text-center text-gray-500 text-sm p-4">
                                        Нет карточек.
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
        {viewMode === 'map' && (
          <div className="flex flex-wrap gap-4 p-4">
            {filteredCards.map(card => (
              <CardItem
                key={card.id}
                card={card}
                isActive={card.id === activeCardId}
                onDelete={onCardDelete}
                onSetActive={onSetActiveCardId}
                onSetEditing={onSetEditingCardId}
                className="w-64"
              />
            ))}
          </div>
        )}
        {filteredCards.length === 0 && (
          <div className="text-center text-gray-400 mt-10">
            <p>Нет карточек, соответствующих вашему запросу.</p>
            <p className="text-sm">Попробуйте выделить текст слева, чтобы создать новую карточку.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardManager;