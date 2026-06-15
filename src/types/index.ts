export type Fase = '1' | '2' | '3'
export type RoundPhase = 'resource' | 'building'

export interface Room {
  id: string
  code: string
  fase: Fase
  current_round: number
  current_phase: RoundPhase
  is_active: boolean
}

export interface Player {
  id: string
  room_id: string
  world_name: string
  points: number
  is_host: boolean
  energy: number
  wood: number
  clay: number
  stone: number
  gold: number
  iron: number
  has_done_resource_phase: boolean
}

export interface Task {
  id: string
  name: string
  description: string
  fase: Fase
  energy_reward: number
}

export interface Building {
  id: string
  name: string
  description: string
  fase: Fase
  cost_energy: number
  cost_wood: number
  cost_clay: number
  cost_stone: number
  cost_gold: number
  cost_iron: number
  produces_wood: number
  produces_clay: number
  produces_stone: number
  produces_gold: number
  produces_iron: number
  effect_description: string | null
  points_value: number
  requires_building_id: string | null
  doubles_fase2_energy: boolean
  gives_energy_each_round: number
}

export interface PlayerBuilding {
  id: string
  player_id: string
  building_id: string
  building?: Building
}

export interface RoundTaskCard {
  id: string
  player_id: string
  task_id: string
  round_number: number
  is_chosen: boolean
  is_completed: boolean
  task?: Task
}