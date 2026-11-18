const fs = require('fs');
const files = ['about.html', 'projects.html', 'project-detail.html', 'contact.html', 'service-detail.html'];
const newLogo = `<div class="logo">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
            </svg>
            <span>Dreamspace</span>
        </div>`;

files.forEach(f => {
  try {
    let p = 'public/' + f;
    if (fs.existsSync(p)) {
        let content = fs.readFileSync(p, 'utf8');
        content = content.replace('<div class="logo">Dreamspace</div>', newLogo);
        fs.writeFileSync(p, content);
    }
  } catch (e) {}
});
