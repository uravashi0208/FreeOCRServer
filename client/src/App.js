// client/src/App.js
import React, { useState } from 'react';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [text, setText] = useState('');
  const [pages, setPages] = useState(null);
  const SERVER = process.env.REACT_APP_SERVER || 'http://localhost:4000';

  const onFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setText('');
    setPages(null);
  };

  const uploadAndExtract = async () => {
    if (!file) return;
    setExtracting(true);
    const form = new FormData();
    form.append('image', file);

    try {
      const resp = await fetch(`${SERVER}/api/ocr`, { method: 'POST', body: form });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'OCR failed');
      setText(data.text || '');
      setPages(data.pages || null);
    } catch (err) {
      console.error(err);
      alert('OCR failed: ' + err.message);
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div className="app-container">
      <div className="card">
        <h1>High-Accuracy OCR</h1>

        <label className="upload" htmlFor="file-input">
          {preview ? (
            <img src={preview} alt="preview" className="preview-img" />
          ) : (
            <div className="upload-placeholder">Click to select image (receipt, card, sign)</div>
          )}
        </label>
        <input id="file-input" type="file" accept="image/*" onChange={onFileChange} style={{ display: 'none' }} />

        <div className="controls">
          <button onClick={uploadAndExtract} disabled={!file || extracting}>
            {extracting ? 'Processing...' : 'Upload & Extract'}
          </button>
        </div>

        <div className="result">
          <h3>Extracted Text</h3>
          <pre className="text-output">{text || 'No text yet'}</pre>
        </div>
      </div>
    </div>
  );
}

export default App;
