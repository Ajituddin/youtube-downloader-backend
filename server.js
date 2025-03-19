const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");

const app = express();
app.use(cors());

const ytDlpPath = "yt-dlp.exe"; // Ensure yt-dlp.exe is in the same directory

// Update yt-dlp automatically
function updateYtDlp() {
    spawn(ytDlpPath, ["-U"]);
    console.log("yt-dlp is being updated...");
}
updateYtDlp();

app.get("/download", (req, res) => {
    const videoURL = req.query.url;
    if (!videoURL) {
        return res.status(400).json({ error: "YouTube URL is required!" });
    }

    res.setHeader("Content-Disposition", 'attachment; filename="video.mp4"');
    res.setHeader("Content-Type", "video/mp4");

    // Stream the best MP4 video directly without saving (Faster)
    const ytProcess = spawn(ytDlpPath, ["-f", "best[ext=mp4]", "-o", "-", videoURL]);

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

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
