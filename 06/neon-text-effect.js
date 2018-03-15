/// CSS text-effects in <canvas>

/// Shadow-based effects (parsing popular css-based text-effects)

const shadowColor = '#AAFF00'
var shadowStyles = {
	// http://line25.com/articles/using-css-text-shadow-to-create-cool-text-effects
	"one": {
		color: '#FFF',
		background: '#000',
		shadow: `0 0 10px #fff, 0 0 20px #fff, 0 0 30px #fff, 0 0 40px ${shadowColor}, 0 0 70px ${shadowColor}, 0 0 80px ${shadowColor}, 0 0 100px ${shadowColor}, 0 0 150px ${shadowColor}`
	}
}

function demoShadowEffects(offset) {
	function parseShadow(shadows) {
		shadows = shadows.split(', ')
		var ret = []
		for (var n = 0, length = shadows.length; n < length; n++) {
			var shadow = shadows[n].split(' ')
			var type = shadow[0].replace(parseFloat(shadow[0]), '')
			if (type == 'em') {
				var obj = {
					x: metrics.em * parseFloat(shadow[0]),
					y: metrics.em * parseFloat(shadow[1])
				}
			} else {
				var obj = {
					x: parseFloat(shadow[0]),
					y: parseFloat(shadow[1])
				}
			}
			if (shadow[3]) {
				obj.blur = parseFloat(shadow[2])
				obj.color = shadow[3]
			} else {
				obj.blur = 0
				obj.color = shadow[2]
			}
			ret.push(obj)
		}
		return ret
	}
	ctx.save()
	ctx.font = '20px Futura, Helvetica, sans-serif'
	// absolute position of the text (within a translation state)
	var offsetX = offset.x
	var offsetY = offset.y
	const textYTranslate = 40
	// gather information about the height of the font
	var metrics = getMetrics('thequickbrownfox', ctx.font)
	var textHeight = metrics.height * 5
	// loop through text-shadow based effects
	for (var text in shadowStyles) {
		var width = ctx.measureText(text).width
		var style = shadowStyles[text]

		// add a background to the current effect
		// ctx.fillStyle = style.background
		// ctx.fillRect(offsetX, offsetY, ctx.canvas.width, textHeight - 1)

		// parse text-shadows from css
		var shadows = parseShadow(style.shadow)
		// loop through the shadow collection
		var n = shadows.length
		while (n--) {
			var shadow = shadows[n]
			var totalWidth = width + shadow.blur * 2
			ctx.save()
			ctx.beginPath()
			ctx.rect(offsetX - shadow.blur, offsetY, offsetX + totalWidth, textHeight)
			ctx.clip()
			if (shadow.blur) {
				// just run shadow (clip text)
				ctx.shadowColor = shadow.color
				ctx.shadowOffsetX = shadow.x + totalWidth
				ctx.shadowOffsetY = shadow.y
				ctx.shadowBlur = shadow.blur
				ctx.fillText(text, -totalWidth + offsetX, offsetY + metrics.top + textYTranslate)
			} else {
				// just run pseudo-shadow
				ctx.fillStyle = shadow.color
				ctx.fillText(
					text,
					offsetX + (shadow.x || 0),
					offsetY - (shadow.y || 0) + metrics.top
				)
			}
			ctx.restore()
		}
		// drawing the text in the foreground
		if (style.color) {
			ctx.fillStyle = style.color
			ctx.fillText(text, offsetX, offsetY + metrics.top + textYTranslate)
		}
		// jump to next em-line
		ctx.translate(0, textHeight)
	}
	ctx.restore()
}

/// Neon light text-effect

function neonLightEffect() {
	var text = "alert('" + String.fromCharCode(0x2665) + "')"
	var font = '120px Futura, Helvetica, sans-serif'
	var jitter = 25 // the distance of the maximum jitter
	var offsetX = 30
	var offsetY = 70
	var blur = getBlurValue(100)
	// save state
	ctx.save()
	ctx.font = font
	// calculate width + height of text-block
	var metrics = getMetrics(text, font)
	// create clipping mask around text-effect
	ctx.rect(
		offsetX - blur / 2,
		offsetY - blur / 2,
		offsetX + metrics.width + blur,
		metrics.height + blur
	)
	ctx.clip()
	// create shadow-blur to mask rainbow onto (since shadowColor doesn't accept gradients)
	ctx.save()
	ctx.fillStyle = '#fff'
	ctx.shadowColor = 'rgba(0,0,0,1)'
	ctx.shadowOffsetX = metrics.width + blur
	ctx.shadowOffsetY = 0
	ctx.shadowBlur = blur
	ctx.fillText(text, -metrics.width + offsetX - blur, offsetY + metrics.top)
	ctx.restore()
	// create the rainbow linear-gradient
	var gradient = ctx.createLinearGradient(0, 0, metrics.width, 0)
	gradient.addColorStop(0, 'rgba(255, 0, 0, 1)')
	gradient.addColorStop(0.15, 'rgba(255, 255, 0, 1)')
	gradient.addColorStop(0.3, 'rgba(0, 255, 0, 1)')
	gradient.addColorStop(0.5, 'rgba(0, 255, 255, 1)')
	gradient.addColorStop(0.65, 'rgba(0, 0, 255, 1)')
	gradient.addColorStop(0.8, 'rgba(255, 0, 255, 1)')
	gradient.addColorStop(1, 'rgba(255, 0, 0, 1)')
	// change composite so source is applied within the shadow-blur
	ctx.globalCompositeOperation = 'source-atop'
	// apply gradient to shadow-blur
	ctx.fillStyle = gradient
	ctx.fillRect(
		offsetX - jitter / 2,
		offsetY,
		metrics.width + offsetX,
		metrics.height + offsetY
	)
	// change composite to mix as light
	ctx.globalCompositeOperation = 'lighter'
	// multiply the layer
	ctx.globalAlpha = 0.7
	ctx.drawImage(ctx.canvas, 0, 0)
	ctx.drawImage(ctx.canvas, 0, 0)
	ctx.globalAlpha = 1
	// draw white-text ontop of glow
	ctx.fillStyle = 'rgba(255,255,255,0.95)'
	ctx.fillText(text, offsetX, offsetY + metrics.top)
	// created jittered stroke
	ctx.lineWidth = 0.8
	ctx.strokeStyle = 'rgba(255,255,255,0.25)'
	var i = 10
	while (i--) {
		var left = jitter / 2 - Math.random() * jitter
		var top = jitter / 2 - Math.random() * jitter
		ctx.strokeText(text, left + offsetX, top + offsetY + metrics.top)
	}
	ctx.strokeStyle = 'rgba(0,0,0,0.20)'
	ctx.strokeText(text, offsetX, offsetY + metrics.top)
	ctx.restore()
}

function getBlurValue(blur) {
	var userAgent = navigator.userAgent
	if (userAgent && userAgent.indexOf('Firefox/4') != -1) {
		var kernelSize = blur < 8 ? blur / 2 : Math.sqrt(blur * 2)
		var blurRadius = Math.ceil(kernelSize)
		return blurRadius * 2
	}
	return blur
}
