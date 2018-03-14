// caching math functions
var cos = Math.cos
var sin = Math.sin
//
var timeout = 0
var image = new Image()

window.onload = function() {
  canvas = document.createElement('canvas')
  ctx = canvas.getContext('2d')
  document.body.appendChild(canvas)

  changeDemo(window.location.hash.replace('#', ''))
}

function changeDemo(hash) {
  document.body.style.background = '#000'
  window.location.hash = '#' + hash
  window.onmousedown = false
  window.onmousemove = false
  if (window.timeout) window.clearTimeout(timeout)
  ctx.strokeStyle = '#000'
  ctx.fillStyle = '#000'
  ctx.lineWidth = 1
  ctx.globalCompositeOperation = 'source-over'
  ctx.globalAlpha = 1
  ctx.canvas.height = 820
  ctx.canvas.width = 490
  demoShadowEffects()
}

var createInterlace = function(size, color1, color2) {
  var proto = document.createElement('canvas').getContext('2d')
  proto.canvas.width = size * 2
  proto.canvas.height = size * 2
  proto.fillStyle = color1 // top-left
  proto.fillRect(0, 0, size, size)
  proto.fillStyle = color2 // top-right
  proto.fillRect(size, 0, size, size)
  proto.fillStyle = color2 // bottom-left
  proto.fillRect(0, size, size, size)
  proto.fillStyle = color1 // bottom-right
  proto.fillRect(size, size, size, size)
  var pattern = proto.createPattern(proto.canvas, 'repeat')
  pattern.data = proto.canvas.toDataURL()
  return pattern
}

var op_8x8 = createInterlace(8, '#FFF', '#eee')

/// get text-metrics from DOM, to use with <canvas>
;(function() {
  var image = document.createElement('img')
  image.width = 42
  image.height = 1
  image.src = op_8x8.data
  image.style.cssText = 'display: inline'

  getMetrics = function(text, font) {
    var metrics = document.getElementById('metrics')
    if (metrics) {
      metrics.style.cssText = 'display: block'
      var parent = metrics.firstChild
      parent.firstChild.textContent = text
    } else {
      // setting up html used for measuring text-metrics
      var parent = document.createElement('span')
      parent.appendChild(document.createTextNode(text))
      parent.appendChild(image)
      var metrics = document.createElement('div')
      metrics.id = 'metrics'
      metrics.appendChild(parent)
      document.body.insertBefore(metrics, document.body.firstChild)
    }

    // direction of the text
    var direction = window.getComputedStyle(document.body, '')['direction']

    // getting css equivalent of ctx.measureText()
    parent.style.cssText =
      'font: ' + font + '; white-space: nowrap; display: inline;'
    var width = parent.offsetWidth
    var height = parent.offsetHeight

    // capturing the "top" and "bottom" baseline
    parent.style.cssText =
      'font: ' + font + '; white-space: nowrap; display: block;'
    var top = image.offsetTop
    var bottom = top - height

    // capturing the "middle" baseline
    parent.style.cssText =
      'font: ' + font + '; white-space: nowrap; line-height: 0; display: block;'
    var middle = image.offsetTop + 1

    // capturing "1em"
    parent.style.cssText =
      'font: ' + font + '; white-space: nowrap; height: 1em; display: block;'
    parent.firstChild.textContent = ''
    var em = parent.offsetHeight

    // cleanup
    metrics.style.display = 'none'

    return {
      direction: direction,
      top: top,
      em: em,
      middle: middle,
      bottom: bottom,
      height: height,
      width: width
    }
  }
})()
