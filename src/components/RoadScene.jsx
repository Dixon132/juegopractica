import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { buildRoad } from '../utils/buildRoad'
import { ObstacleManager } from '../utils/obstacles'


export function RoadScene() {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current

        // ── Escena + Cámara + Renderer ──────────────────
        const scene = new THREE.Scene()
        scene.fog = new THREE.Fog(0x07080f, 30, 80)

        const camera = new THREE.PerspectiveCamera(
            55,
            canvas.clientWidth / canvas.clientHeight,
            0.1,
            200
        )
        camera.position.set(0, 3.8, -8)
        camera.lookAt(0, 0, 10)

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

        // ── Carretera ───────────────────────────────────
        const roadGroup = buildRoad(scene)

        // ── Obstáculos ──────────────────────────────────
        const obstacleManager = new ObstacleManager(scene)

        // ── Resize ──────────────────────────────────────
        const onResize = () => {
            renderer.setSize(canvas.clientWidth, canvas.clientHeight)
            camera.aspect = canvas.clientWidth / canvas.clientHeight
            camera.updateProjectionMatrix()
        }
        window.addEventListener('resize', onResize)

        // ── Loop: avance infinito real ───────────
        let cameraZ = -8
        let animId
        const loop = () => {
            animId = requestAnimationFrame(loop)
            
            // Avance lineal (no hay % porque es infinito)
            cameraZ += 0.4 
            camera.position.z = cameraZ
            camera.lookAt(0, 0, cameraZ + 20)

            // Reciclaje de la carretera: 
            // Movemos el grupo de carretera para que siempre esté centrado en la cámara
            // Pero hacemos que las líneas parezcan moverse usando un offset
            roadGroup.position.z = Math.floor(cameraZ / 10) * 10

            // Actualizar obstáculos
            obstacleManager.update(cameraZ)

            renderer.render(scene, camera)
        }
        loop()

        return () => {
            cancelAnimationFrame(animId)
            window.removeEventListener('resize', onResize)
            renderer.dispose()
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            style={{ width: '100%', height: '100vh', display: 'block', background: '#07080f' }}
        />
    )
}