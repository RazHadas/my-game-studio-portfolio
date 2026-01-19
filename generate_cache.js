const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const gamesDir = path.join(rootDir, 'games');

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== '.idea') {
                arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
            }
        } else {
            arrayOfFiles.push(path.join(dirPath, "/", file));
        }
    });

    return arrayOfFiles;
}

const allFiles = getAllFiles(gamesDir);

const relevantExtensions = ['.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.svg', '.gif', '.mp3', '.wav'];
const excludedFiles = ['server.js', 'package.json', 'package-lock.json'];

const cacheList = allFiles
    .filter(file => {
        const ext = path.extname(file).toLowerCase();
        const basename = path.basename(file);
        return relevantExtensions.includes(ext) && !excludedFiles.includes(basename);
    })
    .map(file => {
        // Convert absolute path to relative PWA path
        let relativePath = path.relative(rootDir, file);
        // Replace backslashes with forward slashes for URL compatibility
        relativePath = relativePath.replace(/\\/g, '/');
        return './' + relativePath;
    });

console.log(JSON.stringify(cacheList, null, 2));
