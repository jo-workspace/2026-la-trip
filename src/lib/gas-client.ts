import {
  AllTripData,
  ItineraryItem,
  TodoItem,
  PackingItem,
  ExpenseItem,
  ShoppingItem
} from '@/types/trip';

const DEFAULT_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwuT0HjqVqIpY9fO-zHC9xuG_U6et5AsYE9qkhR8_PqvLG3vTWdxRGERLbeEXzo4iUQ/exec";

export function getScriptUrl(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('la_trip_api_url');
    if (saved && saved.includes('/macros/s/') && saved.includes('/exec')) {
      return saved;
    }
  }
  return DEFAULT_SCRIPT_URL;
}

export function getApiToken(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('la_trip_api_token') || '';
  }
  return '';
}

export function setScriptUrl(url: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('la_trip_api_url', url);
  }
}

export function setApiToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('la_trip_api_token', token);
  }
}

/**
 * 通用 Apps Script API 呼叫器
 */
export async function callGasApi<T>(action: string, args: any[] = []): Promise<T> {
  const scriptUrl = getScriptUrl();
  const token = getApiToken();

  const requestBody = {
    action,
    token,
    args
  };

  const res = await fetch(scriptUrl, {
    method: 'POST',
    mode: 'cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(requestBody)
  });

  if (!res.ok) {
    throw new Error(`HTTP 錯誤狀態: ${res.status}`);
  }

  const text = await res.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch (e) {
    if (text.includes("<!DOCTYPE html>") || text.includes("<html")) {
      throw new Error("API 網址回傳了 HTML 網頁而非 JSON。請確認 Web App 部署權限。");
    }
    throw new Error(`回傳格式非 JSON: ${text.substring(0, 100)}...`);
  }

  if (json && (json.error || json.status === 'error')) {
    const err = json.error || "API 執行失敗";
    if (/unauthorized/i.test(err) || /invalid token/i.test(err)) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('la_trip_api_token');
      }
    }
    throw new Error(err);
  }

  return (json && json.result !== undefined) ? json.result : json;
}

/** 獲取所有資料 */
export async function getAllData(bypassCache = false): Promise<AllTripData> {
  return callGasApi<AllTripData>('getAllData', [bypassCache]);
}

/** 行程 API */
export async function saveItineraryData(formData: any): Promise<string> {
  return callGasApi<string>('saveItineraryData', [formData]);
}

export async function deleteItineraryData(rowIndex: number): Promise<string> {
  return callGasApi<string>('deleteItineraryData', [rowIndex]);
}

export async function toggleVisitedStatus(rowIndex: number, isChecked: boolean): Promise<string> {
  return callGasApi<string>('toggleVisitedStatus', [rowIndex, isChecked]);
}

/** 待辦 API */
export async function saveTodoData(formData: any): Promise<string> {
  return callGasApi<string>('saveTodoData', [formData]);
}

export async function deleteTodoData(rowIndex: number): Promise<string> {
  return callGasApi<string>('deleteTodoData', [rowIndex]);
}

export async function toggleTodoStatus(rowIndex: number, isChecked: boolean): Promise<string> {
  return callGasApi<string>('toggleTodoStatus', [rowIndex, isChecked]);
}

/** 打包 API */
export async function savePackingData(formData: any): Promise<string> {
  return callGasApi<string>('savePackingData', [formData]);
}

export async function deletePackingData(rowIndex: number): Promise<string> {
  return callGasApi<string>('deletePackingData', [rowIndex]);
}

export async function togglePackingStatus(rowIndex: number, isChecked: boolean): Promise<string> {
  return callGasApi<string>('togglePackingStatus', [rowIndex, isChecked]);
}

/** 記帳 API */
export async function addExpenseData(formData: any): Promise<string> {
  return callGasApi<string>('addExpenseData', [formData]);
}

export async function deleteExpenseData(rowIndex: number): Promise<string> {
  return callGasApi<string>('deleteExpenseData', [rowIndex]);
}

/** 購物 API */
export async function saveShoppingData(formData: any): Promise<string> {
  return callGasApi<string>('saveShoppingData', [formData]);
}

export async function deleteShoppingData(rowIndex: number): Promise<string> {
  return callGasApi<string>('deleteShoppingData', [rowIndex]);
}

export async function toggleShoppingStatus(rowIndex: number, isChecked: boolean): Promise<string> {
  return callGasApi<string>('toggleShoppingStatus', [rowIndex, isChecked]);
}
