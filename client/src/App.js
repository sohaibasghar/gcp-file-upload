import React, { useState } from 'react';
import axios from 'axios';

const App = () => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };


  const handleUpload = async () => {
    const file = selectedFile
    try {
      const fileName = file.name;
      const contentType = file.type;

      // Request a signed URL from the backend
      const response = await axios.post('http://localhost:4000/signed-url', {
        data: {
          fileName,
          contentType
        }
      });

      const { url } = response.data;

      // Upload the file directly to GCS using the signed URL
      await axios.put(url, file, {
        headers: {
          "Content-Type": contentType,
        },
      });

      console.log('File uploaded successfully.');
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default App