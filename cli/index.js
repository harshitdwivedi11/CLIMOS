#!/usr/bin/env node
const { Command } = require('commander');
const { spawn } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const readline = require('readline');
const FormData = require('form-data');
const readlineSync = require('readline-sync');
const passwordPrompt = require('minimal-password-prompt');

const program = new Command();

const CONFIG_DIR = path.join(os.homedir(), '.climos');
const TOKEN_PATH = path.join(CONFIG_DIR, 'token.json');
const BACKEND_URL = 'http://localhost:3000';
const AI_SERVICE_URL = 'http://localhost:5001';

function saveToken(token) {
  if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR, { recursive: true });
  fs.writeFileSync(TOKEN_PATH, JSON.stringify({ token }), { mode: 0o600 });
}

function loadToken() {
  if (!fs.existsSync(TOKEN_PATH)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
    return data.token;
  } catch {
    return null;
  }
}

async function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, ans => {
    rl.close();
    resolve(ans);
  }));
}


program
  .command('login')
  .description('Login to CLIMOS')
  .action(async () => {
    const username = await prompt('Username: ');
    const password = await passwordPrompt('Password: ');

    try {
      const response = await axios.post(`${BACKEND_URL}/login`, { username, password });
      const token = response.data.token;
      saveToken(token);
      console.log('Login successful!');
    } catch (error) {
      console.error('Login failed:', error.response?.data?.error || error.message);
      process.exit(1);
    }
  });

program
  .command('logout')
  .description('Logout from CLIMOS CLI')
  .action(() => {
    try {
      if (fs.existsSync(TOKEN_PATH)) {
        fs.unlinkSync(TOKEN_PATH);
        console.log('Successfully logged out.');
      } else {
        console.log('You are not logged in.');
      }
    } catch (err) {
      console.error('Error during logout:', err.message);
    }
  });

program
  .command('report')
  .description('Start a screen recording and generate a report')
  .action(() => {
    const token = loadToken();
    if (!token) {
      console.error('You must login first. Run: climos login');
      process.exit(1);
    }

    const problemId = uuidv4();
    const tmpDir = os.tmpdir();
    const timestamp = Date.now();
    const filename = `screenpipe-${timestamp}.cast`;
    const filepath = path.join(tmpDir, filename);

    console.log(`\nCLIMOS Starting screen recording...`);
    console.log(`CLIMOS Output file: ${filepath}`);
    console.log(`CLIMOS Press Ctrl+C to stop recording.\n`);

    try {
      const outStream = fs.createWriteStream(filepath);
      const screenpipe = spawn('screenpipe', [], { stdio: ['inherit', 'pipe', 'inherit'] });

      screenpipe.stdout.pipe(outStream);

      screenpipe.on('close', async (code) => {
        outStream.close();

        if (code !== 0) {
          console.error(`CLIMOS screenpipe exited with code ${code}`);
          try { fs.unlinkSync(filepath); } catch { }
          process.exit(code);
        }

        const metadata = {
          problemId,
          hostname: os.hostname(),
          platform: os.platform(),
          timestamp: new Date().toISOString(),
        };

        console.log('\nCLIMOS Recording complete. Uploading recording and metadata to backend...');

        try {
          const form = new FormData();
          form.append('file', fs.createReadStream(filepath));
          form.append('metadata', JSON.stringify(metadata));

          const response = await axios.post(`${BACKEND_URL}/recordings`, form, {
            headers: {
              ...form.getHeaders(),
              Authorization: `Bearer ${token}`,
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
          });

          console.log('CLIMOS Upload response:', response.data);

          // Optionally delete local file after upload
          try {
            fs.unlinkSync(filepath);
          } catch (err) {
            // ignore
          }

        } catch (error) {
          console.error('CLIMOS Upload failed:', error.response?.data?.error || error.message);
        }
      });

      process.on('SIGINT', () => {
        console.log('\nCLIMOS Stopping recording...');
        screenpipe.kill('SIGINT');
      });

    } catch (err) {
      console.error(`CLIMOS Error starting screenpipe: ${err.message}`);
      process.exit(1);
    }
  });


program
  .command('resolve')
  .description('Mark the last recorded bug as resolved or not resolved')
  .option('--resolved', 'Mark as resolved (default true)', true)
  .option('--not-resolved', 'Mark as not resolved')
  .action(async (options) => {
    const token = loadToken();
    if (!token) {
      console.error('You must login first. Run: climos login');
      process.exit(1);
    }

    const resolved = options.notResolved ? false : true;

    try {
      const response = await axios.patch(
        `${BACKEND_URL}/recordings/resolve-last`,
        { resolved },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log(`CLIMOS: ${response.data.message}`);
    } catch (error) {
      console.error('CLIMOS: Failed to update resolved status:', error.response?.data?.error || error.message);
    }
  });


program.parse(process.argv);
