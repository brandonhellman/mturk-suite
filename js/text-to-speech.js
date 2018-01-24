async function textToSpeech () {
  const [text, name] = arguments

  const utterThis = new SpeechSynthesisUtterance(text)

  utterThis.voice = await new Promise((resolve) => {
    function getVoice () {
      const voices = window.speechSynthesis.getVoices()
      const filtered = voices.filter((voice) => voice.name === (name || voice.name))
      return (filtered[0] || voices[0])
    }

    const voice = getVoice()

    if (voice) {
      resolve(voice)
    } else {
      window.speechSynthesis.onvoiceschanged = (event) => {
        resolve(getVoice())
      }
    }
  })

  window.speechSynthesis.speak(utterThis)
}
