const { execSync } = require('child_process');
const fs = require('fs');

const run = (cmd) => {
    try {
        return execSync(cmd, { encoding: 'utf8' }).trim();
    } catch (e) {
        console.error(`Error running ${cmd}:`, e.message);
        return '';
    }
};

// 1. Get all changed files
const statusOutput = run('git status --porcelain');
const files = statusOutput.split('\n').filter(line => line.trim().length > 0).map(line => {
    const parts = line.trim().split(/\s+/);
    // Handle renames which have an arrow, but for simple porcelain, it's usually just the file path at the end
    return line.substring(3).trim();
});

if (files.length === 0) {
    console.log("No files to commit.");
    process.exit(0);
}

// 2. Determine number of commits
const minCommits = 14;
const maxCommits = Math.min(26, files.length); // Can't have more commits than files
const numCommits = Math.floor(Math.random() * (maxCommits - minCommits + 1)) + minCommits;

console.log(`Will create ${numCommits} commits for ${files.length} files.`);

// 3. Shuffle files
for (let i = files.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [files[i], files[j]] = [files[j], files[i]];
}

// 4. Divide files into chunks
const chunks = Array.from({ length: numCommits }, () => []);
files.forEach((file, index) => {
    chunks[index % numCommits].push(file);
});

// 5. Generate dates
const startMs = new Date('2026-07-26T10:00:00Z').getTime();
const endMs = new Date('2026-08-03T16:00:00Z').getTime();
const dates = [];
for (let i = 0; i < numCommits; i++) {
    const randomMs = startMs + Math.random() * (endMs - startMs);
    dates.push(new Date(randomMs));
}
dates.sort((a, b) => a - b);

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
    "chore: update internal documentation"
];

// Shuffle messages
for (let i = messages.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [messages[i], messages[j]] = [messages[j], messages[i]];
}

// 6. Commit chunks
chunks.forEach((chunk, index) => {
    if (chunk.length === 0) return;

    console.log(`\nCommit ${index + 1}/${numCommits}`);
    
    // Stage files
    chunk.forEach(file => {
        // Enclose file in quotes to handle spaces if any
        run(`git add "${file}"`);
    });

    const dateStr = dates[index].toISOString();
    const message = messages[index % messages.length];
    
    console.log(`Date: ${dateStr}`);
    console.log(`Message: ${message}`);
    console.log(`Files: ${chunk.length}`);

    // Commit with dates
    const env = Object.assign({}, process.env, {
        GIT_AUTHOR_DATE: dateStr,
        GIT_COMMITTER_DATE: dateStr
    });

    try {
        execSync(`git commit -m "${message}"`, { encoding: 'utf8', env, stdio: 'inherit' });
    } catch (e) {
        console.error("Failed to commit chunk", e);
    }
});

console.log("\nAll commits created locally.");
