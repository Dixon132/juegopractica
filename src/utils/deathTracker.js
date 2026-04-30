const STORAGE_KEY = 'juego_practica_deaths'

export const deathTracker = {
    getDeaths: () => {
        const stored = localStorage.getItem(STORAGE_KEY)
        return stored ? parseInt(stored, 10) : 0
    },

    incrementDeaths: () => {
        const current = deathTracker.getDeaths()
        const next = current + 1
        localStorage.setItem(STORAGE_KEY, next.toString())
        return next
    },

    resetDeaths: () => {
        localStorage.setItem(STORAGE_KEY, '0')
        return 0
    }
}
