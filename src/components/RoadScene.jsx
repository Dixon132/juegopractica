import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { buildRoad } from '../utils/buildRoad'
import { buildCar } from '../utils/buildCar'        // ← NUEVO
import { useCarController } from '../hooks/useCarController' // ← NUEVO

export function RoadScene() {
    const canvasRef = useRef(null)
    const { update /*, triggerBounce */ } = useCarController(canvasRef) // ← NUEVO

    useEffect(() => {
        const canvas = canvasRef.current

        // ── Escena ──────────────────────────────────────
        const scene = new THREE.Scene()
        scene.fog = new THREE.Fog(0x07080f, 30, 80)

        const camera = new THREE.PerspectiveCamera(
            55, canvas.clientWidth / canvas.clientHeight, 0.1, 200
        )

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.setSize(canvas.clientWidth, canvas.clientHeight)
        renderer.shadowMap.enabled = true

        // ── Luces ───────────────────────────────────────
        scene.add(new THREE.AmbientLight(0xffffff, 0.4))
        const dir = new THREE.DirectionalLight(0xffffff, 1.2)
        dir.position.set(5, 12, 5)
        dir.castShadow = true
        scene.add(dir)

        const headLight = new THREE.PointLight(0xffffcc, 1.5, 18) // ← NUEVO
        scene.add(headLight)

        // ── Objetos 3D ──────────────────────────────────
        buildRoad(scene)
        const car = buildCar(scene)                               // ← NUEVO
        const car2 = buildCar(scene)                               // ← NUEVO


        // ── Resize ──────────────────────────────────────
        const onResize = () => {
            renderer.setSize(canvas.clientWidth, canvas.clientHeight)
            camera.aspect = canvas.clientWidth / canvas.clientHeight
            camera.updateProjectionMatrix()
        }
        window.addEventListener('resize', onResize)

        // ── Game loop ───────────────────────────────────
        let scrollZ = 0
        let lastTs = null
        let animId

        const loop = (ts) => {
            animId = requestAnimationFrame(loop)
            const dt = lastTs ? Math.min((ts - lastTs) / 1000, 0.05) : 0
            lastTs = ts

            // Avance automático de la escena
            scrollZ += 8 * dt

            // Actualizar posición del auto con el controller   // ← NUEVO
            const { x, z, tiltZ, tiltX } = update(scrollZ, dt)
            car.position.set(x, 0, z)
            car.rotation.z = tiltZ
            car.rotation.x = tiltX

            // Cámara sigue al auto desde atrás                 // ← NUEVO
            camera.position.set(x * 0.3, 3.8, z - 8)
            camera.lookAt(x * 0.5, 0.5, z + 12)

            // Luz de faros se mueve con el auto                // ← NUEVO
            headLight.position.set(x, 2, z + 3)

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