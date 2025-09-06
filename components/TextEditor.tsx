
import React, { useState, useRef, useCallback, useMemo } from 'react';
import { Card, CardType, SelectionInfo } from '../types';
import { CARD_TYPE_DEFINITIONS } from '../constants';
import SelectionPopup from './SelectionPopup';

interface TextEditorProps {
  rawText: string;
  cards: Card[];
  activeCardId: string | null;
  onCardCreate: (selection: SelectionInfo, type: CardType) => void;
  onSetActiveCardId: (id: string | null) => void;
}

const getSelectionInfo = (container: HTMLElement): SelectionInfo | null => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    return null;
  }

  const range = selection.getRangeAt(0);
  if (!container.contains(range.commonAncestorContainer)) {
    return null;
  }

  const text = selection.toString().trim();
  if (text.length === 0) {
    return null;
  }
  
  const preSelectionRange = document.createRange();
  preSelectionRange.selectNodeContents(container);
  preSelectionRange.setEnd(range.startContainer, range.startOffset);
  const startIndex = preSelectionRange.toString().length;
  
  return {
    text,
    startIndex,
    endIndex: startIndex + text.length,
  };
};

const TextEditor: React.FC<TextEditorProps> = ({ rawText, cards, activeCardId, onCardCreate, onSetActiveCardId }) => {
  const [popup, setPopup] = useState<{ x: number, y: number, selection: SelectionInfo } | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const handleMouseUp = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!editorRef.current) return;
    
    // Check if the click was on an existing highlight to prevent new selection
    const target = event.target as HTMLElement;
    if (target.closest('[data-card-id]')) {
        setPopup(null);
        return;
    }

    const selectionInfo = getSelectionInfo(editorRef.current);
    if (selectionInfo) {
      setPopup({ x: event.clientX, y: event.clientY, selection: selectionInfo });
    } else {
      setPopup(null);
    }
  };

  const handleCardTypeSelect = (type: CardType) => {
    if (popup) {
      onCardCreate(popup.selection, type);
    }
    setPopup(null);
  };
  
  const renderHighlightedText = useMemo(() => {
    let lastIndex = 0;
    const parts: React.ReactNode[] = [];

    cards.forEach(card => {
      if (card.startIndex > lastIndex) {
        parts.push(rawText.substring(lastIndex, card.startIndex));
      }

      const { bgColor } = CARD_TYPE_DEFINITIONS[card.type];
      const isActive = card.id === activeCardId;

      parts.push(
        <mark
          key={card.id}
          data-card-id={card.id}
          onMouseEnter={() => onSetActiveCardId(card.id)}
          onMouseLeave={() => onSetActiveCardId(null)}
          className={`px-1 rounded cursor-pointer transition-all duration-200 ${bgColor} ${isActive ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-white' : ''}`}
        >
          {card.text}
        </mark>
      );
      lastIndex = card.endIndex;
    });

    if (lastIndex < rawText.length) {
      parts.push(rawText.substring(lastIndex));
    }

    return parts;
  }, [rawText, cards, activeCardId, onSetActiveCardId]);

  return (
    <div className="flex-1 overflow-auto p-6 bg-gray-800" onMouseUp={handleMouseUp} ref={editorRef}>
      <div className="text-lg leading-relaxed whitespace-pre-wrap select-text">
        {renderHighlightedText.map((part, i) => <React.Fragment key={i}>{part}</React.Fragment>)}
      </div>
      {popup && (
        <SelectionPopup
          position={{ x: popup.x, y: popup.y }}
          onSelectType={handleCardTypeSelect}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  );
};

export default TextEditor;
