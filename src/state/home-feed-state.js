export function nextHomeFeedIndex(currentIndex, itemCount) {
  if (!Number.isInteger(itemCount) || itemCount < 1) {
    throw new RangeError('itemCount 必须为正整数')
  }
  if (!Number.isInteger(currentIndex) || currentIndex < 0 || currentIndex >= itemCount) {
    throw new RangeError('currentIndex 必须位于内容列表范围内')
  }
  return (currentIndex + 1) % itemCount
}
