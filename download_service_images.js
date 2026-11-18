const fs = require('fs');
const path = require('path');
const https = require('https');

const imagesDir = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
}

const imagesToDownload = [
    // Architecture
    {
        filename: 'architecture-hero.jpg',
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80'
    },
    {
        filename: 'architecture-1.jpg',
        url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80'
    },
    {
        filename: 'architecture-2.jpg',
        url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80'
    },
    {
        filename: 'architecture-3.jpg',
        url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1000&q=80'
    },
    {
        filename: 'architecture-4.jpg',
        url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80'
    },
    {
        filename: 'architecture-5.jpg',
        url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1000&q=80'
    },
    {
        filename: 'architecture-6.jpg',
        url: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=1000&q=80'
    },

    // Interior Design
    {
        filename: 'interior-hero.jpg',
        url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80'
    },
    {
        filename: 'interior-1.jpg',
        url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=80'
    },
    {
        filename: 'interior-2.jpg',
        url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=80'
    },
    {
        filename: 'interior-3.jpg',
        url: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=1000&q=80'
    },
    {
        filename: 'interior-4.jpg',
        url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80'
    },
    {
        filename: 'interior-5.jpg',
        url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=80'
    },
    {
        filename: 'interior-6.jpg',
        url: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1000&q=80'
    },

    // Construction
    {
        filename: 'construction-hero.jpg',
        url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1600&q=80'
    },
    {
        filename: 'construction-1.jpg',
        url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=1000&q=80'
    },
    {
        filename: 'construction-2.jpg',
        url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1000&q=80'
    },
    {
        filename: 'construction-3.jpg',
        url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1000&q=80'
    },
    {
        filename: 'construction-4.jpg',
        url: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=1000&q=80'
    },
    {
        filename: 'construction-5.jpg',
        url: 'https://images.unsplash.com/photo-1531834685032-c34bf0d84c77?auto=format&fit=crop&w=1000&q=80'
    },
    {
        filename: 'construction-6.jpg',
        url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80'
    },

    // Missing project images if needed
    {
        filename: 'project-4.jpg',
        url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80'
    },
    {
        filename: 'project-5.jpg',
        url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80'
    },
    {
        filename: 'project-6.jpg',
        url: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=800&q=80'
    },
    {
        filename: 'gallery-placeholder.jpg',
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
    }
];

function downloadImage(item) {
    return new Promise((resolve, reject) => {
        const dest = path.join(imagesDir, item.filename);
        if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
            console.log(`Already exists: ${item.filename}`);
            return resolve();
        }

        const file = fs.createWriteStream(dest);
        const req = https.get(item.url, response => {
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                // follow redirect
                https.get(response.headers.location, redirectRes => {
                    redirectRes.pipe(file);
                    file.on('finish', () => {
                        file.close(() => {
                            console.log(`Downloaded (redirect): ${item.filename}`);
                            resolve();
                        });
                    });
                }).on('error', err => {
                    fs.unlink(dest, () => {});
                    console.error(`Error redirect for ${item.filename}:`, err.message);
                    resolve();
                });
                return;
            }

            if (response.statusCode !== 200) {
                console.error(`Failed ${item.filename}: HTTP ${response.statusCode}`);
                fs.unlink(dest, () => {});
                return resolve();
            }

            response.pipe(file);
            file.on('finish', () => {
                file.close(() => {
                    console.log(`Downloaded: ${item.filename}`);
                    resolve();
                });
            });
        });

        req.on('error', err => {
            fs.unlink(dest, () => {});
            console.error(`Error downloading ${item.filename}:`, err.message);
            resolve();
        });

        req.setTimeout(15000, () => {
            req.abort();
            fs.unlink(dest, () => {});
            console.error(`Timeout downloading ${item.filename}`);
            resolve();
        });
    });
}

async function run() {
    console.log(`Starting download of ${imagesToDownload.length} images...`);
    for (const item of imagesToDownload) {
        await downloadImage(item);
    }
    console.log('Finished image downloads!');
}

run();
