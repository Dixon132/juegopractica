import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { buildRoad } from '../utils/buildRoad'
import { buildCar }  from '../utils/buildCar'
import { useCarController } from '../hooks/useCarController'

// ── Constantes de escena ─────────────────────────────────────────────────────
const SPEED       = 8      // unidades/segundo de avance
const FOG_COLOR   = 0x07080f
const FOG_NEAR    = 30
const FOG_FAR     = 90

// ── Setup helpers ────────────────────────────────────────────────────────────
function createRenderer(canvas) {
    const r = new THREE.WebGLRenderer({ canvas, antialias: true })
    r.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    r.setSize(canvas.clientWidth, canvas.clientHeight)
    r.shadowMap.enabled = true
    return r
}

function createCamera(canvas) {
    return new THREE.PerspectiveCamera(
        55, canvas.clientWidth / canvas.clientHeight, 0.1, 200
    )
}

function setupLights(scene) {
    scene.add(new THREE.AmbientLight(0xffffff, 0.35))

    const sun = new THREE.DirectionalLight(0xffffff, 1.2)
    sun.position.set(5, 12, 5)
    sun.castShadow = true
    scene.add(sun)

    const headLight = new THREE.PointLight(0xffffcc, 1.5, 18)
    scene.add(headLight)

    return { headLight }
}

// ── Componente ───────────────────────────────────────────────────────────────
export function RoadScene() {
    const canvasRef = useRef(null)
    const { update } = useCarController(canvasRef)

    useEffect(() => {
        const canvas = canvasRef.current

        // ── Escena base ──────────────────────────────────
        const scene    = new THREE.Scene()
        scene.fog      = new THREE.Fog(FOG_COLOR, FOG_NEAR, FOG_FAR)
        const camera   = createCamera(canvas)
        const renderer = createRenderer(canvas)

        // ── Luces ────────────────────────────────────────
        const { headLight } = setupLights(scene)

        // ── Carretera ────────────────────────────────────
        const { updateRoad } = buildRoad(scene)

        // ── Auto ─────────────────────────────────────────
        const car = buildCar(scene)

        // ── Obstáculos (TODO) ─────────────────────────────
        // const obstacleManager = buildObstacles(scene)

        // ── Resize ───────────────────────────────────────
        const onResize = () => {
            renderer.setSize(canvas.clientWidth, canvas.clientHeight)
            camera.aspect = canvas.clientWidth / canvas.clientHeight
            camera.updateProjectionMatrix()
        }
        window.addEventListener('resize', onResize)

        // ── Game loop ────────────────────────────────────
        let scrollZ = 0
        let lastTs  = null
        let animId

        const loop = (ts) => {
            animId = requestAnimationFrame(loop)
            const dt = lastTs ? Math.min((ts - lastTs) / 1000, 0.05) : 0
            lastTs = ts

            scrollZ += SPEED * dt

            // ROAD — reciclar chunks
            updateRoad(scrollZ)

            // CAR — posición y orientación
            const { x, z, tiltZ, tiltX } = update(scrollZ, dt)
            car.position.set(x, 0, z)
            car.rotation.z = tiltZ
            car.rotation.x = tiltX

            // CAMERA — sigue al auto
            camera.position.set(x * 0.3, 3.8, z - 8)
            camera.lookAt(x * 0.5, 0.5, z + 12)

            // LIGHTS — faros siguen al auto
            headLight.position.set(x, 2, z + 3)

            // OBSTACLES — (TODO)
            // obstacleManager.update(scrollZ, car, triggerBounce)

            renderer.render(scene, camera)
        }
        loop(0)

        return () => {
            cancelAnimationFrame(animId)
            window.removeEventListener('resize', onResize)
            renderer.dispose()
        }
    }, [update])

    return (
        <canvas
            ref={canvasRef}
            style={{ width: '100%', height: '100vh', display: 'block', background: '#07080f' }}
        />
    )
}
