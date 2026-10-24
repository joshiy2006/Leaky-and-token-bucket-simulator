// server.js
const express = require('express');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
app.use(bodyParser.json({ limit: '5mb' })); // allow reasonably large payloads

// Helper to run the C++ simulator binary with JSON input via stdin
function runSimulator(jsonInput) {
  return new Promise((resolve, reject) => {
    // Assuming the binary is built to "../backend/build/simulator" (relative to api folder)
    const binaryPath = path.resolve(__dirname, '../backend/build/simulator');
    const proc = spawn(binaryPath, [], { stdio: ['pipe', 'pipe', 'pipe'] });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', data => { stdout += data.toString(); });
    proc.stderr.on('data', data => { stderr += data.toString(); });

    proc.on('error', err => reject(err));
    proc.on('close', code => {
      if (code === 0) {
        try {
          const parsed = JSON.parse(stdout);
          resolve(parsed);
        } catch (e) {
          reject(new Error('Failed to parse simulator output as JSON'));
        }
      } else {
        // If simulator printed an error JSON to stderr, forward that
        try {
          const errObj = JSON.parse(stderr);
          reject(new Error(errObj.error || 'Simulator error'));
        } catch (_) {
          reject(new Error(`Simulator exited with code ${code}: ${stderr}`));
        }
      }
    });

    // Send the JSON input
    proc.stdin.write(JSON.stringify(jsonInput));
    proc.stdin.end();
  });
}

// POST /api/simulate/:algo (algo = token-bucket | leaky-bucket)
app.post('/api/simulate/:algo', async (req, res) => {
  const algo = req.params.algo;
  if (!['token-bucket', 'leaky-bucket'].includes(algo)) {
    return res.status(400).json({ error: 'Unsupported algorithm' });
  }
  const config = req.body;
  // Ensure required fields are present – minimal validation
  if (!config.steps || !Array.isArray(config.arrivals)) {
    return res.status(400).json({ error: 'Missing required fields: steps, arrivals' });
  }
  // Translate URL param to the value expected by the C++ engine
  config.algorithm = algo === 'token-bucket' ? 'token_bucket' : 'leaky_bucket';

  try {
    const result = await runSimulator(config);
    res.json(result);
  } catch (err) {
    console.error('Simulation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Network Simulator API listening on port ${PORT}`);
});
