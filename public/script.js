const video = document.getElementById("camera");
const playBtn = document.getElementById("playBtn");
const playAgainBtn = document.getElementById("playAgainBtn");
const downloadBtn = document.getElementById("downloadBtn");
const previewImg = document.getElementById("previewImg");
const messageBox = document.getElementById("message");
const fileLinkArea = document.getElementById("fileLinkArea");
const cameraBadge = document.getElementById("cameraBadge");
const camStatus = document.getElementById("camStatus");

let lastFileUrl = null;
let streamRef = null;

// Start camera (transparent, but visible badge)
async function startCamera(){
  try{
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
    streamRef = stream;
    video.srcObject = stream;
    cameraBadge.textContent = "● Camera active";
    cameraBadge.style.opacity = 1;
    camStatus.textContent = "Camera is active";
  }catch(err){
    cameraBadge.textContent = "● Camera blocked";
    camStatus.textContent = "Camera access denied";
    console.error("Camera error:", err);
    alert("Camera access is required for this feature.");
  }
}

// Capture frame, upload, and show result on page (no alert)
async function captureAndUpload(){
  if(!streamRef){
    await startCamera();
    if(!streamRef) return;
  }

  // Create canvas and draw
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  canvas.getContext("2d").drawImage(video, 0, 0);

  // Show immediate preview locally
  const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
  previewImg.src = dataUrl;
  previewImg.style.display = "block";
  messageBox.style.display = "none";
  fileLinkArea.innerHTML = "";

  // Convert to blob to upload
  canvas.toBlob(async (blob) => {
    const formData = new FormData();
    formData.append("photo", blob, "photo.jpg");

    try {
      const res = await fetch("/upload", { method: "POST", body: formData });
      if(!res.ok) throw new Error("Upload failed: " + res.status);
      const data = await res.json();

      // Show success message on page
      messageBox.style.display = "flex";
      messageBox.textContent = "🎉 Successfully — You win!";
      // Show link in readable form
      if (data.url) {
        lastFileUrl = data.url;
        fileLinkArea.innerHTML = `<div style="margin-top:8px"><a href="${data.url}" target="_blank" rel="noopener">${data.url}</a></div>`;
        downloadBtn.style.display = "inline-block";
      } else if(data.filePath){
        const url = `${location.protocol}//${location.host}${data.filePath}`;
        lastFileUrl = url;
        fileLinkArea.innerHTML = `<div style="margin-top:8px"><a href="${url}" target="_blank" rel="noopener">${url}</a></div>`;
        downloadBtn.style.display = "inline-block";
      }

      console.log("Uploaded ->", data);
    } catch (err) {
      console.error("Upload error:", err);
      messageBox.style.display = "flex";
      messageBox.textContent = "❌ Upload failed, try again.";
    }
  }, "image/jpeg");
}

// Button events
playBtn.addEventListener("click", captureAndUpload);
playAgainBtn.addEventListener("click", captureAndUpload);
downloadBtn.addEventListener("click", () => {
  if(lastFileUrl) window.open(lastFileUrl, "_blank");
});

// Start camera immediately (optional)
startCamera();