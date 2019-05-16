export default {
  name: 'animate',
  install: function (terget) {
    terget.addPrototype('fadeOut', function (duration = 300) {
      const keyframes = [{ opacity: 1, marginTop: '0' }, { opacity: 0, marginTop: '50px' }]
      return _animate.call(this, keyframes, duration).finished
    })
    terget.addPrototype('fadeIn', function (duration = 300) {
      const keyframes = [{ opacity: 0, marginTop: '50px' }, { opacity: 1, marginTop: '0px' }]
      return _animate.call(this, keyframes, duration).finished
    })
  }
}
function _animate (keyframes, duration) {
  console.log(this)
  for (let i in keyframes[0]) {
    this.elm.style[i] = keyframes[0][i]
  }
  this.elm.style.display = 'block'
  this.elm.style.transition = duration + 'ms'
  for (let i in keyframes[1]) {
    this.elm.style[i] = keyframes[1][i]
  }
  setTimeout(() => {
    this.elm.style.transition = ''
  }, duration)
  return {}
}
// fadeOut (duration = 300) {
//   const keyframes = [{ opacity: 1, marginTop: '0' }, { opacity: 0, marginTop: '50px' }]
//   return this._animate(keyframes, duration).finished
// }
// fadeIn (duration = 300) {
//   const keyframes = [{ opacity: 0, marginTop: '50px' }, { opacity: 1, marginTop: '0px' }]
//   return this._animate(keyframes, duration).finished
// }
