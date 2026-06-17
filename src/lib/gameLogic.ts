import type { Fase, Player, Building, PlayerBuilding } from '../types'

export function getFaseFromPoints(maxPoints: number): Fase {
  if (maxPoints >= 50) return '3'
  if (maxPoints >= 10) return '2'
  return '1'
}

export function checkWin(maxPoints: number): boolean {
  return maxPoints >= 200
}

export function canAffordBuilding(player: Player, building: Building): boolean {
  return (
    player.energy >= building.cost_energy &&
    player.wood >= building.cost_wood &&
    player.clay >= building.cost_clay &&
    player.stone >= building.cost_stone &&
    player.gold >= building.cost_gold &&
    player.iron >= building.cost_iron
  )
}

export function playerOwnsBuilding(
  playerBuildings: PlayerBuilding[],
  buildingId: string
): boolean {
  return playerBuildings.some((pb) => pb.building_id === buildingId)
}

export function calcBuildingProduction(buildings: Building[]) {
  return buildings.reduce(
    (acc, b) => ({
      wood: acc.wood + b.produces_wood,
      clay: acc.clay + b.produces_clay,
      stone: acc.stone + b.produces_stone,
      gold: acc.gold + b.produces_gold,
      iron: acc.iron + b.produces_iron,
      energy: acc.energy + b.gives_energy_each_round,
    }),
    { wood: 0, clay: 0, stone: 0, gold: 0, iron: 0, energy: 0 }
  )
}