import axios from 'axios';
import FormData from 'form-data';

async function testUpload() {
  const cloudName = 'devxvla87';
  const uploadPreset = 'ecommerce';
  
  const formData = new FormData();
  formData.append('file', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');
  formData.append('upload_preset', uploadPreset);

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      formData,
      { headers: formData.getHeaders() }
    );
    console.log("SUCCESS:", response.data);
  } catch (err) {
    if (err.response) {
      console.log("ERROR DATA:", err.response.data);
    } else {
      console.log("ERROR:", err.message);
    }
  }
}
testUpload();
