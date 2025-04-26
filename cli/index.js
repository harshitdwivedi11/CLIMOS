const { Command } = require('commander');
const { spawn } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const {v4: uuidv4} = require('uuid');

const program = new Command();

program
  .name('CLIMOS')
  .description('A CLI tool to record your terminal session and report metadata using screenpipe.')
  .version('1.0.0'); 

program
  .command('report')
  .description('Start a screen recording and generate a report')
  .action(() => {
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
          try { fs.unlinkSync(filepath); } catch {}
          process.exit(code);
        }

        const metadata = {
          problemId,
          hostname: os.hostname(),
          platform: os.platform(),
          timestamp: new Date().toISOString(),
          recordingPath: filepath,
        };

        console.log('\nCLIMOS Recording complete. Report:');
        console.log(JSON.stringify(metadata, null, 2));
        console.log('\nCLIMOS Uploading recording metadata to backend...');

        // POST
        try {
          const response = await axios.post('http://localhost:3000/recordings', metadata);
          console.log('CLIMOS Upload response:', response.data);
        } catch (error) {
          console.error('CLIMOS Upload failed:', error.message);
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

program.parse(process.argv);
