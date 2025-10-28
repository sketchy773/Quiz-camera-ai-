const video = document.getElementById("video");
const captureBtn = document.getElementById("captureBtn");

// Ask permission and start camera
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch(err => {
    alert("Camera access denied!");
    console.error(err);
  });

captureBtn.addEventListener("click", async () => {
  // Create canvas and capture frame
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0);

  // Convert to Blob (image file)
  canvas.toBlob(async (blob) => {
    const formData = new FormData();
    formData.append("photo", blob, "capture.jpg");

    try {
      const res = await fetch("/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      alert("✅ Photo sent successfully!");
      console.log("Response:", data);
    } catch (error) {
      console.error("❌ Upload failed:", error);
      alert("Upload failed!");
    }
  }, "image/jpeg");
});