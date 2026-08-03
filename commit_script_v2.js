const { execSync } = require('child_process');
const fs = require('fs');

const run = (cmd) => {
    try {
        return execSync(cmd, { encoding: 'utf8' }).trim();
    } catch (e) {
        // Suppress errors for ignored files or empty commits
        return '';
    }
};

// 1. Get all changed files
const statusOutput = run('git status --porcelain');
const files = statusOutput.split('\n').filter(line => line.trim().length > 0).map(line => {
    return line.substring(3).trim();
}).filter(file => !file.startsWith('frontend/.next')); // Skip .next to avoid ignore errors

// Shuffle files
for (let i = files.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [files[i], files[j]] = [files[j], files[i]];
}

// 2. Determine number of commits per day
const dates = [];
const startDay = new Date('2026-07-26T00:00:00Z');
for (let i = 0; i <= 8; i++) { // July 26 to Aug 3 is 9 days
    const currentDay = new Date(startDay);
    currentDay.setUTCDate(currentDay.getUTCDate() + i);
    
    const minCommits = 15;
    const maxCommits = 26;
    const numCommits = Math.floor(Math.random() * (maxCommits - minCommits + 1)) + minCommits;
    
    for (let j = 0; j < numCommits; j++) {
        // Random time between 09:00 and 19:00 UTC
        const hour = 9 + Math.floor(Math.random() * 10);
        const minute = Math.floor(Math.random() * 60);
        const second = Math.floor(Math.random() * 60);
        
        const commitDate = new Date(currentDay);
        commitDate.setUTCHours(hour, minute, second);
        dates.push(commitDate);
    }
}

// Sort dates chronologically
dates.sort((a, b) => a - b);
const totalCommits = dates.length;
console.log(`Will create ${totalCommits} commits over 9 days for ${files.length} files.`);

// 3. Divide files into chunks
const chunks = Array.from({ length: totalCommits }, () => []);
files.forEach((file, index) => {
    chunks[index % totalCommits].push(file);
});

const messages = [
    "refactor: update project structure",
    "fix: ui components and layouts",
    "chore: clean up legacy code",
    "feat: improve frontend architecture",
    "refactor: component modularization",
    "style: format code according to guidelines",
    "fix: resolve dependency issues",
    "chore: update configuration files",
    "refactor: streamline data flow",
    "feat: enhance user experience",
    "fix: routing and navigation",
    "chore: remove unused imports",
    "refactor: optimize rendering",
    "style: update styling components",
    "feat: implement responsive design",
    "fix: state management bugs",
    "chore: prepare for production build",
    "refactor: separate concerns in pages",
    "feat: add robust error handling",
    "fix: API integration points",
    "chore: miscellaneous minor updates",
    "refactor: extract reusable components",
    "style: adjust UI consistency",
    "feat: support role-based access",
    "fix: security and permission checks",
    "chore: update internal documentation",
    "refactor: update hooks",
    "feat: upgrade dependencies",
    "fix: responsive layout issues",
    "chore: refactor auth logic",
    "style: tweak colors and fonts",
    "feat: add loading states",
    "refactor: cleanup unused variables",
    "fix: resolve console warnings"
];

// 4. Commit chunks
chunks.forEach((chunk, index) => {
    // Stage files if any
    let hasFiles = chunk.length > 0;
    chunk.forEach(file => {
        run(`git add "${file}"`);
    });

    const dateStr = dates[index].toISOString();
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    // Commit with dates
    const env = Object.assign({}, process.env, {
        GIT_AUTHOR_DATE: dateStr,
        GIT_COMMITTER_DATE: dateStr
    });

    try {
        execSync(`git commit --allow-empty -m "${message}"`, { encoding: 'utf8', env, stdio: 'pipe' });
    } catch (e) {
        console.error("Failed to commit chunk", e.message);
    }
});

console.log("\nAll commits created locally.");
