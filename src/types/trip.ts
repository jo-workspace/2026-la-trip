export interface ItineraryItem {
  rowIndex: number;
  day: string;
  date?: string;
  time?: string;
  type: string;
  title: string;
  content?: string;
  links?: string;
  isVisited: boolean;
}

export interface TodoItem {
  rowIndex: number;
  category: string;
  task: string;
  note?: string;
  isDone: boolean;
}

export interface PackingItem {
  rowIndex: number;
  category: string;
  person: string;
  item: string;
  note?: string;
  isPacked: boolean;
}

export interface ExpenseItem {
  rowIndex: number;
  category: string;
  item: string;
  amount: number;
  currency: 'USD' | 'TWD' | string;
  paidBy: 'Jo' | 'Will' | string;
  split: 'Jo' | 'Will' | 'Both' | string;
  note?: string;
  date?: string;
}

export interface ShoppingItem {
  rowIndex: number;
  store: string;
  forWhom: string;
  item: string;
  quantity?: string;
  image?: string;
  url?: string;
  note?: string;
  isDone: boolean;
}

export interface AllTripData {
  itinerary: ItineraryItem[];
  todo: TodoItem[];
  packing: PackingItem[];
  expenses: ExpenseItem[];
  shopping: ShoppingItem[];
  fxRate: number;
  tripNote: string;
  startDate?: string; // YYYY-MM-DD，旅程起始日，用於自動計算每天日期
}
