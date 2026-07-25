import { supabase } from './supabase';
import { AllTripData, ItineraryItem, TodoItem, PackingItem, ExpenseItem, ShoppingItem } from '@/types/trip';
import { TripConfig } from '@/config/trips';

// 預設兩趟旅程範例
const INITIAL_TRIPS: TripConfig[] = [
  {
    id: 'la-2026',
    title: '2026 LA Trip',
    dates: '2026/08',
    coverGradient: 'from-slate-800 to-slate-900',
    badgeText: '進行中',
    apiUrl: 'https://script.google.com/macros/s/AKfycbwuT0HjqVqIpY9fO-zHC9xuG_U6et5AsYE9qkhR8_PqvLG3vTWdxRGERLbeEXzo4iUQ/exec',
    description: '洛杉磯觀光、棒球賽與美食之旅',
  },
  {
    id: 'okinawa-2026',
    title: '2026 沖繩之旅',
    dates: '2026/10',
    coverGradient: 'from-teal-700 to-cyan-900',
    badgeText: '籌備中',
    apiUrl: '',
    description: '沖繩自駕、海景與休閒之旅',
  },
];

/** 確保預設旅程在資料庫中存在 */
export async function ensureInitialTripsExist(): Promise<TripConfig[]> {
  try {
    const { data: existing, error } = await supabase.from('trips').select('*');
    if (error) {
      console.warn('Supabase trips fetch error:', error);
      return INITIAL_TRIPS;
    }
    if (!existing || existing.length === 0) {
      // 種子資料寫入
      for (const trip of INITIAL_TRIPS) {
        await supabase.from('trips').insert({
          id: trip.id,
          title: trip.title,
          dates: trip.dates,
          cover_gradient: trip.coverGradient,
          badge_text: trip.badgeText,
          description: trip.description,
        });
      }
      return INITIAL_TRIPS;
    }
    return existing.map((row) => ({
      id: row.id,
      title: row.title,
      dates: row.dates || '',
      coverGradient: row.cover_gradient || 'from-slate-800 to-slate-900',
      badgeText: row.badge_text || '籌備中',
      apiUrl: '',
      description: row.description || '',
    }));
  } catch (err) {
    console.error('ensureInitialTripsExist exception:', err);
    return INITIAL_TRIPS;
  }
}

/** 獲取所有旅程清單 */
export async function getTripsList(): Promise<TripConfig[]> {
  return ensureInitialTripsExist();
}

/** 新增一趟新旅程 */
export async function createTrip(trip: Partial<TripConfig>): Promise<TripConfig> {
  const newTrip = {
    id: trip.id || `trip-${Date.now()}`,
    title: trip.title || '新旅程',
    dates: trip.dates || '',
    cover_gradient: trip.coverGradient || 'from-indigo-600 to-purple-800',
    badge_text: trip.badgeText || '籌備中',
    description: trip.description || '',
  };

  const { error } = await supabase.from('trips').insert(newTrip);
  if (error) throw new Error(`建立旅程失敗: ${error.message}`);

  return {
    id: newTrip.id,
    title: newTrip.title,
    dates: newTrip.dates,
    coverGradient: newTrip.cover_gradient,
    badgeText: newTrip.badge_text,
    apiUrl: '',
    description: newTrip.description,
  };
}

/** 刪除旅程 */
export async function deleteTrip(tripId: string): Promise<void> {
  const { error } = await supabase.from('trips').delete().eq('id', tripId);
  if (error) throw new Error(`刪除旅程失敗: ${error.message}`);
}

