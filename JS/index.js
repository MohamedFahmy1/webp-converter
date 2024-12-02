const imageInput = document.getElementById("imageInput");
const convertButton = document.getElementById("convertButton");
const previewContainer = document.getElementById("previewContainer");
const downloadLink = document.getElementById("downloadLink");
const message = document.querySelector(".message");

let imageFiles = [];

imageInput.addEventListener("change", (event) => {
  imageFiles = event.target.files;
  if (imageFiles.length > 0) {
    convertButton.disabled = false;
    previewContainer.innerHTML = ""; // Clear previous previews
    Array.from(imageFiles).forEach((file) => {
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      img.style.maxWidth = "100px";
      img.style.margin = "5px";
      previewContainer.appendChild(img);
    });
  } else {
    convertButton.disabled = true;
  }
});

convertButton.addEventListener("click", () => {
  // Disable the button and show a loading message
  convertButton.disabled = true;
  convertButton.innerHTML = "Converting...";
  const zip = new JSZip();
  let processedCount = 0;

  Array.from(imageFiles).forEach((file) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Convert to WebP with adjusted quality
        const webpDataUrl = canvas.toDataURL("image/webp", 0.8); // 0.8 is the quality (80%)

        const webpBlob = dataURLToBlob(webpDataUrl);

        // Add WebP file to the ZIP
        zip.file(`${file.name.split(".")[0]}.webp`, webpBlob);

        processedCount++;

        // If all files are processed, create the ZIP
        if (processedCount === imageFiles.length) {
          zip.generateAsync({ type: "blob" }).then(function (content) {
            const zipFileUrl = URL.createObjectURL(content);
            downloadLink.href = zipFileUrl;
            downloadLink.style.display = "block";
            convertButton.innerHTML = "Convert More Images";
            convertButton.disabled = false; // Re-enable the button
            convertButton.onclick = () => {
              window.location.reload();
            };
            message.textContent = `${processedCount} images converted. Download your ZIP!`;
          });
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
});

// Helper function to convert DataURL to Blob
function dataURLToBlob(dataUrl) {
  const [header, base64Data] = dataUrl.split(",");
  const binary = atob(base64Data);
  const arrayBuffer = new ArrayBuffer(binary.length);
  const uint8Array = new Uint8Array(arrayBuffer);
  for (let i = 0; i < binary.length; i++) {
    uint8Array[i] = binary.charCodeAt(i);
  }
  return new Blob([uint8Array], { type: "image/webp" });
}
