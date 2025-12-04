import { Book, Highlight, StudyCard, Tag } from '../types';
import { initializeCard } from './sm2';

export const MOCK_TAGS: Tag[] = [
  { id: 't1', name: 'Productivity' },
  { id: 't2', name: 'Psychology' },
  { id: 't3', name: 'Philosophy' },
  { id: 't4', name: 'Stoicism', parentId: 't3' },
  { id: 't5', name: 'Habits', parentId: 't1' }
];

export const MOCK_BOOKS: Book[] = [
  {
    id: 'b1',
    title: 'Atomic Habits',
    author: 'James Clear',
    lastImported: new Date().toISOString(),
    highlightCount: 5,
    coverUrl: 'https://picsum.photos/300/450?random=1'
  },
  {
    id: 'b2',
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    lastImported: new Date().toISOString(),
    highlightCount: 3,
    coverUrl: 'https://picsum.photos/300/450?random=2'
  },
  {
    id: 'b3',
    title: 'Deep Work',
    author: 'Cal Newport',
    lastImported: new Date().toISOString(),
    highlightCount: 4,
    coverUrl: 'https://picsum.photos/300/450?random=3'
  }
];

export const MOCK_HIGHLIGHTS: Highlight[] = [
  { id: 'h1', bookId: 'b1', text: 'You do not rise to the level of your goals. You fall to the level of your systems.', location: '27', dateAdded: new Date().toISOString(), tags: ['t1', 't5'] },
  { id: 'h2', bookId: 'b1', text: 'Habits are the compound interest of self-improvement.', location: '15', dateAdded: new Date().toISOString(), tags: ['t5'] },
  { id: 'h3', bookId: 'b1', text: 'Be the designer of your world and not merely the consumer of it.', location: '90', dateAdded: new Date().toISOString() },
  { id: 'h4', bookId: 'b1', text: 'Every action you take is a vote for the type of person you wish to become.', location: '45', dateAdded: new Date().toISOString() },
  { id: 'h5', bookId: 'b1', text: 'When you fall in love with the process rather than the product, you don’t have to wait to give yourself permission to be happy.', location: '120', dateAdded: new Date().toISOString() },
  { id: 'h6', bookId: 'b2', text: 'Nothing in life is as important as you think it is, while you are thinking about it.', location: '402', dateAdded: new Date().toISOString(), tags: ['t2'] },
  { id: 'h7', bookId: 'b2', text: 'We are prone to overestimate how much we understand about the world.', location: '15', dateAdded: new Date().toISOString(), tags: ['t2'] },
  { id: 'h8', bookId: 'b2', text: 'The confidence that individuals have in their beliefs depends mostly on the quality of the story they can tell about what they see, even if they see little.', location: '89', dateAdded: new Date().toISOString() },
  { id: 'h9', bookId: 'b3', text: 'The ability to perform deep work is becoming increasingly rare at exactly the same time it is becoming increasingly valuable in our economy.', location: '12', dateAdded: new Date().toISOString(), tags: ['t1'] },
  { id: 'h10', bookId: 'b3', text: 'Clarity about what matters provides clarity about what does not.', location: '55', dateAdded: new Date().toISOString() },
  { id: 'h11', bookId: 'b3', text: 'To produce at your peak level you need to work for extended periods with full concentration on a single task free from distraction.', location: '70', dateAdded: new Date().toISOString() },
  { id: 'h12', bookId: 'b3', text: 'If you don’t produce, you won’t thrive—no matter how skilled or talented you are.', location: '23', dateAdded: new Date().toISOString() },
];

export const MOCK_CARDS: StudyCard[] = MOCK_HIGHLIGHTS.map(h => initializeCard(h.id));