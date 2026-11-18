const fs = require('fs');
const path = require('path');
const dir = 'c:/Users/krith/Downloads/mini project/public';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(f => {
    const p = path.join(dir, f);
    let c = fs.readFileSync(p, 'utf8');
    c = c.replace(/href="index\.html"/g, 'href="home.html"');
    c = c.replace(/href="login\.html"/g, 'href="index.html"');
    
    if (f === 'index.html') {
        c = c.replace(/data\.redirectTo \|\| '\/dashboard'/g, "'home.html'");
    }
    
    fs.writeFileSync(p, c);
    console.log('Updated', f);
});
