import * as THREE from 'three'

export function buildRoad(scene) {
  const roadGroup = new THREE.Group()

  // ── Asfalto ──────────────────────────────────────
  // Hacemos un plano muy largo para que no se vea el final
  const roadGeo = new THREE.PlaneGeometry(6, 1000)
  const roadMat = new THREE.MeshLambertMaterial({ color: 0x1a1a2e })
  const road = new THREE.Mesh(roadGeo, roadMat)
  road.rotation.x = -Math.PI / 2
  road.position.z = 500
  road.receiveShadow = true
  roadGroup.add(road)

  // ── Pasto ──────────────────────────
  ;[-13, 13].forEach(x => {
    const grass = new THREE.Mesh(
      new THREE.PlaneGeometry(28, 1000),
      new THREE.MeshLambertMaterial({ color: 0x112211 })
    )
    grass.rotation.x = -Math.PI / 2
    grass.position.set(x, -0.01, 500)
    roadGroup.add(grass)
  })

  // ── Líneas de carril (Punteadas) ──────────────────
  const lineMat = new THREE.MeshLambertMaterial({ color: 0xffffaa })
  for (let i = 0; i < 100; i++) {
    const line = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 3), lineMat)
    line.rotation.x = -Math.PI / 2
    line.position.set(0, 0.01, i * 10)
    roadGroup.add(line)
  }

  // ── Bordes ─────────────────────
  const edgeMat = new THREE.MeshLambertMaterial({ color: 0xffffff })
  ;[-3, 3].forEach(x => {
    const edge = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 1000), edgeMat)
    edge.rotation.x = -Math.PI / 2
    edge.position.set(x, 0.02, 500)
    roadGroup.add(edge)
  })

  scene.add(roadGroup)
  return roadGroup
}