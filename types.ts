export enum CardType {
  Object = 'Object',
  Role = 'Role',
  Scenario = 'Scenario',
  Property = 'Property',
  Question = 'Question',
}

export interface Card {
  id: string;
  text: string;
  caption?: string;
  type: CardType;
  startIndex: number;
  endIndex: number;
}

export type SelectionInfo = {
  text: string;
  startIndex: number;
  endIndex: number;
};

export interface ProjectData {
  rawText: string;
  cards: Card[];
  columnVisibility: Record<CardType, boolean>;
}
