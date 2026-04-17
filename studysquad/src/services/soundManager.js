// soundManager.js
const audio = new Audio('/go.mp3')
const clicker = new Audio('/click.mp3')
const bye = new Audio('/bye.mp3')
const TYPING_VOLUME = 1 / 6
let typing = new Audio('/keyboard.mp3')
let lastPlay = 0
typing.volume = TYPING_VOLUME


export const playClick = () => {
  audio.currentTime = 0
  audio.play()
}

export const playSong = () => {
  clicker.currentTime = 0
  clicker.play()
}

export const playBye = () => {
  bye.currentTime = 0
  bye.play()
}

export const playTyping = () => {
  const audio = new Audio('/keyboard.mp3')
  audio.volume = TYPING_VOLUME

  audio.currentTime = 0
  audio.play().catch(() => {})

  setTimeout(() => {
    audio.pause()
    audio.currentTime = 0
  }, 1000)
}

export const stopTyping = () => {
  typing.pause()
  typing.currentTime = 0
}

export const playSongBG = () => {
  const audio = new Audio('/devoir.mp3')

  audio.currentTime = 0
  audio.play().catch(() => {})

  setTimeout(() => {
    audio.pause()
    audio.currentTime = 0
  }, 1000)
}
