export type Difficulty = 'beginner' | 'intermediate' | 'expert'
export type Feeding = 'carnivore' | 'herbivore' | 'omnivore'
export type WaterType = 'fresh' | 'salt' | 'brackish'

export interface FishSpecs {
  id: number
  product_id: number
  scientific_name: string
  temp_min: number
  temp_max: number
  ph_min: number
  ph_max: number
  adult_size_cm: number
  difficulty: Difficulty
  lifespan_years: number
  feeding: Feeding
  min_volume_liters: number
  water_type: WaterType
}

export interface FishSpecsFormData {
  scientific_name: string
  temp_min: number
  temp_max: number
  ph_min: number
  ph_max: number
  adult_size_cm: number
  difficulty: Difficulty
  lifespan_years: number
  feeding: Feeding
  min_volume_liters: number
  water_type: WaterType
}
