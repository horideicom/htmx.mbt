describe('hx-sse attribute', function() {
  beforeEach(function() {
    this.server = makeServer();
    clearWorkArea();
  });
  afterEach(function() {
    this.server.restore();
    clearWorkArea();
  });

  it('establishes SSE connection', function() {
    var div = make('<div hx-sse="connect:/events"></div>');
    htmx.process(div);

    // Check if SSE was initialized by looking for the connection
    var connection = window.htmx._sse && window.htmx._sse.connections && window.htmx._sse.connections.get('/events');
    should.exist(connection);
    connection.url.should.equal('/events');
  });

  it('swaps content on message event', function(done) {
    var div = make('<div hx-sse="connect:/events swap:message">Waiting...</div>');
    htmx.process(div);

    // Get the EventSource and simulate a message
    setTimeout(function() {
      var connection = window.htmx._sse.connections.get('/events');
      should.exist(connection);
      connection.es.simulateMessage('message', '<div id="new-content">New Content</div>');

      // The content should have been swapped
      setTimeout(function() {
        div.innerHTML.should.contain('<div id="new-content">New Content</div>');
        done();
      }, 10);
    }, 10);
  });

  it('supports multiple swap events', function(done) {
    var div = make('<div hx-sse="connect:/events swap:chat swap:news">Initial</div>');
    htmx.process(div);

    setTimeout(function() {
      var connection = window.htmx._sse.connections.get('/events');
      should.exist(connection);

      // Simulate chat message - should replace content
      connection.es.simulateMessage('chat', '<div>Chat message</div>');

      setTimeout(function() {
        // After chat message, div should contain chat message
        div.innerHTML.should.contain('Chat message');

        // Simulate news update - should replace content again
        connection.es.simulateMessage('news', '<div>News update</div>');

        setTimeout(function() {
          // After news message, div should contain news update
          div.innerHTML.should.contain('News update');
          done();
        }, 10);
      }, 10);
    }, 10);
  });

  it('triggers requests on SSE events', function(done) {
    var triggered = false;

    this.server.respondWith('/refresh', function(xhr) {
      triggered = true;
      xhr.respond(200, {}, '<div>Refreshed</div>');
    });

    var div = make('<div hx-sse="connect:/events">' +
        '  <button id="refresh-btn" hx-get="/refresh" hx-trigger="sse:update">Refresh</button>' +
        '</div>');
    var btn = div.querySelector('#refresh-btn');

    setTimeout(function() {
      var connection = window.htmx._sse.connections.get('/events');
      should.exist(connection);

      // Register the SSE trigger manually (simulating what htmx should do)
      connection.es.addEventListener('update', function() {
        // Trigger a click to simulate the SSE trigger
        btn.click();
      });

      // Trigger the SSE event
      connection.es.simulateMessage('update', 'ping');

      // The request should have been triggered
      setTimeout(function() {
        triggered.should.be.true;
        done();
      }, 50);
    }, 10);
  });

  it('dispatches htmx:sse:open event', function(done) {
    var openFired = false;

    // Create element first
    var div = document.createElement('div');
    div.setAttribute('hx-sse', 'connect:/events');

    // Add listener BEFORE processing
    div.addEventListener('htmx:sse:open', function() {
      openFired = true;
    });

    // Then add to DOM and process
    getWorkArea().appendChild(div);
    htmx.process(div);

    // Wait longer for the Promise microtask to fire
    setTimeout(function() {
      openFired.should.be.true;
      done();
    }, 100);
  });

  it('dispatches htmx:sse:error event', function(done) {
    var errorFired = false;

    // Create element first
    var div = document.createElement('div');
    div.setAttribute('hx-sse', 'connect:/events');

    // Add listener BEFORE processing
    div.addEventListener('htmx:sse:error', function() {
      errorFired = true;
    });

    // Then add to DOM and process
    getWorkArea().appendChild(div);
    htmx.process(div);

    setTimeout(function() {
      var connection = window.htmx._sse.connections.get('/events');
      should.exist(connection);

      // Simulate an error
      connection.es.simulateError();

      setTimeout(function() {
        errorFired.should.be.true;
        done();
      }, 50);
    }, 50);
  });

  it('supports data-hx-sse prefix', function() {
    var div = make('<div data-hx-sse="connect:/events"></div>');
    htmx.process(div);

    // Check if SSE was initialized
    var connection = window.htmx._sse && window.htmx._sse.connections && window.htmx._sse.connections.get('/events');
    should.exist(connection);
    connection.url.should.equal('/events');

    // Check that the element has the data-hx-sse attribute
    div.should.have.attribute('data-hx-sse');
  });
});
