require("dotenv").config();
const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const cors = require("cors");
const { createWorker } = require("tesseract.js");

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// Preprocessing for best accuracy
async function preprocessImage(buffer) {
  return sharp(buffer)
    .grayscale()
    .normalize()
    .sharpen()
    .resize({ width: 1600, withoutEnlargement: true })
    .toBuffer();
}

app.post("/api/ocr", upload.single("image"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "No image uploaded" });

    const processed = await preprocessImage(req.file.buffer);

    // Create worker (already pre-loaded in v5)
    const worker = await createWorker("eng"); // >>> NEW API <<<

    // Directly recognize text — no load/init needed
    const result = await worker.recognize(processed);

    await worker.terminate();

    res.json({ text: result.data.text });

  } catch (err) {
    console.error("OCR ERROR:", err);
    res.status(500).json({ error: "OCR failed", detail: err.message });
  }
});

app.listen(4000, () => {
  console.log("FREE OCR server running at http://localhost:4000");
});
