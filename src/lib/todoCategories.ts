// 通用待辦分類，適用於任何旅程（不綁定特定旅程的時程或月份）
export const TODO_CATEGORY_PRESETS = ['證件保險', '機票住宿', '行前準備', '出發當天', '其他'];

// 已知分類依上表順序排序；自訂分類排在已知分類之後，彼此再依字母排序
export function compareTodoCategories(a: string, b: string): number {
  const idxA = TODO_CATEGORY_PRESETS.indexOf(a);
  const idxB = TODO_CATEGORY_PRESETS.indexOf(b);
  if (idxA !== -1 && idxB !== -1) return idxA - idxB;
  if (idxA !== -1) return -1;
  if (idxB !== -1) return 1;
  return a.localeCompare(b, 'zh-Hant');
}
