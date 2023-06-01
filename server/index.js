require('dotenv').config()
const express = require('express');
const cors = require('cors');
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const bodyParser = require('body-parser')

const app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors());

const keyFilename = path.join(__dirname, process.env.SERVICE_KEY_FILE_PATH)
const projectId = process.env.PROJECT_ID
const bucketName = process.env.BUCKET_NAME
const storage = new Storage({
  keyFilename,
  projectId
})



app.post('/signed-url', async (req, res) => {
  try {
    const { fileName, contentType } = req.body.data;
    const bucket = storage.bucket(bucketName);

    const options = {
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // URL expires in 15 minutes
      contentType: contentType,

    };
    const [url] = await bucket.file(fileName).getSignedUrl(options);

    res.json({ url });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    res.status(500).json({ error: 'Failed to generate signed URL.' });
  }
});

app.get('/signed-url', async (req, res) => {
  try {
    const { fileName } = req.query;
    const cacheControl = 'no-cache, no-store, must-revalidate';


    const currentDate = Date.now()

    const options = {
      version: 'v4',
      action: 'read',
      expires: currentDate + (15 * 1000) // URL expires in 15 seconds
    };

    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileName);
    const metadata = {
      cacheControl: cacheControl,
    };

    await file.setMetadata(metadata);
    const [url] = await file.getSignedUrl(options);
    res.json({ url });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    res.status(500).json({ error: 'Failed to generate signed URL.' });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`);
});
