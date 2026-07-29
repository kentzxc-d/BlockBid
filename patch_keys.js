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
        } else if (file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('c:/Users/matub/OneDrive/Documents/BlockBid/web/app/api');
let count = 0;
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('supabaseUrl') || content.includes('supabaseKey') || content.includes('supabaseServiceKey')) {
        content = content.replace(/\|\|\s*""/g, '|| "dummy_key"');
        content = content.replace(/\|\|\s*''/g, '|| "dummy_key"');
        fs.writeFileSync(file, content);
        count++;
    }
});
console.log(`Patched ${count} API routes with dummy_key fallback.`);