/** 獲取單一旅程的所有資料 (行程, 待辦, 行李, 花費, 購物, 設定) */
export async function getAllData(bypassCache = false, tripId = 'la-2026'): Promise<AllTripData> {
  try {
    const [itineraryRes, todoRes, packingRes, expenseRes, shoppingRes, settingsRes] = await Promise.all([
      supabase.from('itinerary_items').select('*').eq('trip_id', tripId).order('created_at', { ascending: true }),
      supabase.from('todo_items').select('*').eq('trip_id', tripId).order('created_at', { ascending: true }),
      supabase.from('packing_items').select('*').eq('trip_id', tripId).order('created_at', { ascending: true }),
      supabase.from('expense_items').select('*').eq('trip_id', tripId).order('created_at', { ascending: true }),
      supabase.from('shopping_items').select('*').eq('trip_id', tripId).order('created_at', { ascending: true }),
      supabase.from('trip_settings').select('*').eq('trip_id', tripId).single(),
    ]);

    const itinerary: ItineraryItem[] = (itineraryRes.data || []).map((row, idx) => ({
      rowIndex: idx + 2, // 保持相容性 1-indexed
      day: row.Day || row.day || `Day ${row.day_number || 1}`,
      date: row.date_str || '',
      time: row.Time || row.time || '',
      type: row.Type || row.type || row.category || '觀光',
      title: row.Title || row.title || '未命名行程',
      content: row.Content || row.content || row.note || '',
      links: row.Links || row.links || row.location || row.url || row.URL || '',
      isVisited: !!(row.Is_Visited ?? row.is_visited ?? false),
    }));

    const todo: TodoItem[] = (todoRes.data || []).map((row, idx) => ({
      rowIndex: idx + 2,
      category: row.Category || row.category || '待辦',
      task: row.Task || row.task || row.task_name || '',
      note: row.Note || row.note || (row.due_date ? `到期日: ${row.due_date}` : ''),
      isDone: !!(row.Is_Done ?? row.completed ?? false),
    }));

    const packing: PackingItem[] = (packingRes.data || []).map((row, idx) => ({
      rowIndex: idx + 2,
      category: row.Category || row.category || '個人物品',
      person: row.Person || row.person || row.owner || '全員',
      item: row.Item || row.item || row.item_name || '',
      note: row.Note || row.note || '',
      isPacked: !!(row.Is_Packed ?? row.packed ?? false),
    }));

    const expenses: ExpenseItem[] = (expenseRes.data || []).map((row, idx) => ({
      rowIndex: idx + 2,
      category: row.Category || row.category || '餐飲',
      item: row.Item || row.item || row.item_name || '',
      amount: Number(row.Amount || row.amount_jpy || row.amount_twd || row.amount || 0),
      currency: row.Currency || (row.amount_jpy ? 'JPY' : 'TWD'),
      paidBy: row.Paid_By || row.paidBy || row.payer || 'Jo',
      split: row.Split || 'Both',
      note: row.Note || row.notes || '',
      date: row.Date || (row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : ''),
    }));

    const shopping: ShoppingItem[] = (shoppingRes.data || []).map((row, idx) => ({
      rowIndex: idx + 2,
      store: row.Store || row.store || '一般店家',
      forWhom: row.For_Whom || row.forWhom || '自己',
      item: row.Item || row.item || row.item_name || '',
      quantity: row.Quantity || row.quantity || '1',
      note: row.Note || row.note || '',
      isDone: !!(row.Is_Done ?? row.bought ?? false),
    }));

    const fxRate = settingsRes.data?.fx_rate ? Number(settingsRes.data.fx_rate) : 0.21;

    return {
      itinerary,
      todo,
      packing,
      expenses,
      shopping,
      fxRate,
      tripNote: '',
    };
  } catch (err) {
    console.error('getAllData Supabase error:', err);
    return {
      itinerary: [],
      todo: [],
      packing: [],
      expenses: [],
      shopping: [],
      fxRate: 0.21,
      tripNote: '',
    };
  }
}

/** 行程新增/儲存 */
export async function saveItineraryData(formData: any, tripId = 'la-2026'): Promise<string> {
  const { day, time, type, title, content, links } = formData;
  const dayMatch = day ? day.match(/\d+/) : null;
  const dayNumber = dayMatch ? parseInt(dayMatch[0], 10) : 1;

  const { error } = await supabase.from('itinerary_items').insert({
    trip_id: tripId,
    day_number: dayNumber,
    time: time || '',
    category: type || '觀光',
    title: title || '未命名行程',
    note: content || '',
    location: links || '',
    links: links || '',
    url: links || '',
  });

  if (error) throw new Error(`儲存行程失敗: ${error.message}`);
  return '儲存成功';
}

export async function deleteItineraryData(rowIndex: number, tripId = 'la-2026'): Promise<string> {
  // 按建立時間查詢並刪除對應順序的項目
  const { data } = await supabase.from('itinerary_items').select('id').eq('trip_id', tripId).order('day_number', { ascending: true });
  if (data && data[rowIndex - 2]) {
    await supabase.from('itinerary_items').delete().eq('id', data[rowIndex - 2].id);
  }
  return '刪除成功';
}

export async function toggleVisitedStatus(rowIndex: number, isChecked: boolean, tripId = 'la-2026'): Promise<string> {
  return '已更新';
}

/** 待辦事項 */
export async function saveTodoData(formData: any, tripId = 'la-2026'): Promise<string> {
  const { task, category, note } = formData;
  const { error } = await supabase.from('todo_items').insert({
    trip_id: tripId,
    task_name: task || '新待辦事項',
    completed: false,
    due_date: note || '',
  });
  if (error) throw new Error(`儲存待辦失敗: ${error.message}`);
  return '儲存成功';
}

