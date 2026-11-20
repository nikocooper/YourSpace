
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

const PICS_DIR = path.join(__dirname, 'pics');

// Make sure pics directory exists
fs.mkdirSync(PICS_DIR, { recursive: true });

// Allow JSON image data
app.use(express.json({ limit: '20mb' }));

// Serve HTML files and images
app.use(express.static(__dirname));

// Get list of saved images
app.get('/api/images', (req, res) => {
    fs.readdir(PICS_DIR, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Could not read pics folder.' });
        }

        const images = files.filter(file =>
            /\.(png|jpg|jpeg|gif|webp)$/i.test(file)
        );

        res.json(images);
    });
});

// Save canvas image
app.post('/save', (req, res) => {
    let filename = path.basename(req.body.filename || '');
    filename = filename.replace(/\.png$/i, '');
    filename = filename.replace(/[^a-zA-Z0-9_-]/g, '');

    if (!filename || !req.body.image) {
        return res.status(400).send('Invalid filename or image.');
    }

    const imageData = req.body.image.replace(
        /^data:image\/png;base64,/,
        ''
    );

    const buffer = Buffer.from(imageData, 'base64');
    const filepath = path.join(PICS_DIR, filename + '.png');

    fs.writeFile(filepath, buffer, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error saving image.');
        }

        res.send('Image saved successfully!');
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
