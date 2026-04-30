import * as THREE from 'three'

/**
 * buildCar(scene)
 * Construye el auto 3D y lo agrega a la escena.
 * Retorna el Group del auto para moverlo desde afuera.
 */
export function buildCar(scene) {
    const car = new THREE.Group()

    // ── Carrocería ────────────────────────────────────
    const bodyMat = new THREE.MeshPhongMaterial({ color: 0x378ADD, shininess: 130 })
    const body = new THREE.Mesh(new THREE.BoxGeometry(1, 0.42, 1.85), bodyMat)
    body.position.y = 0.35
    body.castShadow = true
    car.add(body)

    // ── Cabina ────────────────────────────────────────
    const topMat = new THREE.MeshPhongMaterial({ color: 0x185FA5, shininess: 80 })
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.34, 1.05), topMat)
    top.position.set(0, 0.74, -0.1)
    top.castShadow = true
    car.add(top)

    // ── Ruedas ────────────────────────────────────────
    const wheelMat = new THREE.MeshPhongMaterial({ color: 0x111111 })
    const rimMat = new THREE.MeshPhongMaterial({ color: 0xaaaaaa, shininess: 200 })
    const wheelPos = [
        [0.56, 0, -0.58],
        [-0.56, 0, -0.58],
        [0.56, 0, 0.58],
        [-0.56, 0, 0.58],
    ]
    wheelPos.forEach(([x, y, z]) => {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.16, 14), wheelMat)
        wheel.rotation.z = Math.PI / 2
        wheel.position.set(x, 0.18, z)
        car.add(wheel)

        const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.17, 6), rimMat)
        rim.rotation.z = Math.PI / 2
        rim.position.set(x, 0.18, z)
        car.add(rim)
    })

    // ── Faros delanteros ──────────────────────────────
    const headMat = new THREE.MeshPhongMaterial({
        color: 0xffffcc,
        emissive: 0xffff88,
        emissiveIntensity: 0.8,
    })
        ;[-0.3, 0.3].forEach(x => {
            const h = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.1, 0.08), headMat)
            h.position.set(x, 0.35, 0.95)
            car.add(h)
        })

    // ── Luces traseras ────────────────────────────────
    const tailMat = new THREE.MeshPhongMaterial({
        color: 0xff2222,
        emissive: 0xff0000,
        emissiveIntensity: 0.6,
    })
        ;[-0.3, 0.3].forEach(x => {
            const t = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.06), tailMat)
            t.position.set(x, 0.35, -0.95)
            car.add(t)
        })

    scene.add(car)
    return car
}