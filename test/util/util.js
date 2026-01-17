/* Test Utilities */

function byId(id) {
  return document.getElementById(id)
}

function make(htmlStr) {
  htmlStr = htmlStr.trim()
  var makeFn = function() {
    var range = document.createRange()
    var fragment = range.createContextualFragment(htmlStr)
    var wa = getWorkArea()
    var child = null
    var children = fragment.children || fragment.childNodes // IE
    var appendedChildren = []
    while (children.length > 0) {
      child = children[0]
      wa.appendChild(child)
      appendedChildren.push(child)
    }
    for (var i = 0; i < appendedChildren.length; i++) {
      htmx.process(appendedChildren[i])
    }
    return child // return last added element
  }
  if (getWorkArea()) {
    return makeFn()
  } else {
    ready(makeFn)
  }
}

function ready(fn) {
  if (document.readyState !== 'loading') {
    fn()
  } else {
    document.addEventListener('DOMContentLoaded', fn)
  }
}

function getWorkArea() {
  return byId('work-area')
}

function clearWorkArea() {
  var workArea = getWorkArea()
  if (workArea) workArea.innerHTML = ''

  // Clean up IntersectionObservers to prevent test runner hangs
  if (window.htmx && window.htmx._internal && window.htmx._internal.cleanupRevealedObservers) {
    try {
      window.htmx._internal.cleanupRevealedObservers()
    } catch (e) {
      console.warn('Failed to cleanup revealed observers:', e)
    }
  }

  // Clean up SSE connections
  if (window.htmx && window.htmx._cleanupSSE) {
    try {
      window.htmx._cleanupSSE()
    } catch (e) {
      console.warn('Failed to cleanup SSE connections:', e)
    }
  }
}

function removeWhiteSpace(str) {
  return str.replace(/\s/g, '')
}

function getHTTPMethod(xhr) {
  return xhr.requestHeaders['X-HTTP-Method-Override'] || xhr.method
}

function makeServer() {
  var server = sinon.fakeServer.create()
  server.fakeHTTPMethods = true
  server.getHTTPMethod = function(xhr) {
    return getHTTPMethod(xhr)
  }
  return server
}

function parseParams(str) {
  var re = /([^&=]+)=?([^&]*)/g
  var decode = function(str) {
    return decodeURIComponent(str.replace(/\+/g, ' '))
  }
  var params = {}; var e
  if (str) {
    if (str.slice(0, 1) == '?') {
      str = str.slice(1)
    }
    while (e = re.exec(str)) {
      var k = decode(e[1])
      var v = decode(e[2])
      if (params[k] !== undefined) {
        if (!Array.isArray(params[k])) {
          params[k] = [params[k]]
        }
        params[k].push(v)
      } else {
        params[k] = v
      }
    }
  }
  return params
}

function getQuery(url) {
  var question = url.indexOf('?')
  var hash = url.indexOf('#')
  if (hash == -1 && question == -1) return ''
  if (hash == -1) hash = url.length
  return question == -1 || hash == question + 1
    ? url.substring(hash)
    : url.substring(question + 1, hash)
}

function getParameters(xhr) {
  if (getHTTPMethod(xhr) == 'GET') {
    return parseParams(getQuery(xhr.url))
  } else {
    return parseParams(xhr.requestBody)
  }
}

function log(val) {
  console.log(val)
  return val
}

// Mock EventSource for SSE testing
// This allows tests to simulate Server-Sent Events without a real server
function MockEventSource(url) {
  this.url = url
  this.readyState = 0 // CONNECTING
  this.listeners = {}
  this.onopen = null
  this.onmessage = null
  this.onerror = null
  this._openFired = false
  this._element = null // Track the element for event dispatching
  this._pendingOpen = false // Track if open should be fired when onopen is set

  var self = this
  this._fireOpen = function() {
    if (this._openFired) return
    this._openFired = true
    this.readyState = 1 // OPEN

    // Call onopen handler
    if (this.onopen) {
      try {
        this.onopen({ type: 'open', target: this })
      } catch (e) {
        console.error('[MockEventSource] onopen error:', e)
      }
    }
  }

  // Fire open after a delay to allow onopen to be set
  this._scheduleOpen = function() {
    if (this._pendingOpen) return
    this._pendingOpen = true
    Promise.resolve().then(function() {
      self._fireOpen()
    })
  }

  // Schedule open event
  this._scheduleOpen()
}

// Override onopen setter to fire event immediately when set
Object.defineProperty(MockEventSource.prototype, 'onopen', {
  get: function() {
    return this._onopenValue
  },
  set: function(fn) {
    this._onopenValue = fn
    // If open hasn't fired yet and we're setting the handler, fire it soon
    if (!this._openFired && this._pendingOpen) {
      // The scheduled open will fire and call this handler
    }
    // If open already fired, call the handler immediately
    if (this._openFired && fn) {
      try {
        fn({ type: 'open', target: this })
      } catch (e) {
        console.error('[MockEventSource] onopen error:', e)
      }
    }
  }
})

MockEventSource.prototype.addEventListener = function(event, callback) {
  if (!this.listeners[event]) {
    this.listeners[event] = []
  }
  this.listeners[event].push(callback)
}

MockEventSource.prototype.removeEventListener = function(event, callback) {
  if (this.listeners[event]) {
    this.listeners[event] = this.listeners[event].filter(function(cb) {
      return cb !== callback
    })
  }
}

// Simulate receiving an SSE message
MockEventSource.prototype.simulateMessage = function(event, data) {
  var evt = {
    data: data,
    type: event || 'message',
    target: this,
    currentTarget: this
  }

  // Call onmessage if it's the default message event
  if ((!event || event === 'message') && this.onmessage) {
    this.onmessage(evt)
  }

  // Call specific event listeners
  if (this.listeners[event]) {
    for (var i = 0; i < this.listeners[event].length; i++) {
      this.listeners[event][i](evt)
    }
  }
}

// Simulate an error
MockEventSource.prototype.simulateError = function(error) {
  this.readyState = 2 // CLOSED
  if (this.onerror) {
    this.onerror(error || { type: 'error' })
  }
}

MockEventSource.prototype.close = function() {
  this.readyState = 2 // CLOSED
}

// Set up MockEventSource for tests
window.MockEventSource = MockEventSource

// Clean up MockEventSource connections between tests
if (!window.htmx) window.htmx = {}
window.htmx._cleanupSSE = function() {
  if (window.htmx._sse && window.htmx._sse.connections) {
    // Close all EventSources
    for (const [url, connection] of window.htmx._sse.connections) {
      if (connection.es && connection.es.close) {
        try {
          connection.es.close()
        } catch (e) {
          // Ignore errors during close
        }
      }
    }
    window.htmx._sse.connections.clear()
  }
  // Reset _sseProcessed flags on all elements
  const processedElements = document.querySelectorAll('[data-sse-processed]')
  for (const el of processedElements) {
    el.removeAttribute('data-sse-processed')
  }
  // Also check for the _sseProcessed property
  const allElements = document.querySelectorAll('*')
  for (const el of allElements) {
    if (el._sseProcessed) {
      el._sseProcessed = false
    }
  }
}
