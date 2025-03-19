const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;

app.get("/download", (req, res) => {
    const videoURL = req.query.url;
    if (!videoURL) {
        return res.status(400).json({ error: "YouTube URL is required!" });
    }

    res.setHeader("Content-Disposition", 'attachment; filename="video.mp4"');
    res.setHeader("Content-Type", "video/mp4");

    // Run yt-dlp using npx (no installation needed)
    const ytProcess = spawn("npx", ["yt-dlp", "-f", "best[ext=mp4]", "-o", "-", videoURL]);

    ytProcess.stdout.pipe(res);

    ytProcess.stderr.on("data", (data) => {
        console.error(`yt-dlp error: ${data}`);
    });

    ytProcess.on("close", (code) => {
        if (code !== 0) {
            res.status(500).json({ error: "Failed to process the video." });
        }
    });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
