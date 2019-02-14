import { createdom, capitalize } from './util'
import Keyboard from './keyboard'
import { Options as OPTIONS, Mixins } from 'lib/input'
import 'lib/style/input.styl'

export default function Input(el, options) {
  if (typeof el === 'string') {
    el = document.querySelector(el)
  }

  options = Object.assign({}, OPTIONS, options)

  this.init(options)

  let classnames = ['numeric-input']
  if (this.kp.readonly) {
    classnames.push('readonly')
  }
  if (this.kp.disabled) {
    classnames.push('disabled')
  }

  let element = createdom({
    tag: 'div',
    attrs: {
      'class': classnames.join(' ')
    },
    children: [
      {
        tag: 'input',
        attrs: {
          type: 'hidden',
          name: this.kp.name,
          value: this.kp.value
        }
      },
      {
        tag: 'div'
      }
    ]
  })

  this.$input = element.querySelector('input')
  this.$fakeinput = element.querySelector('div')

  el.parentNode.replaceChild(element, el)
  this.onMounted(element)
  this.renderInput()

  element.addEventListener('touchend', this.onFocus.bind(this), false)
}

Input.prototype = Object.assign({}, Mixins)
Input.prototype.constructor = Input

Input.prototype.set = function(key, value) {
  Mixins.set.call(this, key, value)
  if (key === 'cursorTimer' || key === 'rawValue') {
    this.renderInput()
  }
}

Input.prototype.dispatch = function (event, ...args) {
  const callback = this.kp[`on${capitalize(event)}`]
  if (callback) {
    callback(...args)
  } 
}

Input.prototype.createKeyboard = function (el, options, events, callback) {
  const element = document.createElement('div')
  el.appendChild(element)
  for (let event in events) {
    options[`on${capitalize(event)}`] = events[event]
  }
  callback(new Keyboard(element, options))
}

Input.prototype.destroyKeyboard = function (el, keyboard) {
  keyboard.destroy()
}

Input.prototype.renderInput = function () {
  let html = ''
  if (this.ks.rawValue.length === 0) {
    html += `<div class="numeric-input-placeholder">${this.kp.placeholder}</div>`
  }
  else {
    html += '<div class="numeric-input-text">'
    for (let i = 0; i < this.ks.rawValue.length ; i++) {
      html += `<span data-index="${i}">${this.ks.rawValue[i]}</span>`
    }
    html += '</div>'
  }
  if (this.ks.cursorTimer) {
    html += `<div class="numeric-input-cursor" style="background: ${this.ks.cursorColor}"></div>`
  }
  this.$fakeinput.innerHTML = html
}
