import { useState } from "react";
import axios from "axios";

export default function TestUpload() {
  const [productId, setProductId] = useState(1);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");

  const uploadImage = async () => {
    if (!file) {
      setStatus("❌ Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("files", file); // MUST be 'files'

    try {
      const response = await axios.post(
        `http://localhost:8000/api/v1/temp/products/${productId}/images/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("UPLOAD SUCCESS:", response.data);
      setStatus("✅ Upload successful");
    } catch (error) {
      console.error("UPLOAD ERROR:", error);

      if (error.response) {
        setStatus(`❌ ${error.response.status}: ${JSON.stringify(error.response.data)}`);
      } else {
        setStatus("❌ Network / CORS error");
      }
    }
  };

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h2>Test Product Image Upload</h2>

      <label>
        Product ID:&nbsp;
        <input
          type="number"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
        />
      </label>

      <br /><br />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br /><br />

      <button onClick={uploadImage}>Upload</button>

      <p style={{ marginTop: "20px", fontWeight: "bold" }}>{status}</p>
    </div>
  );
}
