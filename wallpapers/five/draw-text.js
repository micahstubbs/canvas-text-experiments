// caching math functions
var cos = Math.cos
var sin = Math.sin
//
var timeout = 0
var image = new Image()

window.onload = function() {
  canvas = document.createElement('canvas')
  ctx = canvas.getContext('2d')

  // append the calendar to the <a> tag with the #dl id
  // so that we can download the canvas as an image
  // when we click it ✨
  document.querySelector('#dl').appendChild(canvas)

  changeDemo(window.location.hash.replace('#', ''))

  /* REGISTER DOWNLOAD HANDLER */
  /* Only convert the canvas to Data URL when the user clicks. 
   This saves RAM and CPU ressources in case this feature is not required. */
  function dlCanvas() {
    var dt = ctx.canvas.toDataURL('image/png')
    /* Change MIME type to trick the browser to downlaod the file instead of displaying it */
    dt = dt.replace(/^data:image\/[^;]*/, 'data:application/octet-stream')

    // set the filename
    const filename = 'five-3840x1600.png'
    const headers = 'Content-Disposition'
    const data = 'application/octet-stream'

    /* In addition to <a>'s "download" attribute, you can define HTTP-style headers */
    dt = dt.replace(
      /^data:application\/octet-stream/,
      `data:${data};headers=${headers}%3A%20attachment%3B%20filename=${filename}`
    )

    this.href = dt
  }
  document.getElementById('dl').addEventListener('click', dlCanvas, false)
}

function buildGrid(props) {
  const { x0, y0, xStep, yStep, xMax, yMax, dropout } = props
  let grid = []

  let x = x0
  if (typeof x === 'undefined') x = xStep

  let y = y0
  if (typeof y === 'undefined') y = yStep

  // calculate xValues from x0 to xMax
  const xValues = []
  while (x < xMax - xStep) {
    xValues.push(x)
    x += xStep
  }

  // calculate yValues from y0 to yMax
  const yValues = []
  while (y < yMax - yStep) {
    yValues.push(y)
    y += yStep
  }

  // calculate grid [x,y] pairs
  xValues.forEach(xV => {
    yValues.forEach(yV => {
      if (typeof dropout !== 'undefined') {
        if (Math.random() > 1 - dropout) {
          grid.push([xV, yV])
        }
      } else {
        grid.push([xV, yV])
      }
    })
  })
  return grid
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
  ctx.canvas.height = 1600
  ctx.canvas.width = 3840

  // fill the canvas with black to start
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const grid = buildGrid({
    x0: 50,
    y0: 0,
    xStep: 90,
    yStep: 90,
    xMax: ctx.canvas.width,
    yMax: ctx.canvas.height,
    dropout: 0.3
  })
  grid.forEach(point => {
    demoShadowEffects({ x: point[0], y: point[1] })
  })
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
