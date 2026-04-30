import * as THREE from 'three'

export class ObstacleManager {
    constructor(scene) {
        this.scene = scene
        this.obstacles = []
        this.cubeSize = 0.8
        this.cubeGeometry = new THREE.BoxGeometry(this.cubeSize, this.cubeSize, this.cubeSize)
        this.cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xff4444 })
        
        this.spawnDistance = 25 // Distancia entre oleadas
        this.lastSpawnZ = -50
        this.prevCameraZ = 0
        this.lanes = [-2, 0, 2]
        
        this.gravity = -0.02
        this.bounce = 0.3
        this.friction = 0.98
    }

    update(cameraZ) {
        // DETECTAR REINICIO: Si la cámara salta bruscamente hacia atrás
        if (cameraZ < this.prevCameraZ - 10) {
            this.lastSpawnZ = cameraZ
            this.clearAll()
        }
        this.prevCameraZ = cameraZ

        // Generación basada en distancia
        if (cameraZ + 80 > this.lastSpawnZ + this.spawnDistance) {
            this.spawnGroup(cameraZ)
        }

        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i]
            
            obstacle.userData.velocity.y += this.gravity
            obstacle.userData.velocity.y *= this.friction
            obstacle.position.y += obstacle.userData.velocity.y
            
            obstacle.rotation.x += 0.05
            obstacle.rotation.z += 0.05

            const groundLevel = this.cubeSize / 2
            if (obstacle.position.y <= groundLevel) {
                obstacle.position.y = groundLevel
                if (Math.abs(obstacle.userData.velocity.y) > 0.02) {
                    obstacle.userData.velocity.y *= -this.bounce
                } else {
                    obstacle.userData.velocity.y = 0
                }
            }

            if (obstacle.position.z < cameraZ - 5) {
                this.scene.remove(obstacle)
                this.obstacles.splice(i, 1)
            }
        }
    }

    clearAll() {
        this.obstacles.forEach(obj => this.scene.remove(obj))
        this.obstacles = []
    }

    spawnGroup(cameraZ) {
        // Actualizamos el punto donde generamos el siguiente grupo
        this.lastSpawnZ = cameraZ + 80

        const numObstacles = Math.random() > 0.6 ? 2 : 1
        const shuffledLanes = [...this.lanes].sort(() => Math.random() - 0.5)
        
        for (let i = 0; i < numObstacles; i++) {
            this.createObstacle(shuffledLanes[i], cameraZ + 90)
        }
    }

    createObstacle(x, z) {
        const cube = new THREE.Mesh(this.cubeGeometry, this.cubeMaterial)
        cube.position.set(x, 15, z)
        cube.castShadow = true
        cube.userData = { velocity: { y: 0, z: 0 } }
        this.scene.add(cube)
        this.obstacles.push(cube)
    }
}
