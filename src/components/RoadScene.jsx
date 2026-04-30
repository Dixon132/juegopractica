import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { buildRoad } from '../utils/buildRoad'
import { buildCar }  from '../utils/buildCar'
import { ObstacleManager } from '../utils/obstacles'
import { useCarController } from '../hooks/useCarController'
import { DeathScreen } from './DeathScreen'
import { CAR_SPEED } from '../constants/game'
import { deathTracker } from '../utils/deathTracker'

// ── Constantes de escena ─────────────────────────────────────────────────────
const FOG_COLOR   = 0x07080f
const FOG_NEAR    = 30
const FOG_FAR     = 90
const FINISH_LINE = 500  // Meta a 500 metros

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

// ── Detección de colisiones ──────────────────────────────────────────────────
function checkCollisions(car, obstacles) {
    const carBox = new THREE.Box3().setFromObject(car)
    for (const obs of obstacles) {
        if (obs.position.y > 1) continue // aún cayendo
        const obsBox = new THREE.Box3().setFromObject(obs)
        if (carBox.intersectsBox(obsBox)) return true
    }
    return false
}

// ── Componente ───────────────────────────────────────────────────────────────
export function RoadScene() {
    const canvasRef = useRef(null)
    const { update, triggerBounce } = useCarController(canvasRef)
    const [gameOver, setGameOver] = useState(false)
    const [won, setWon] = useState(false)
    const [elapsed, setElapsed] = useState(0)
    const [distance, setDistance] = useState(0)
    const [deathCount, setDeathCount] = useState(0)
    const gameStateRef = useRef({ dead: false, startTime: 0 })

    const incrementedRef = useRef(false)

    // Incrementar muertes solo cuando el estado 'dead' cambie a true
    useEffect(() => {
        if (dead && !incrementedRef.current) {
            const next = deathTracker.incrementDeaths()
            setDeathCount(next)
            incrementedRef.current = true
        } else if (!dead) {
            incrementedRef.current = false
        }
    }, [dead])

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

        // ── Línea de meta ────────────────────────────────
        const finishGeo = new THREE.PlaneGeometry(8, 0.5)
        const finishMat = new THREE.MeshBasicMaterial({ 
            color: 0xffff00,
            emissive: 0xffff00,
            emissiveIntensity: 0.8
        })
        const finishLine = new THREE.Mesh(finishGeo, finishMat)
        finishLine.rotation.x = -Math.PI / 2
        finishLine.position.set(0, 0.05, FINISH_LINE)
        scene.add(finishLine)

        // ── Obstáculos ───────────────────────────────────
        const obstacleManager = new ObstacleManager(scene)

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
        gameStateRef.current.startTime = performance.now()

        const loop = (ts) => {
            animId = requestAnimationFrame(loop)
            const dt = lastTs ? Math.min((ts - lastTs) / 1000, 0.05) : 0
            lastTs = ts

            if (gameStateRef.current.dead || gameStateRef.current.finished) {
                renderer.render(scene, camera)
                return
            }

            scrollZ += CAR_SPEED * dt
            const elapsedSec = (ts - gameStateRef.current.startTime) / 1000
            setElapsed(elapsedSec)
            setDistance(scrollZ)
            
            console.log('ScrollZ:', scrollZ.toFixed(2), 'Progress:', (scrollZ/FINISH_LINE*100).toFixed(1) + '%')

            // Verificar si llegó a la meta
            if (scrollZ >= FINISH_LINE && !gameStateRef.current.finished) {
                gameStateRef.current.finished = true
                setWon(true)
            }

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

            // OBSTACLES — actualizar y detectar colisiones
            obstacleManager.update(scrollZ)
            
            if (checkCollisions(car, obstacleManager.obstacles)) {
                triggerBounce()
                gameStateRef.current.lives--
                setLives(gameStateRef.current.lives)
                
                // Remover obstáculo con el que chocó
                for (let i = obstacleManager.obstacles.length - 1; i >= 0; i--) {
                    const obs = obstacleManager.obstacles[i]
                    if (obs.position.y <= 1) {
                        const obsBox = new THREE.Box3().setFromObject(obs)
                        const carBox = new THREE.Box3().setFromObject(car)
                        if (carBox.intersectsBox(obsBox)) {
                            scene.remove(obs)
                            obstacleManager.obstacles.splice(i, 1)
                            break
                        }
                    }
                }
                
                if (gameStateRef.current.lives <= 0) {
                    gameStateRef.current.dead = true
                    setGameOver(true)
                }
            }

            renderer.render(scene, camera)
        }
        loop(0)

        return () => {
            cancelAnimationFrame(animId)
            window.removeEventListener('resize', onResize)
            renderer.dispose()
        }
    }, [update, triggerBounce])

    const handleRetry = () => {
        window.location.reload()
    }

    const progress = distance / FINISH_LINE
    const progressPercent = Math.min(progress * 100, 100)
    const minutes = Math.floor(elapsed / 60)
    const seconds = Math.floor(elapsed % 60)

    console.log('UI - Distance:', distance.toFixed(2), 'Progress:', progressPercent.toFixed(1) + '%')

    return (
        <>
            <canvas
                ref={canvasRef}
                style={{ width: '100%', height: '100vh', display: 'block', background: '#07080f' }}
            />
            <DeathScreen
                visible={dead}
                elapsed={elapsed}
                distance={distance}
                deaths={deathCount}
                onRetry={handleRetry}
            />
        </>
    )
}
