const video = document.getElementById("camera");
const captureBtn = document.getElementById("capture");

// 🎥 Access camera
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => video.srcObject = stream)
  .catch(err => alert("Camera access denied: " + err.message));

// 📸 Capture and send to server
captureBtn.addEventListener("click", async () => {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0);

  canvas.toBlob(async (blob) => {
    const formData = new FormData();
    formData.append("photo", blob, "photo.jpg");

    const res = await fetch("/upload", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    alert("Uploaded ✅\n" + data.url);
    console.log("📸 Uploaded:", data.url);
  }, "image/jpeg");
});