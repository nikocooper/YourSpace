
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

const PICS_DIR = path.join(__dirname, 'pics');
const POSTS_FILE = path.join(__dirname, 'posts.json');

// Make sure the pics directory and posts.json exist
fs.mkdirSync(PICS_DIR, { recursive: true });

if (!fs.existsSync(POSTS_FILE)) {
    fs.writeFileSync(POSTS_FILE, JSON.stringify([], null, 2));
}

app.use(express.json({ limit: '20mb' }));
app.use(express.static(__dirname));

// Get posts, newest first
app.get('/api/posts', (req, res) => {
    try {
        const posts = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8'));

        posts.sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        );

        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not read posts.' });
    }
});

// Save an image and its metadata
app.post('/save', (req, res) => {
    const postName = (req.body.filename || '').trim();
    const image = req.body.image;

    if (!postName || !image) {
        return res.status(400).send('Invalid post name or image.');
    }

    // Make a safe filename from the post name
    const safeName = postName.replace(/[^a-zA-Z0-9_-]/g, '_');

    if (!safeName) {
        return res.status(400).send('Invalid post name.');
    }

    // Add a timestamp so posts with the same name don't overwrite each other
    const imageFilename = safeName + '-' + Date.now() + '.png';
    const imagePath = path.join(PICS_DIR, imageFilename);

    // Convert the canvas image from Base64 into a file
    const imageData = image.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(imageData, 'base64');

    fs.writeFile(imagePath, buffer, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error saving image.');
        }

        // Create metadata for this post
        const newPost = {
            name: postName,
            filename: imageFilename,
            imagePath: '/pics/' + imageFilename,
            createdAt: new Date().toISOString()
        };

        // Read the existing posts
        fs.readFile(POSTS_FILE, 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Could not read posts.json.');
            }

            let posts;

            try {
                posts = JSON.parse(data);
            } catch (parseError) {
                console.error(parseError);
                return res.status(500).send('posts.json contains invalid JSON.');
            }

            // Add the new post at the beginning
            posts.unshift(newPost);

            // Write the updated list back to posts.json
            fs.writeFile(
                POSTS_FILE,
                JSON.stringify(posts, null, 2),
                (err) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send('Could not update posts.json.');
                    }

                    res.send('Post saved successfully!');
                }
            );
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
