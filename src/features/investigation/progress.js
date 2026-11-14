export function earnStamp(earnedIds, id) {
  if (![1, 2, 3, 4].includes(id) || earnedIds.includes(id)) return earnedIds;
  return [...earnedIds, id];
}
