import { useRef, useEffect, useCallback } from 'react'

const ROAD_HALF    = 2.4   // límite lateral (borde del carril)
const LERP_NORMAL  = 0.12  // suavizado normal
const LERP_BOUNCE  = 0.06  // suavizado más lento durante rebote

/**
 * useCarController
 * Lee el mouse sobre el canvas y calcula la posición del auto.
 * Expone update(scrollZ, dt) para llamar en cada frame del loop.
 *
 * Diseñado para ser extensible: más adelante podés agregar
 * colisiones llamando triggerBounce() desde el game loop.
 */
export function useCarController(canvasRef) {
  // Posición actual del auto (mutable, no React state → sin re-renders)
  const state = useRef({
    x: 0, z: 0,          // posición suavizada
    targetX: 0,           // objetivo horizontal del mouse
    mouseY: 0,            // -1 a 1 vertical del mouse
    bouncing: false,      // ¿está rebotando tras choque?
    bounceVel: 0,         // velocidad de rebote (Z)
  })

  // ── Leer el mouse ──────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const onMove = (e) => {
      const r   = canvas.getBoundingClientRect()
      const s   = state.current
      s.targetX = ((e.clientX - r.left) / r.width  - 0.5) * 2 * ROAD_HALF
      s.mouseY  = ((e.clientY - r.top)  / r.height - 0.5) * 2
    }

    // Touch support
    const onTouch = (e) => {
      const t = e.touches[0]
      const r = canvas.getBoundingClientRect()
      const s = state.current
      s.targetX = ((t.clientX - r.left) / r.width  - 0.5) * 2 * ROAD_HALF
      s.mouseY  = ((t.clientY - r.top)  / r.height - 0.5) * 2
    }

    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('touchmove', onTouch, { passive: true })
    return () => {
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('touchmove', onTouch)
    }
  }, [canvasRef])

  /**
   * update(scrollZ, dt) → { x, z, tiltZ, tiltX }
   * Llamar en cada frame del renderer. Devuelve la posición
   * y la inclinación del auto para aplicar a car.position / car.rotation.
   */
  const update = useCallback((scrollZ, dt) => {
    const s = state.current
    const lerp = s.bouncing ? LERP_BOUNCE : LERP_NORMAL

    // ── Rebote tras choque ──────────────────────────
    if (s.bouncing) {
      s.bounceVel -= 30 * dt
      s.z += s.bounceVel * dt
      if (s.z <= scrollZ) {         // llegó de vuelta a la posición normal
        s.z       = scrollZ
        s.bouncing  = false
        s.bounceVel = 0
      }
    }

    // ── Movimiento normal ───────────────────────────
    if (!s.bouncing) {
      const targetZ = scrollZ + s.mouseY * 1.5   // mouse arriba = más adelante
      s.x += (s.targetX - s.x) * lerp
      s.z += (targetZ   - s.z) * lerp
    }

    // Clamp a los bordes del carril
    s.x = Math.max(-ROAD_HALF, Math.min(ROAD_HALF, s.x))

    // Inclinación visual según diferencia de posición
    const tiltZ = -(s.targetX - s.x) * 0.35
    const tiltX =   s.mouseY          * 0.06

    return { x: s.x, z: s.z, tiltZ, tiltX }
  }, [])

  /**
   * triggerBounce()
   * Llamar desde el game loop cuando se detecte una colisión.
   * El auto frena y rebota levemente hacia atrás.
   */
  const triggerBounce = useCallback(() => {
    const s = state.current
    if (s.bouncing) return     // ignorar si ya está rebotando
    s.bouncing  = true
    s.bounceVel = 18           // fuerza del rebote hacia atrás
  }, [])

  return { update, triggerBounce }
}