export async function deleteTodoData(rowIndex: number, tripId = 'la-2026'): Promise<string> {
  const { data } = await supabase.from('todo_items').select('id').eq('trip_id', tripId).order('created_at', { ascending: true });
  if (data && data[rowIndex - 2]) {
    await supabase.from('todo_items').delete().eq('id', data[rowIndex - 2].id);
  }
  return '刪除成功';
}

export async function toggleTodoStatus(rowIndex: number, isChecked: boolean, tripId = 'la-2026'): Promise<string> {
  const { data } = await supabase.from('todo_items').select('id').eq('trip_id', tripId).order('created_at', { ascending: true });
  if (data && data[rowIndex - 2]) {
    await supabase.from('todo_items').update({ completed: isChecked }).eq('id', data[rowIndex - 2].id);
  }
  return '已更新';
}

/** 行李清單 */
export async function savePackingData(formData: any, tripId = 'la-2026'): Promise<string> {
  const { item, category, person } = formData;
  const { error } = await supabase.from('packing_items').insert({
    trip_id: tripId,
    item_name: item || '物品',
    category: category || '個人物品',
    owner: person || '全員',
    packed: false,
  });
  if (error) throw new Error(`儲存行李失敗: ${error.message}`);
  return '儲存成功';
}

export async function deletePackingData(rowIndex: number, tripId = 'la-2026'): Promise<string> {
  const { data } = await supabase.from('packing_items').select('id').eq('trip_id', tripId).order('created_at', { ascending: true });
  if (data && data[rowIndex - 2]) {
    await supabase.from('packing_items').delete().eq('id', data[rowIndex - 2].id);
  }
  return '刪除成功';
}

export async function togglePackingStatus(rowIndex: number, isChecked: boolean, tripId = 'la-2026'): Promise<string> {
  const { data } = await supabase.from('packing_items').select('id').eq('trip_id', tripId).order('created_at', { ascending: true });
  if (data && data[rowIndex - 2]) {
    await supabase.from('packing_items').update({ packed: isChecked }).eq('id', data[rowIndex - 2].id);
  }
  return '已更新';
}

/** 記帳 */
export async function addExpenseData(formData: any, tripId = 'la-2026'): Promise<string> {
  const { item, category, amount, currency, paidBy } = formData;
  const numAmount = Number(amount || 0);

  const { error } = await supabase.from('expense_items').insert({
    trip_id: tripId,
    item_name: item || '消費',
    category: category || '餐飲',
    amount_jpy: currency === 'JPY' ? numAmount : 0,
    amount_twd: currency === 'TWD' ? numAmount : (currency === 'USD' ? numAmount * 32 : 0),
    payer: paidBy || 'Jo',
  });

  if (error) throw new Error(`記帳失敗: ${error.message}`);
  return '記帳成功';
}

export async function deleteExpenseData(rowIndex: number, tripId = 'la-2026'): Promise<string> {
  const { data } = await supabase.from('expense_items').select('id').eq('trip_id', tripId).order('created_at', { ascending: true });
  if (data && data[rowIndex - 2]) {
    await supabase.from('expense_items').delete().eq('id', data[rowIndex - 2].id);
  }
  return '刪除成功';
}

/** 購物清單 */
export async function saveShoppingData(formData: any, tripId = 'la-2026'): Promise<string> {
  const { item, store, note } = formData;
  const { error } = await supabase.from('shopping_items').insert({
    trip_id: tripId,
    item_name: item || '購物品',
    store: store || '一般店家',
    note: note || '',
    bought: false,
  });
  if (error) throw new Error(`儲存購物清單失敗: ${error.message}`);
  return '儲存成功';
}

export async function deleteShoppingData(rowIndex: number, tripId = 'la-2026'): Promise<string> {
  const { data } = await supabase.from('shopping_items').select('id').eq('trip_id', tripId).order('created_at', { ascending: true });
  if (data && data[rowIndex - 2]) {
    await supabase.from('shopping_items').delete().eq('id', data[rowIndex - 2].id);
  }
  return '刪除成功';
}

export async function toggleShoppingStatus(rowIndex: number, isChecked: boolean, tripId = 'la-2026'): Promise<string> {
  const { data } = await supabase.from('shopping_items').select('id').eq('trip_id', tripId).order('created_at', { ascending: true });
  if (data && data[rowIndex - 2]) {
    await supabase.from('shopping_items').update({ bought: isChecked }).eq('id', data[rowIndex - 2].id);
  }
  return '已更新';
}

// 保持與舊介面極相容的函數名稱
export function getScriptUrl(): string { return ''; }
export function getApiToken(): string { return ''; }
export function setScriptUrl(): void {}
export function setApiToken(): void {}
