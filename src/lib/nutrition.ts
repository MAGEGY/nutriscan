import type { MenuItem, NutritionInfo, UserProfile } from './types'

// Ported from NutriScan NutritionRepository.kt
export function estimateNutrition(foodName: string): NutritionInfo {
  const lowerName = foodName.toLowerCase()

  if (lowerName.includes('salad')) return { calories: 150, protein: 5, carbs: 15, fat: 8, fiber: 4, sugar: 5, sodium: 300 }
  if (lowerName.includes('burger')) return { calories: 550, protein: 25, carbs: 45, fat: 28, fiber: 2, sugar: 8, sodium: 900 }
  if (lowerName.includes('pizza')) return { calories: 285, protein: 12, carbs: 36, fat: 10, fiber: 2, sugar: 4, sodium: 640 }
  if (lowerName.includes('pasta')) return { calories: 350, protein: 12, carbs: 55, fat: 8, fiber: 3, sugar: 4, sodium: 450 }
  if (lowerName.includes('chicken')) return { calories: 280, protein: 30, carbs: 10, fat: 14, fiber: 1, sugar: 2, sodium: 520 }
  if (lowerName.includes('fish')) return { calories: 220, protein: 28, carbs: 5, fat: 10, fiber: 0, sugar: 1, sodium: 380 }
  if (lowerName.includes('steak')) return { calories: 380, protein: 35, carbs: 0, fat: 26, fiber: 0, sugar: 0, sodium: 450 }
  return { calories: 300, protein: 15, carbs: 35, fat: 12, fiber: 2, sugar: 5, sodium: 500 }
}

export function detectAllergens(foodName: string): string[] {
  const allergens: string[] = []
  const lowerName = foodName.toLowerCase()

  if (/dairy|cheese|milk|cream/.test(lowerName)) allergens.push('Dairy')
  if (/gluten|bread|pasta|wheat/.test(lowerName)) allergens.push('Gluten')
  if (/nut|peanut|almond/.test(lowerName)) allergens.push('Nuts')
  if (/shellfish|shrimp|crab|lobster/.test(lowerName)) allergens.push('Shellfish')
  if (lowerName.includes('egg')) allergens.push('Eggs')
  if (/soy|tofu/.test(lowerName)) allergens.push('Soy')

  return allergens
}

export function calculateHealthScore(
  nutrition: NutritionInfo,
  allergens: string[],
  profile: UserProfile,
): number {
  let score = 50

  if (nutrition.calories < 400) score += 10
  if (nutrition.calories > 700) score -= 15

  if (nutrition.protein > 20) score += 10
  if (nutrition.protein < 5) score -= 5

  if (nutrition.fiber > 5) score += 10
  if (nutrition.sugar > 15) score -= 10

  if (nutrition.fat > 25) score -= 10
  if (nutrition.fat < 10) score += 5

  if (nutrition.sodium > 800) score -= 15
  if (nutrition.sodium < 400) score += 5

  switch (profile.healthGoal) {
    case 'LOSE_WEIGHT':
      if (nutrition.calories < 300) score += 15
      if (nutrition.fat < 10) score += 10
      break
    case 'GAIN_MUSCLE':
      if (nutrition.protein > 25) score += 15
      break
    case 'LOW_CARB':
      if (nutrition.carbs < 20) score += 15
      break
    case 'HEART_HEALTH':
      if (nutrition.sodium < 400) score += 10
      if (nutrition.fat < 15) score += 10
      break
    default:
      break
  }

  const userAllergens = profile.allergens.split(',').map((a) => a.trim().toLowerCase())
  for (const allergen of allergens) {
    if (userAllergens.includes(allergen.toLowerCase())) {
      score = 0
    }
  }

  return Math.min(Math.max(score, 0), 100)
}

// Optional real lookups via USDA FoodData Central (user-provided key, stored locally)
interface USDANutrient {
  nutrientId: number
  value: number
}

export async function fetchNutritionData(foodName: string, profile: UserProfile): Promise<MenuItem> {
  const allergens = detectAllergens(foodName)

  if (profile.usdaApiKey) {
    try {
      const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(foodName)}&api_key=${encodeURIComponent(profile.usdaApiKey)}&pageSize=5&dataType=Survey%20(FNDDS)`
      const res = await fetch(url)
      if (res.ok) {
        const data = (await res.json()) as { foods?: { foodNutrients?: USDANutrient[] }[] }
        const food = data.foods?.[0]
        if (food) {
          const n = parseUSDANutrients(food.foodNutrients ?? [])
          return {
            name: foodName,
            nutritionInfo: n,
            allergens,
            healthScore: calculateHealthScore(n, allergens, profile),
            source: 'usda',
          }
        }
      }
    } catch {
      // fall through to estimation
    }
  }

  const estimated = estimateNutrition(foodName)
  return {
    name: foodName,
    nutritionInfo: estimated,
    allergens,
    healthScore: calculateHealthScore(estimated, allergens, profile),
    source: 'estimated',
  }
}

function parseUSDANutrients(nutrients: USDANutrient[]): NutritionInfo {
  const get = (id: number) => nutrients.find((n) => n.nutrientId === id)?.value ?? 0
  return {
    calories: Math.round(get(1008)),
    protein: get(1003),
    carbs: get(1005),
    fat: get(1004),
    fiber: get(1079),
    sugar: get(2000),
    sodium: Math.round(get(1093)),
  }
}
