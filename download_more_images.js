const fs = require('fs');
const path = require('path');
const https = require('https');

const imagesDir = path.join(__dirname, 'public', 'images');

const newImages = [
    // Architecture
    {
        filename: 'architecture-7.jpg',
        url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=80'
    },
    {
        filename: 'architecture-8.jpg',
        url: 'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1000&q=80'
    },
    {
        filename: 'architecture-9.jpg',
        url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80'
    },
    {
        filename: 'architecture-10.jpg',
        url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1000&q=80'
    },

    // Interior
    {
        filename: 'interior-7.jpg',
        url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80'
    },
    {
        filename: 'interior-8.jpg',
        url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80'
    },
    {
        filename: 'interior-9.jpg',
        url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1000&q=80'
    },
    {
        filename: 'interior-10.jpg',
        url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=80'
    },

    // Construction
    {
        filename: 'construction-7.jpg',
        url: 'https://images.unsplash.com/photo-1508873696983-2df5703bc30f?auto=format&fit=crop&w=1000&q=80'
    },
    {
        filename: 'construction-8.jpg',
        url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1000&q=80'
    },
    {
        filename: 'construction-9.jpg',
        url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1000&q=80'
    },
    {
        filename: 'construction-10.jpg',
        url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1000&q=80'
    }
];

function downloadImage(item) {
    return new Promise((resolve) => {
        const dest = path.join(imagesDir, item.filename);
        if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
            console.log(`Already exists: ${item.filename}`);
            return resolve();
        }

        const file = fs.createWriteStream(dest);
        const req = https.get(item.url, response => {
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                https.get(response.headers.location, redirectRes => {
                    redirectRes.pipe(file);
                    file.on('finish', () => {
                        file.close(() => {
                            console.log(`Downloaded (redirect): ${item.filename} (${fs.statSync(dest).size} bytes)`);
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
                    console.log(`Downloaded: ${item.filename} (${fs.statSync(dest).size} bytes)`);
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
    console.log(`Downloading ${newImages.length} additional images...`);
    for (const item of newImages) {
        await downloadImage(item);
    }
    console.log('Done downloading images!');
}

run();
