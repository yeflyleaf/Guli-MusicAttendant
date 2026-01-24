import { useAudio } from '@/hooks/useAudio'
import { usePlayerStore } from '@/store/player.store'
import { onMounted, onUnmounted } from 'vue'

/**
 * 键盘控制 Hook
 * 处理应用内的键盘快捷键
 */
export function useKeyboardControls() {
    const playerStore = usePlayerStore()
    const { seek, setVolume } = useAudio()

    const handleKeyDown = (event: KeyboardEvent) => {
        // 如果焦点在输入框或文本域中，不触发快捷键
        const target = event.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
            return
        }

        switch (event.code) {
            case 'Space':
                event.preventDefault() // 防止页面滚动
                playerStore.togglePlay()
                break

            case 'ArrowLeft':
                event.preventDefault() // 防止页面滚动
                if (playerStore.currentSong) {
                    const newTime = Math.max(0, playerStore.currentTime - 5)
                    seek(newTime)
                }
                break

            case 'ArrowRight':
                event.preventDefault() // 防止页面滚动
                if (playerStore.currentSong) {
                    const newTime = Math.min(playerStore.duration, playerStore.currentTime + 5)
                    seek(newTime)
                }
                break

            case 'ArrowUp':
                event.preventDefault() // 防止页面滚动
                setVolume(Math.min(1, playerStore.volume + 0.05))
                break

            case 'ArrowDown':
                event.preventDefault() // 防止页面滚动
                setVolume(Math.max(0, playerStore.volume - 0.05))
                break
        }
    }

    onMounted(() => {
        window.addEventListener('keydown', handleKeyDown)
    })

    onUnmounted(() => {
        window.removeEventListener('keydown', handleKeyDown)
    })
}
