import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import TextEditor from './components/TextEditor';
import CardManager from './components/CardManager';
import EditCardPanel from './components/EditCardPanel';
import { Card, CardType, SelectionInfo, ProjectData } from './types';
import { LogoIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, ChevronDownIcon } from './components/Icons';
import { CARD_TYPE_DEFINITIONS } from './constants';

const INITIAL_TEXT = `Добро пожаловать в Requirements Decomposer!

Чтобы начать, замените этот текст своими требованиями.

Пример:
Система должна позволить пользователю (это Роль) зарегистрироваться с помощью электронной почты и пароля. После регистрации пользователь должен иметь возможность создать новый проект (это Объект). Процесс создания проекта (это Сценарий) включает в себя ввод названия, описания и выбор шаблона. У проекта есть свойство: статус (например, 'активен' или 'архивирован') (это Свойство). Возникает вопрос: как обрабатывать удаление пользователя? (это Вопрос).

Выделите любой фрагмент текста, чтобы создать карточку. Карточки появятся в панели справа. Наведите курсор на карточку или на подсвеченный текст, чтобы увидеть связь.`;


function App() {
  const [rawText, setRawText] = useState<string>(INITIAL_TEXT);
  const [cards, setCards] = useState<Card[]>([]);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [isEditingText, setIsEditingText] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  
  const initialVisibleColumns = Object.values(CardType).reduce(
    (acc, type) => ({ ...acc, [type]: true }),
    {} as Record<CardType, boolean>
  );
  const [visibleColumns, setVisibleColumns] = useState<Record<CardType, boolean>>(initialVisibleColumns);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);


  const handleCardCreate = useCallback((selection: SelectionInfo, type: CardType) => {
    const exists = cards.some(card => 
      card.startIndex === selection.startIndex && 
      card.endIndex === selection.endIndex &&
      card.type === type
    );

    if (exists) {
      alert("Карточка с таким текстом и типом уже существует.");
      return;
    }

    const newCard: Card = {
      id: `card-${Date.now()}-${Math.random()}`,
      text: selection.text,
      type: type,
      startIndex: selection.startIndex,
      endIndex: selection.endIndex,
    };
    setCards(prevCards => [...prevCards, newCard].sort((a, b) => a.startIndex - b.startIndex));
  }, [cards]);

  const handleCardDelete = useCallback((cardId: string) => {
    setCards(prevCards => prevCards.filter(card => card.id !== cardId));
    if (activeCardId === cardId) {
      setActiveCardId(null);
    }
     if (editingCardId === cardId) {
      setEditingCardId(null);
    }
  }, [activeCardId, editingCardId]);

  const handleTextUpdate = (newText: string) => {
    setRawText(newText);
    setCards([]);
    setActiveCardId(null);
    setEditingCardId(null);
    setIsEditingText(false);
  };

  const handleCardUpdate = useCallback((cardId: string, updates: Partial<Omit<Card, 'id'>>) => {
    setCards(prevCards =>
        prevCards.map(card =>
            card.id === cardId ? { ...card, ...updates } : card
        )
    );
    setEditingCardId(null);
  }, []);

  const handleCreateArbitraryCard = useCallback((type: CardType) => {
    const newCard: Card = {
        id: `card-${Date.now()}-${Math.random()}`,
        text: 'Новая карточка',
        type: type,
        startIndex: -1,
        endIndex: -1,
    };
    setCards(prevCards => [...prevCards, newCard]);
    setEditingCardId(newCard.id);
  }, []);

  const downloadFile = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsExportMenuOpen(false);
  };

  const handleSaveProject = () => {
    const projectData: ProjectData = {
        rawText,
        cards,
        columnVisibility: visibleColumns
    };
    const jsonString = JSON.stringify(projectData, null, 2);
    downloadFile('requirements-project.json', jsonString, 'application/json');
  };

  const handleExportTXT = () => {
    let content = '';
    const groupedCards = cards.reduce((acc, card) => {
        (acc[card.type] = acc[card.type] || []).push(card);
        return acc;
    }, {} as Record<CardType, Card[]>);

    const typeOrder = Object.values(CardType);

    typeOrder.forEach(type => {
        const cardList = groupedCards[type];
        if (cardList && cardList.length > 0) {
            content += `=== ${CARD_TYPE_DEFINITIONS[type].name} ===\n\n`;
            cardList.sort((a, b) => a.startIndex - b.startIndex).forEach(card => {
                content += `${card.text}\n`;
                if (card.caption) {
                    content += `    ${card.caption.replace(/\n/g, '\n    ')}\n`;
                }
                content += '\n';
            });
        }
    });
    
    downloadFile('requirements-export.txt', content, 'text/plain;charset=utf-8');
  };

  const handleExportCSV = () => {
      const sortedCards = [...cards].sort((a, b) => {
          const typeOrder = Object.values(CardType);
          const typeAIndex = typeOrder.indexOf(a.type);
          const typeBIndex = typeOrder.indexOf(b.type);
          if (typeAIndex !== typeBIndex) {
              return typeAIndex - typeBIndex;
          }
          return a.startIndex - b.startIndex;
      });

      const header = "Type\tText\tCaption\n";
      const sanitize = (str: string = '') => str.replace(/\n|\t/g, ' ');

      const rows = sortedCards.map(card => {
          const type = CARD_TYPE_DEFINITIONS[card.type].name;
          const text = sanitize(card.text);
          const caption = sanitize(card.caption);
          return [type, text, caption].join('\t');
      }).join('\n');

      const content = header + rows;
      downloadFile('requirements-export.csv', content, 'text/csv;charset=utf-8');
  };

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target?.result as string;
            const data: ProjectData = JSON.parse(text);

            if (data && typeof data.rawText === 'string' && Array.isArray(data.cards) && typeof data.columnVisibility === 'object') {
                setRawText(data.rawText);
                setCards(data.cards);
                setVisibleColumns(data.columnVisibility);
                setIsEditingText(false);
                setActiveCardId(null);
                setEditingCardId(null);
            } else {
                alert('Неверный формат файла проекта.');
            }
        } catch (error) {
            console.error("Ошибка при чтении файла проекта:", error);
            alert('Не удалось прочитать файл проекта.');
        }
    };
    reader.readAsText(file);
    
    if (event.target) {
        event.target.value = '';
    }
  };

  const triggerFileLoad = () => {
      fileInputRef.current?.click();
  };

  const sortedCards = useMemo(() => {
    return cards.filter(c => c.startIndex !== -1 && c.endIndex !== -1).sort((a, b) => a.startIndex - b.startIndex);
  }, [cards]);

  const cardToEdit = useMemo(() => {
    return cards.find(c => c.id === editingCardId) || null;
  }, [cards, editingCardId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEditingCardId(null);
        setIsExportMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
            setIsExportMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-200 font-sans">
      <header className="flex items-center p-3 border-b border-gray-700 bg-gray-800/50 shadow-md backdrop-blur-sm z-30">
        <LogoIcon className="h-8 w-8 text-blue-400 mr-3" />
        <h1 className="text-xl font-bold tracking-wider">Requirements Decomposer</h1>
        <div className="ml-auto flex items-center space-x-2">
            <input type="file" ref={fileInputRef} onChange={handleFileSelected} accept=".json" style={{ display: 'none' }} />
            <button
                onClick={triggerFileLoad}
                className="flex items-center px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-500 rounded-md transition-colors"
                title="Загрузить проект"
            >
                <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                Загрузить
            </button>
            <div className="relative" ref={exportMenuRef}>
                <button
                    onClick={() => setIsExportMenuOpen(prev => !prev)}
                    className="flex items-center px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                    title="Сохранить или экспортировать проект"
                >
                    <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                    Сохранить / Экспорт
                    <ChevronDownIcon className={`h-4 w-4 ml-1 transition-transform ${isExportMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isExportMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-gray-700 border border-gray-600 rounded-lg shadow-xl z-20 py-1">
                        <button
                            onClick={handleSaveProject}
                            className="w-full text-left flex items-center px-3 py-2 text-sm text-gray-200 hover:bg-gray-600 transition-colors"
                        >
                            Сохранить проект (.json)
                        </button>
                        <button
                            onClick={handleExportTXT}
                            className="w-full text-left flex items-center px-3 py-2 text-sm text-gray-200 hover:bg-gray-600 transition-colors"
                        >
                            Экспорт в .txt
                        </button>
                        <button
                            onClick={handleExportCSV}
                            className="w-full text-left flex items-center px-3 py-2 text-sm text-gray-200 hover:bg-gray-600 transition-colors"
                        >
                            Экспорт в .csv (табуляция)
                        </button>
                    </div>
                )}
            </div>
        </div>
      </header>
      
      {isEditingText || rawText === INITIAL_TEXT ? (
        <div className="flex flex-col items-center justify-center flex-grow p-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-100">Введите или вставьте текст требований</h2>
            <textarea
                className="w-full h-96 p-4 bg-gray-800 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                defaultValue={rawText === INITIAL_TEXT ? '' : rawText}
                placeholder="Вставьте сюда текст ваших требований..."
                onBlur={(e) => {
                    if(e.target.value.trim()){
                       handleTextUpdate(e.target.value)
                    }
                }}
            />
             <button
                className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                onClick={(e) => {
                    const textarea = e.currentTarget.previousElementSibling as HTMLTextAreaElement;
                    if(textarea.value.trim()){
                        handleTextUpdate(textarea.value);
                    } else if (rawText !== INITIAL_TEXT) {
                         setIsEditingText(false);
                    }
                }}
            >
                {rawText === INITIAL_TEXT ? 'Начать работу' : 'Сохранить и продолжить'}
            </button>
        </div>
      ) : (
        <main className="flex flex-1 overflow-hidden relative">
          <div className="w-1/2 flex flex-col border-r border-gray-700">
             <div className="p-3 border-b border-gray-700 bg-gray-800 flex justify-between items-center">
                <h2 className="text-lg font-semibold">Текст требований</h2>
                <button 
                    onClick={() => setIsEditingText(true)}
                    className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-500 rounded-md transition-colors"
                >
                    Редактировать текст
                </button>
            </div>
            <TextEditor 
              rawText={rawText} 
              cards={sortedCards} 
              activeCardId={activeCardId}
              onCardCreate={handleCardCreate}
              onSetActiveCardId={setActiveCardId}
            />
          </div>
          <div className="w-1/2 flex flex-col">
            <CardManager 
              cards={cards} 
              activeCardId={activeCardId}
              visibleColumns={visibleColumns}
              onVisibleColumnsChange={setVisibleColumns}
              onCardDelete={handleCardDelete}
              onSetActiveCardId={setActiveCardId}
              onSetEditingCardId={setEditingCardId}
              onCardUpdate={handleCardUpdate}
              onCreateArbitraryCard={handleCreateArbitraryCard}
            />
          </div>
          {cardToEdit && (
            <EditCardPanel 
              card={cardToEdit}
              onClose={() => setEditingCardId(null)}
              onSave={handleCardUpdate}
              onDelete={handleCardDelete}
            />
          )}
        </main>
      )}
    </div>
  );
}

export default App;