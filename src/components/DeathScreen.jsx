import styles from './DeathScreen.module.css'

/**
 * DeathScreen
 * Pantalla que aparece cuando el auto choca.
 * Muestra tiempo sobrevivido y distancia. Botón para reintentar.
 */
export function DeathScreen({ visible, elapsed, distance, onRetry }) {
    if (!visible) return null

    const m = Math.floor(elapsed / 60)
    const s = Math.floor(elapsed % 60)
    const time = `${m}:${s < 10 ? '0' : ''}${s}`

    return (
        <div className={styles.overlay}>
            <div className={styles.icon}>💥</div>
            <h1 className={styles.title}>CHOCASTE</h1>
            <p className={styles.stats}>
                {time} sobrevivido · {Math.floor(distance)}m recorridos
            </p>
            <button className={styles.btn} onClick={onRetry}>
                Reintentar
            </button>
        </div>
    )
}