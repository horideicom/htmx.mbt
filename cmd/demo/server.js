const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    console.log(`${req.method} ${pathname}`);

    // CORS headers (for safety, though we serve static from same origin)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'HX-Request, HX-Target, HX-Trigger, HX-Swap');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Static files
    if (pathname === '/') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
            if (err) { res.writeHead(500); res.end('Error loading index.html'); }
            else { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(data); }
        });
        return;
    }
    if (pathname === '/main.js') {
        // MoonBitビルド出力から配信
        const mainJsPath = path.join(__dirname, '../../_build/js/release/build/cmd/main/main.js');
        fs.readFile(mainJsPath, (err, data) => {
            if (err) { res.writeHead(500); res.end('Error loading main.js: ' + err.message); }
            else { res.writeHead(200, { 'Content-Type': 'text/javascript' }); res.end(data); }
        });
        return;
    }

    // API Endpoints
    if (pathname === '/api/hello') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<strong>Hello from htmx.mbt!</strong>');
        return;
    }

    if (pathname === '/api/time') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`Time: ${new Date().toLocaleTimeString()}`);
        return;
    }

    if (pathname === '/api/clear') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(``);
        return;
    }

    if (pathname === '/api/submit' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            // Just acknowledge submission
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`<div class="success" style="color: green; border: 1px solid green; padding: 10px;">
                ✅ Form received!<br>
                Payload Size: ${body.length} bytes
             </div>`);
        });
        return;
    }

    if (pathname === '/api/morph') { // POST
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            const ts = new Date().toLocaleTimeString();
            // Return updated form html
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
            <form hx-post="/api/morph" hx-target="#morph-demo" hx-swap="morph">
                <label>Type here (should keep focus): <input type="text" name="q" value="Focus me"></label>
                <button type="submit">Morph Update</button>
            </form>
            <p>Last update: <span id="morph-ts">${ts}</span></p>
             `);
        });
        return;
    }

    if (pathname === '/api/full-page') {
        // hx-select demo
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
         <html><body>
           <header>Header (Ignored)</header>
           <div id="content-only">
               <p style="color: purple; font-weight: bold;">This content was extracted from a full HTML page via hx-select!</p>
               <p>Timestamp: ${new Date().toISOString()}</p>
           </div>
           <footer>Footer (Ignored)</footer>
         </body></html>
         `);
        return;
    }

    if (pathname === '/api/oob-demo') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
         <div>Main response content: <strong>Request Successful</strong></div>
         <div id="oob-target" hx-swap-oob="true" style="background: #e6f3ff; border: 1px solid blue; padding: 10px;">
             ⚡️ OOB Update occurred at ${new Date().toLocaleTimeString()}!
         </div>
         `);
        return;
    }

    if (pathname === '/api/oob-custom') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
         <div>Main response: Updated at ${new Date().toLocaleTimeString()}</div>
         <div id="sidebar" hx-swap-oob="innerHTML:#sidebar" style="background: rgba(255, 107, 107, 0.3); padding: 10px; border-radius: 8px;">
             ✅ Sidebar updated via <code>innerHTML:#sidebar</code> at ${new Date().toLocaleTimeString()}
         </div>
         `);
        return;
    }

    if (pathname === '/api/oob-delete') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
         <div>Response: Temp element will be deleted</div>
         <div id="temp-element" hx-swap-oob="delete"></div>
         `);
        return;
    }

    if (pathname.startsWith('/api/page')) {
        const page = pathname.replace('/api/', '');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
        <h3>You are on ${page}</h3>
        <p>The URL bar should now reflect the new state.</p>
        <button hx-get="/api/time" hx-target="this" hx-swap="outerHTML">Check Time</button>
        <p><a href="/" hx-get="/" hx-target="body">Back to Home</a></p>
        `);
        return;
    }

    // ========== New Endpoints ==========

    // Validation endpoint
    if (pathname === '/api/validate' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`<div style="color: green;">✅ Validation passed! Form submitted at ${new Date().toLocaleTimeString()}</div>`);
        });
        return;
    }

    // PUT endpoint
    if (pathname === '/api/put' && req.method === 'PUT') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`<div style="color: cyan;">🔄 PUT request received at ${new Date().toLocaleTimeString()}</div>`);
        });
        return;
    }

    // DELETE endpoint
    if (pathname === '/api/delete' && req.method === 'DELETE') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`<div style="color: orange;">🗑️ DELETE request successful at ${new Date().toLocaleTimeString()}</div>`);
        return;
    }

    // PATCH endpoint
    if (pathname === '/api/patch' && req.method === 'PATCH') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`<div style="color: yellow;">🩹 PATCH request applied at ${new Date().toLocaleTimeString()}</div>`);
        });
        return;
    }

    // Trigger: once counter
    let onceCount = 0;
    if (pathname === '/api/once') {
        onceCount++;
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`<span>Clicked ${onceCount} time(s)</span>`);
        return;
    }

    // Trigger: delay/throttle test
    if (pathname === '/api/delay') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`<span>Search result for: ${url.searchParams.get('q') || 'empty'} at ${new Date().toLocaleTimeString()}</span>`);
        return;
    }

    if (pathname === '/api/throttle') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`<span>Throttled click at ${new Date().toLocaleTimeString()}</span>`);
        return;
    }

    // Extended target selectors
    if (pathname === '/api/update-container') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`Container updated at ${new Date().toLocaleTimeString()}`);
        return;
    }

    if (pathname === '/api/update-next') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`<span style="color: lime;">Next element updated! ${new Date().toLocaleTimeString()}</span>`);
        return;
    }

    if (pathname === '/api/update-find') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`<strong>Found element updated!</strong>`);
        return;
    }

    // Scroll demo
    if (pathname === '/api/scroll-demo') {
        const lines = Array.from({ length: 10 }, (_, i) => `<p>Line ${i + 1} - Added at ${new Date().toLocaleTimeString()}</p>`).join('');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(lines);
        return;
    }

    // Changed modifier demo
    if (pathname === '/api/changed') {
        const value = url.searchParams.get('value') || '';
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`<div style="color: lightgreen;">Value changed to: "${value}"</div>`);
        return;
    }

    // Global event demo (from:document)
    if (pathname === '/api/global-event') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`<span>Global event triggered! ${new Date().toLocaleTimeString()}</span>`);
        return;
    }

    res.writeHead(404);
    res.end('Not Found');
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log('Press Ctrl+C to stop');
});
