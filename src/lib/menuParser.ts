// Ported from NutriScan MenuParser.kt
const COMMON_MENU_WORDS = [
  'burger', 'pizza', 'salad', 'pasta', 'chicken', 'steak', 'fish',
  'sandwich', 'wrap', 'rice', 'noodles', 'soup', 'wings', 'fries',
  'taco', 'burrito', 'quesadilla', 'nachos', 'sushi', 'ramen',
]

export function parseMenuText(text: string): string[] {
  const lines = text
    .split('\n')
    .filter((l) => l.trim().length > 0)
    .map((l) => l.trim())

  const menuItems: string[] = []

  for (const line of lines) {
    const lowerLine = line.toLowerCase()
    if (COMMON_MENU_WORDS.some((w) => lowerLine.includes(w)) && line.length > 3) {
      const cleanedItem = line
        .replace(/[0-9]+\.[0-9]+/g, '')
        .replace(/\$[0-9]+/g, '')
        .replace(/[^a-zA-Z0-9\s&'-]/g, '')
        .trim()
      if (cleanedItem && cleanedItem.length > 3) {
        menuItems.push(cleanedItem)
      }
    }
  }

  return [...new Set(menuItems)].slice(0, 20)
}
