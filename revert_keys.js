const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.resolve(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory() && !file.includes('node_modules') && !file.includes('.next')) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('c:/Users/matub/OneDrive/Documents/BlockBid/web');
let count = 0;
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('"dummy_key"')) {
        content = content.replace(/\|\|\s*"dummy_key"/g, '|| ""');
        fs.writeFileSync(file, content);
        count++;
    }
});
console.log(`Reverted dummy_key in ${count} files.`);
