export type ActivityLevel = 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'ACTIVE' | 'VERY_ACTIVE'
export type HealthGoal = 'LOSE_WEIGHT' | 'MAINTAIN' | 'GAIN_MUSCLE' | 'HEART_HEALTH' | 'LOW_CARB'

export interface NutritionInfo {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sugar: number
  sodium: number
}

export interface MenuItem {
  name: string
  nutritionInfo: NutritionInfo | null
  allergens: string[]
  healthScore: number
  source: 'usda' | 'estimated'
}

export interface UserProfile {
  name: string
  age: number
  weight: number
  height: number
  gender: string
  activityLevel: ActivityLevel
  healthGoal: HealthGoal
  dietaryRestrictions: string
  allergens: string
  dailyCalorieTarget: number
  usdaApiKey: string
}

export interface ScanHistory {
  id: number
  restaurantName: string
  menuItems: string
  averageHealthScore: number
  timestamp: number
}

export const DEFAULT_PROFILE: UserProfile = {
  name: '',
  age: 0,
  weight: 0,
  height: 0,
  gender: '',
  activityLevel: 'MODERATE',
  healthGoal: 'MAINTAIN',
  dietaryRestrictions: '',
  allergens: '',
  dailyCalorieTarget: 2000,
  usdaApiKey: '',
}

export const HEALTH_GOAL_LABELS: Record<HealthGoal, string> = {
  LOSE_WEIGHT: 'Lose Weight',
  MAINTAIN: 'Maintain',
  GAIN_MUSCLE: 'Gain Muscle',
  HEART_HEALTH: 'Heart Health',
  LOW_CARB: 'Low Carb',
}
