const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

const webviewPath = path.join(__dirname, '..', 'public', 'webview.html');
const buildPath = path.join(__dirname, '..', 'build');

// Function to check internet connectivity with fallback
function checkInternet(cb) {
  const urls = ['https://gymtrackr-hub.vercel.app/', 'https://google.com'];
  let checked = 0;

  urls.forEach(url => {
    https.get(url, (res) => {
      checked++;
      if (res.statusCode < 400 && checked === 1) cb(true);
    }).on('error', (e) => {
      if (++checked === urls.length) cb(false);
    });
  });
}

// Get current src value from webview.html
function getCurrentUrl(callback) {
  fs.readFile(webviewPath, 'utf8', (err, data) => {
    if (err) return callback('placeholder');
    const match = data.match(/src="([^"]*)"/);
    callback(match ? match[1] : 'placeholder');
  });
}

// Update webview.html with the given URL only if different
function updateWebviewUrl(url) {
  getCurrentUrl(currentUrl => {
    if (currentUrl !== url) {
      fs.readFile(webviewPath, 'utf8', (err, data) => {
        if (err) throw err;
        const newData = data.replace(/src="[^"]*"/, `src="${url}"`);
        fs.writeFile(webviewPath, newData, 'utf8', (err) => {
          if (err) throw err;
          console.log(`Updated webview.html to use: ${url}`);
        });
      });
    } else {
      console.log(`webview.html already uses: ${url}`);
    }
  });
}

// Start the local server for build files
function startLocalServer(callback) {
  try {
    const serve = require('serve');
    const server = serve(buildPath, { port: 5000 });
    console.log('Serving build folder at http://localhost:5000');
    updateWebviewUrl('http://localhost:5000');
    callback();
  } catch (e) {
    console.error('Failed to start server with serve. Install serve or run "npx serve build" manually.');
    callback();
  }
}

// Open browser cross-platform
function openBrowser() {
  const commands = {
    darwin: 'open',
    win32: 'start',
    linux: 'xdg-open',
  };
  const cmd = commands[process.platform] || 'xdg-open';
  exec(`${cmd} ${webviewPath}`, (err) => {
    if (err) console.log('Failed to open browser, open public/webview.html manually.');
  });
}

// Main logic
console.log('Checking internet connection...');
checkInternet((isOnline) => {
  getCurrentUrl(currentUrl => {
    if (isOnline && currentUrl !== 'http://localhost:5000') {
      console.log('Internet available, using Vercel deployment.');
      updateWebviewUrl('https://gymtrackr-hub.vercel.app/');
      openBrowser();
    } else {
      console.log('No internet or local build preferred, building and serving locally...');
      exec('npm run build', (err) => {
        if (err) throw err;
        console.log('Build completed.');
        startLocalServer(openBrowser);
      });
    }
  });
});
