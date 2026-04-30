export const ROAD_HALF       = 4    // límite lateral del carril
export const CAR_SPEED       = 40     // unidades/seg de avance de escena
export const CAR_LERP        = 0.12   // suavizado del mouse

// Obstáculos
export const OBS_COUNT       = 198     // total de clusters en pista
export const OBS_SPACING     = 12     // distancia mínima entre clusters
export const OBS_RECYCLE_Z   = 60     // cuánto adelante reaparecen al pasar
export const OBS_COLLISION_R = 0.75   // radio AABB de colisión

// Clusters: cada obstáculo es un grupo de 2-4 piedras pequeñas
export const OBS_STONES_MIN  = 20
export const OBS_STONES_MAX  = 4

// Carriles disponibles en el eje X
export const OBS_LANES = [-2.2, -1.4, -0.5, 0.5, 1.4, 2.2]