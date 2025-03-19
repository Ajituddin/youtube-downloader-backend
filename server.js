const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;

// Function to install yt-dlp if it's missing
function installYtDlp() {
    console.log("Installing yt-dlp using apt-get...");
    
    const installProcess = spawn("bash", ["-c", "apt-get update && apt-get install -y yt-dlp"]);

    installProcess.stdout.on("data", (data) => {
        console.log(`yt-dlp install: ${data}`);
    });

    installProcess.stderr.on("data", (data) => {
        console.error(`yt-dlp error: ${data}`);
    });

    installProcess.on("close", (code) => {
        if (code === 0) {
            console.log("yt-dlp installed successfully.");
        } else {
            console.error("yt-dlp installation failed.");
        }
    });
}

installYtDlp(); // Install yt-dlp when the server starts

app.get("/download", (req, res) => {
    const videoURL = req.query.url;
    if (!videoURL) {
        return res.status(400).json({ error: "YouTube URL is required!" });
    }

    res.setHeader("Content-Disposition", 'attachment; filename="video.mp4"');
    res.setHeader("Content-Type", "video/mp4");

    // Run yt-dlp from the system package
    const ytProcess = spawn("yt-dlp", ["-f", "best[ext=mp4]", "-o", "-", videoURL]);

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
