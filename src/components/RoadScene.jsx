import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { buildRoad } from '../utils/buildRoad'

export function RoadScene() {
    const canvasRef = useRef(null)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const canvas = canvasRef.current

        // ── Escena ───────────────────────────────
        const scene = new THREE.Scene()
        scene.fog = new THREE.Fog(0x07080f, 30, 80)

        // ── Cámara ──────────────────────────────
        const camera = new THREE.PerspectiveCamera(
            55,
            canvas.clientWidth / canvas.clientHeight,
            0.1,
            200
        )
        camera.position.set(0, 3.8, -8)
        camera.lookAt(0, 0, 10)

        // ── Renderer ────────────────────────────
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.setSize(canvas.clientWidth, canvas.clientHeight)
        renderer.shadowMap.enabled = true

        // ── Luces ───────────────────────────────
        scene.add(new THREE.AmbientLight(0xffffff, 0.4))
        const dir = new THREE.DirectionalLight(0xffffff, 1.2)
        dir.position.set(5, 12, 5)
        dir.castShadow = true
        scene.add(dir)

        // ── Carretera ───────────────────────────
        buildRoad(scene)

        // ── Inicio y fin ────────────────────────
        const inicio = -8
        const fin = 172

        // ── Resize ─────────────────────────────
        const onResize = () => {
            renderer.setSize(canvas.clientWidth, canvas.clientHeight)
            camera.aspect = canvas.clientWidth / canvas.clientHeight
            camera.updateProjectionMatrix()
        }
        window.addEventListener('resize', onResize)

        // ── Loop ───────────────────────────────
        let t = 0
        let animId

        const loop = () => {
            animId = requestAnimationFrame(loop)

            t += 0.04
            camera.position.z = -8 + (t % 180)

            const p = (camera.position.z - inicio) / (fin - inicio)
            setProgress(Math.min(1, Math.max(0, p)))

            camera.lookAt(0, 0, camera.position.z + 18)
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
        <>
            {/* 🎮 Canvas */}
            <canvas
                ref={canvasRef}
                style={{
                    width: '100%',
                    height: '100vh',
                    display: 'block',
                    background: '#07080f'
                }}
            />

            {/* 🔥 BARRA PRO (centrada + diseño) */}
            <div style={{
                position: 'fixed',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '400px',
                height: '25px',
                background: 'rgba(0,0,0,0.6)',
                borderRadius: '20px',
                overflow: 'hidden',
                zIndex: 9999,
                border: '2px solid #00ffcc',
                boxShadow: '0 0 10px #00ffcc'
            }}>

                {/* progreso */}
                <div style={{
                    width: `${progress * 100}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #00ffcc, #00ffaa)',
                    transition: '0.2s',
                    boxShadow: '0 0 10px #00ffcc'
                }} />

                {/* porcentaje */}
                <span style={{
                    position: 'absolute',
                    width: '100%',
                    textAlign: 'center',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    top: '2px'
                }}>
                    {Math.floor(progress * 100)}%
                </span>

            </div>
        </>
    )
}