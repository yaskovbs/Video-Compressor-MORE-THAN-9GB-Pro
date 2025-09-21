import express from "express";
import multer from "multer";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import ffmpeg from "fluent-ffmpeg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure directories exist
const uploadsDir = path.join(__dirname, "../uploads");
const processedDir = path.join(__dirname, "../processed");

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(processedDir))
  fs.mkdirSync(processedDir, { recursive: true });

// Compression jobs storage (in memory for now)
const compressionJobs = new Map();

// Configure multer for large file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueFilename = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueFilename);
  },
});

// Allow large files (increase limits)
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 * 1024, // 10GB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if it's a video file
    const videoTypes = /mp4|avi|mkv|mov|wmv|flv|webm|3gp/;
    const extname = videoTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = file.mimetype.startsWith("video/");

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only video files are allowed!"));
    }
  },
});

// Quality settings mapping
const qualitySettings = {
  high_quality: {
    videoBitrate: "8000k",
    audioBitrate: "128k",
    preset: "slow",
    crf: "18",
  },
  balanced: {
    videoBitrate: "4000k",
    audioBitrate: "96k",
    preset: "medium",
    crf: "23",
  },
  smallest_size: {
    videoBitrate: "1500k",
    audioBitrate: "64k",
    preset: "fast",
    crf: "28",
  },
};

// Upload and compress endpoint
app.post("/compress", upload.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No video file uploaded" });
    }

    const jobId = uuidv4();
    const quality = req.body.quality || "balanced";
    const originalFileName = req.file.originalname;
    const uploadedFilePath = req.file.path;

    // Get original file size
    const stats = fs.statSync(uploadedFilePath);
    const originalSize = stats.size;

    // Initialize job status
    const job = {
      id: jobId,
      status: "processing",
      progress: 0,
      originalFileName,
      originalSize,
      compressedSize: null,
      outputFileName: null,
      error: null,
      createdAt: new Date(),
      completedAt: null,
    };

    compressionJobs.set(jobId, job);

    // Send initial response with job ID
    res.json({
      jobId,
      message: "Compression started",
      status: "processing",
    });

    // Start compression asynchronously
    compressVideo(jobId, uploadedFilePath, quality, originalFileName);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
});

// Get compression status
app.get("/status/:jobId", (req, res) => {
  const jobId = req.params.jobId;
  const job = compressionJobs.get(jobId);

  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  res.json({
    jobId: job.id,
    status: job.status,
    progress: job.progress,
    originalFileName: job.originalFileName,
    originalSize: job.originalSize,
    compressedSize: job.compressedSize,
    outputFileName: job.outputFileName,
    error: job.error,
  });
});

// Download compressed file
app.get("/download/:jobId", (req, res) => {
  const jobId = req.params.jobId;
  const job = compressionJobs.get(jobId);

  if (!job || job.status !== "completed" || !job.outputFileName) {
    return res.status(404).json({ error: "File not available" });
  }

  const filePath = path.join(processedDir, job.outputFileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found on disk" });
  }

  res.download(filePath, `compressed_${job.originalFileName}`);
});

// FFmpeg compression function
function compressVideo(jobId, inputPath, quality, originalFileName) {
  const job = compressionJobs.get(jobId);
  if (!job) return;

  const settings = qualitySettings[quality] || qualitySettings.balanced;
  const outputFileName = `${jobId}_compressed${path.extname(originalFileName)}`;
  const outputPath = path.join(processedDir, outputFileName);

  const command = ffmpeg(inputPath)
    .output(outputPath)
    .videoCodec("libx264")
    .audioCodec("aac")
    .audioBitrate(settings.audioBitrate)
    .videoBitrate(settings.videoBitrate)
    .addOption("-preset", settings.preset)
    .addOption("-crf", settings.crf)
    .addOption("-movflags", "faststart") // Optimize for web streaming
    .on("progress", (progress) => {
      // Update progress
      job.progress = Math.round(progress.percent || 0);
      console.log(`Job ${jobId}: ${job.progress}% complete`);
    })
    .on("end", () => {
      // Compression completed
      try {
        const compressedStats = fs.statSync(outputPath);
        job.status = "completed";
        job.compressedSize = compressedStats.size;
        job.outputFileName = outputFileName;
        job.completedAt = new Date();

        // Clean up uploaded file after 1 hour
        setTimeout(() => {
          if (fs.existsSync(inputPath)) {
            fs.unlinkSync(inputPath);
          }
        }, 60 * 60 * 1000); // 1 hour

        console.log(`Job ${jobId} completed successfully`);
      } catch (error) {
        console.error("Post-compression error:", error);
        job.status = "error";
        job.error = "Failed to get compressed file stats";
      }
    })
    .on("error", (err) => {
      console.error(`Compression failed for job ${jobId}:`, err);
      job.status = "error";
      job.error = err.message;

      // Clean up partial output file
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
    });

  // Start compression
  command.run();
}

// Clean up old completed jobs and files after 24 hours
setInterval(() => {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  for (const [jobId, job] of compressionJobs.entries()) {
    if (
      job.status === "completed" &&
      job.completedAt &&
      job.completedAt < oneDayAgo
    ) {
      // Remove job from memory
      compressionJobs.delete(jobId);

      // Remove compressed file if it exists
      if (job.outputFileName) {
        const filePath = path.join(processedDir, job.outputFileName);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }
  }
}, 60 * 60 * 1000); // Check every hour

app.listen(PORT, () => {
  console.log(`Video compression server running on port ${PORT}`);

  // Check if FFmpeg is available
  ffmpeg.getAvailableFormats((err, formats) => {
    if (err) {
      console.error("FFmpeg not found or not working:", err);
      console.log("Please install FFmpeg to enable video compression");
    } else {
      console.log("FFmpeg is available and ready for compression");
    }
  });
});
