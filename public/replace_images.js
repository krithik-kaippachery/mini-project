const fs = require('fs');
const path = require('path');
const dir = 'c:/Users/krith/Downloads/mini project/public';

// Create images directory
const imgDir = path.join(dir, 'images');
if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir);
}

// Add a README.txt to the images directory
fs.writeFileSync(path.join(imgDir, 'README.txt'), 'Place your custom images and videos in this folder. Make sure the filenames match the ones referenced in the HTML files (e.g., hero-video.mp4, project-1.jpg, team-1.jpg, etc.).');

const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') || f.endsWith('.css'));

files.forEach(f => {
    const p = path.join(dir, f);
    let c = fs.readFileSync(p, 'utf8');

    // Replace videos
    c = c.replace(/https:\/\/cdn\.coverr\.co\/videos\/coverr-luxury-apartment-interior-2942\/1080p\.mp4/g, 'images/hero-video.mp4');

    // Replace Design vs Delivered Slider
    c = c.replace(/https:\/\/images\.unsplash\.com\/photo-1600607687920-4e2a09cf159d\?auto=format&fit=crop&w=1000&q=80/g, 'images/slider-delivered.jpg');
    c = c.replace(/https:\/\/images\.unsplash\.com\/photo-1618221195710-dd6b41faaea6\?auto=format&fit=crop&w=1000&q=80/g, 'images/slider-design.jpg');

    // Replace About page images
    c = c.replace(/https:\/\/images\.unsplash\.com\/photo-1600585154340-be6161a56a0c\?auto=format&fit=crop&w=800&q=80/g, 'images/about-studio.jpg');
    c = c.replace(/https:\/\/images\.unsplash\.com\/photo-1560250097-0b93528c311a\?auto=format&fit=crop&w=600&q=80/g, 'images/team-1.jpg');
    c = c.replace(/https:\/\/images\.unsplash\.com\/photo-1573496359142-b8d87734a5a2\?auto=format&fit=crop&w=600&q=80/g, 'images/team-2.jpg');
    c = c.replace(/https:\/\/images\.unsplash\.com\/photo-1519085360753-af0119f7cbe7\?auto=format&fit=crop&w=600&q=80/g, 'images/team-3.jpg');

    // Replace Projects Grid
    c = c.replace(/https:\/\/images\.unsplash\.com\/photo-1600210491369-e753d80a41f3\?auto=format&fit=crop&w=600&q=80/g, 'images/project-1.jpg');
    c = c.replace(/https:\/\/images\.unsplash\.com\/photo-1600596542815-ffad4c1539a9\?auto=format&fit=crop&w=600&q=80/g, 'images/project-2.jpg');
    c = c.replace(/https:\/\/images\.unsplash\.com\/photo-1512917774080-9991f1c4c750\?auto=format&fit=crop&w=600&q=80/g, 'images/project-3.jpg');
    c = c.replace(/https:\/\/images\.unsplash\.com\/photo-1618221195710-dd6b41faaea6\?auto=format&fit=crop&w=600&q=80/g, 'images/project-4.jpg');
    c = c.replace(/https:\/\/images\.unsplash\.com\/photo-1600607687920-4e2a09cf159d\?auto=format&fit=crop&w=600&q=80/g, 'images/project-5.jpg');
    c = c.replace(/https:\/\/images\.unsplash\.com\/photo-1556912172-45b7abe8b7e1\?auto=format&fit=crop&w=600&q=80/g, 'images/project-6.jpg');

    // Replace remaining JS Object Unsplash URLs in detail pages using a generic regex replacement
    c = c.replace(/https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9-]+\?auto=format&fit=crop&w=\d+&q=80/g, 'images/gallery-placeholder.jpg');

    fs.writeFileSync(p, c);
    console.log('Processed', f);
});
