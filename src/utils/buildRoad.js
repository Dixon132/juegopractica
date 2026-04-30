import * as THREE from 'three'

export function buildRoad(scene) {
  // ── Asfalto ──────────────────────────────────────
  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(6, 200),
    new THREE.MeshLambertMaterial({ color: 0x1a1a2e })
  )
  road.rotation.x = -Math.PI / 2
  road.position.z = 90
  road.receiveShadow = true
  scene.add(road)

  // ── Pasto a los costados ──────────────────────────
  ;[-13, 13].forEach(x => {
    const grass = new THREE.Mesh(
      new THREE.PlaneGeometry(28, 200),
      new THREE.MeshLambertMaterial({ color: 0x112211 })
    )
    grass.rotation.x = -Math.PI / 2
    grass.position.set(x, 0, 90)
    scene.add(grass)
  })

  // ── Líneas de carril (punteadas) ──────────────────
  const lineMat = new THREE.MeshLambertMaterial({ color: 0xffffaa })
  for (let i = 0; i < 40; i++) {
    const line = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 2.5), lineMat)
    line.rotation.x = -Math.PI / 2
    line.position.set(0, 0.01, i * 5)
    scene.add(line)
  }

  // ── Bordes blancos del carril ─────────────────────
  const edgeMat = new THREE.MeshLambertMaterial({ color: 0xffffff })
  ;[-3, 3].forEach(x => {
    const edge = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 200), edgeMat)
    edge.rotation.x = -Math.PI / 2
    edge.position.set(x, 0.01, 90)
    scene.add(edge)
  })

  // ── Árboles decorativos ───────────────────────────
  const trunkMat  = new THREE.MeshLambertMaterial({ color: 0x5a3a1a })
  const leavesMat = new THREE.MeshLambertMaterial({ color: 0x2d4a1e })

  for (let i = 0; i < 28; i++) {
    const side = Math.random() < 0.5 ? -1 : 1
    const x = side * (4.5 + Math.random() * 7)
    const z = Math.random() * 180

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.18, 1.4, 6),
      trunkMat
    )
    trunk.position.set(x, 0.7, z)
    scene.add(trunk)

    const leaves = new THREE.Mesh(
      new THREE.SphereGeometry(0.7, 6, 5),
      leavesMat
    )
    leaves.position.set(x, 2.0, z)
    scene.add(leaves)
  }
}