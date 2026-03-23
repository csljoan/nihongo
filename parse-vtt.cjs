const fs = require('fs');

const vtt = fs.readFileSync('./tattoo.ja.vtt', 'utf-8');
const lines = vtt.split('\n');
const entries = [];
let time = null;

for (const line of lines) {
  const ts = line.match(/^(\d+):(\d+):(\d+)\.(\d+)\s+-->/);
  if (ts) {
    time = parseInt(ts[1]) * 3600 + parseInt(ts[2]) * 60 + parseInt(ts[3]);
  } else if (line.trim() && !line.startsWith('WEBVTT') && !line.startsWith('Kind') && !line.startsWith('Language') && time !== null) {
    entries.push({ time, jp: line.trim() });
    time = null;
  }
}

// Print as JS array for easy review
entries.forEach((e, i) => console.log(`${i+1}. [${e.time}s] ${e.jp}`));
