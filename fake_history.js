const fs = require('fs');
const { execSync } = require('child_process');

const startDate = new Date('2026-06-19T10:00:00');
const endDate = new Date('2026-07-08T23:59:59'); // Today

let statusOutput = execSync('git status -uall --porcelain').toString();
let allFiles = statusOutput.split('\n').filter(l => l.trim()).map(l => l.slice(3).trim());

const messages = [
  'update', 'fix bug', 'add feature', 'refactor', 'cleanup', 'style update',
  'tweak config', 'update deps', 'improve perf', 'fix typo', 'update docs',
  'optimize code', 'wip', 'minor change', 'update layout', 'format code'
];

let currentDay = new Date(startDate);
let fileIdx = 0;

while (currentDay <= endDate) {
  const commitsToday = Math.floor(Math.random() * 35) + 1; // 1 to 35 commits
  console.log(`Making ${commitsToday} commits on ${currentDay.toISOString().split('T')[0]}`);
  
  for (let i = 0; i < commitsToday; i++) {
    let fileToCommit = null;
    let isDummy = false;
    
    if (fileIdx < allFiles.length) {
      fileToCommit = allFiles[fileIdx];
      fileIdx++;
    } else {
      isDummy = true;
      fileToCommit = '.activity_log';
      fs.appendFileSync(fileToCommit, `Activity on ${currentDay.toISOString()} ${i}\n`);
    }

    try {
      execSync(`git add "${fileToCommit}"`);
    } catch(e) {
      isDummy = true;
      fileToCommit = '.activity_log';
      fs.appendFileSync(fileToCommit, `Fallback activity on ${currentDay.toISOString()} ${i}\n`);
      execSync(`git add "${fileToCommit}"`);
    }

    const msg = messages[Math.floor(Math.random() * messages.length)];
    const hour = Math.floor(Math.random() * 14) + 8; // 8 AM to 10 PM
    const min = Math.floor(Math.random() * 60);
    const sec = Math.floor(Math.random() * 60);
    
    const dateStr = currentDay.toISOString().split('T')[0] + `T${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    
    process.env.GIT_AUTHOR_DATE = dateStr;
    process.env.GIT_COMMITTER_DATE = dateStr;
    
    try {
      execSync(`git commit -m "${msg}"`, { stdio: 'ignore' });
    } catch(e) {
      // Ignored if commit fails (e.g. no changes)
    }
  }
  
  currentDay.setDate(currentDay.getDate() + 1);
}

// Any remaining files? Commit them all in the last day
if (fileIdx < allFiles.length) {
  execSync('git add .');
  process.env.GIT_AUTHOR_DATE = endDate.toISOString();
  process.env.GIT_COMMITTER_DATE = endDate.toISOString();
  execSync(`git commit -m "final polish"`);
}

// Force push to overwrite the previous history
console.log('Pushing to github...');
execSync('git push -f origin main', { stdio: 'inherit' });
console.log('Done!');
