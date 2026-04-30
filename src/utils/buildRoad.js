import * as THREE from 'three'

// ── Constantes de carretera ──────────────────────────────────────────────────
const CHUNK_LENGTH = 40
const CHUNK_COUNT  = 6
const ROAD_WIDTH   = 6
const DASH_SPACING = 5
const DASHES_PER_CHUNK = Math.floor(CHUNK_LENGTH / DASH_SPACING)

// ── Materiales compartidos ───────────────────────────────────────────────────
const MAT = {
    road:   new THREE.MeshLambertMaterial({ color: 0x1a1a2e }),
    grass:  new THREE.MeshLambertMaterial({ color: 0x0e1f0e }),
    dash:   new THREE.MeshLambertMaterial({ color: 0xffffaa }),
    edge:   new THREE.MeshLambertMaterial({ color: 0xffffff }),
    trunk:  new THREE.MeshLambertMaterial({ color: 0x5a3a1a }),
    leaves: new THREE.MeshLambertMaterial({ color: 0x2d5a1e }),
    pole:   new THREE.MeshLambertMaterial({ color: 0x888888 }),
    lamp:   new THREE.MeshLambertMaterial({ color: 0xffffcc, emissive: 0xffff88, emissiveIntensity: 1 }),
}

// ── Geometrías compartidas ───────────────────────────────────────────────────
const GEO = {
    road:   new THREE.PlaneGeometry(ROAD_WIDTH, CHUNK_LENGTH),
    grass:  new THREE.PlaneGeometry(30, CHUNK_LENGTH),
    dash:   new THREE.PlaneGeometry(0.08, 2.5),
    edgeL:  new THREE.PlaneGeometry(0.12, CHUNK_LENGTH),
    trunk:  new THREE.CylinderGeometry(0.12, 0.18, 1.6, 6),
    leaves: new THREE.SphereGeometry(0.8, 6, 5),
    pole:   new THREE.CylinderGeometry(0.06, 0.06, 4, 6),
    lamp:   new THREE.SphereGeometry(0.18, 6, 4),
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function makePlane(geo, mat, x, z) {
    const m = new THREE.Mesh(geo, mat)
    m.rotation.x = -Math.PI / 2
    m.position.set(x, 0, z)
    m.receiveShadow = true
    return m
}

function makeTree(x, z) {
    const group = new THREE.Group()
    const trunk = new THREE.Mesh(GEO.trunk, MAT.trunk)
    trunk.position.set(0, 0.8, 0)
    trunk.castShadow = true
    const leaves = new THREE.Mesh(GEO.leaves, MAT.leaves)
    leaves.position.set(0, 2.2, 0)
    leaves.castShadow = true
    group.add(trunk, leaves)
    group.position.set(x, 0, z)
    return group
}

function makeLampPost(x, z) {
    const group = new THREE.Group()
    const pole = new THREE.Mesh(GEO.pole, MAT.pole)
    pole.position.set(0, 2, 0)
    const lamp = new THREE.Mesh(GEO.lamp, MAT.lamp)
    lamp.position.set(0, 4.1, 0)
    group.add(pole, lamp)
    group.position.set(x, 0, z)
    return group
}

// ── Chunk: un segmento completo de carretera ─────────────────────────────────
function createChunk(scene, chunkIndex) {
    const group = new THREE.Group()
    const z = chunkIndex * CHUNK_LENGTH + CHUNK_LENGTH / 2

    // Asfalto
    group.add(makePlane(GEO.road, MAT.road, 0, 0))

    // Pasto
    group.add(makePlane(GEO.grass, MAT.grass, -18, 0))
    group.add(makePlane(GEO.grass, MAT.grass,  18, 0))

    // Bordes blancos
    group.add(makePlane(GEO.edgeL, MAT.edge, -3, 0))
    group.add(makePlane(GEO.edgeL, MAT.edge,  3, 0))

    // Líneas punteadas centrales
    for (let i = 0; i < DASHES_PER_CHUNK; i++) {
        const dz = -CHUNK_LENGTH / 2 + i * DASH_SPACING + DASH_SPACING / 2
        const dash = new THREE.Mesh(GEO.dash, MAT.dash)
        dash.rotation.x = -Math.PI / 2
        dash.position.set(0, 0.01, dz)
        group.add(dash)
    }

    // Árboles (2-3 por chunk, lados alternados)
    const treeCount = 2 + Math.floor(Math.random() * 2)
    for (let i = 0; i < treeCount; i++) {
        const side = i % 2 === 0 ? -1 : 1
        const tx = side * (4.5 + Math.random() * 6)
        const tz = (Math.random() - 0.5) * CHUNK_LENGTH * 0.8
        group.add(makeTree(tx, tz))
    }

    // Farola cada 2 chunks (alternando lado)
    if (chunkIndex % 2 === 0) {
        const side = chunkIndex % 4 === 0 ? -1 : 1
        group.add(makeLampPost(side * 4, 0))
    }

    group.position.z = z
    scene.add(group)
    return group
}

// ── API pública ──────────────────────────────────────────────────────────────
export function buildRoad(scene) {
    const chunks = []

    for (let i = 0; i < CHUNK_COUNT; i++) {
        chunks.push(createChunk(scene, i))
    }

    let nextChunkIndex = CHUNK_COUNT

    function updateRoad(cameraZ) {
        for (const chunk of chunks) {
            if (chunk.position.z < cameraZ - CHUNK_LENGTH) {
                chunk.position.z = (nextChunkIndex * CHUNK_LENGTH) + CHUNK_LENGTH / 2
                nextChunkIndex++
            }
        }
    }

    return { updateRoad }
}
