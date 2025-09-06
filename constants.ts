
import { CardType } from './types';
import { CubeIcon, UserCircleIcon, PlayIcon, TagIcon, QuestionMarkCircleIcon } from './components/Icons';

export const CARD_TYPE_DEFINITIONS: { [key in CardType]: { name: string; color: string; bgColor: string; icon: React.FC<React.SVGProps<SVGSVGElement>>; } } = {
  [CardType.Object]: {
    name: 'Объект',
    color: 'text-blue-300',
    bgColor: 'bg-blue-500/20',
    icon: CubeIcon,
  },
  [CardType.Role]: {
    name: 'Роль',
    color: 'text-green-300',
    bgColor: 'bg-green-500/20',
    icon: UserCircleIcon,
  },
  [CardType.Scenario]: {
    name: 'Сценарий',
    color: 'text-purple-300',
    bgColor: 'bg-purple-500/20',
    icon: PlayIcon,
  },
  [CardType.Property]: {
    name: 'Свойство',
    color: 'text-yellow-300',
    bgColor: 'bg-yellow-500/20',
    icon: TagIcon,
  },
  [CardType.Question]: {
    name: 'Вопрос',
    color: 'text-red-300',
    bgColor: 'bg-red-500/20',
    icon: QuestionMarkCircleIcon,
  },
};
