const imgBox = document.getElementById("imageBox");
const qrImg = document.getElementById("qrImage");
const qrText = document.getElementById("qrText");
const generate = document.getElementById("generate");
const qrFile = document.getElementById("qrFile");
const statusMessage = document.getElementById("statusMessage");
const buttonText = document.getElementById("buttonText");
const loader = document.getElementById("loader");
const fileUpload = document.getElementById("fileUpload");
const filePreview = document.getElementById("filePreview");
const uploadText = document.getElementById("uploadText");

let pastedImageUrl = "";

// SELECTING IMAGE FROM COMPUTER
qrFile.addEventListener("change", () => {
  const file = qrFile.files[0];

  if (!file) {
    return;
  }

  // tHIS IS TO Clear previously pasted URL
  pastedImageUrl = "";

  const reader = new FileReader();

  reader.onload = (event) => {
    filePreview.src = event.target.result;
    fileUpload.classList.add("has-image");
  };

  reader.readAsDataURL(file);
});

document.addEventListener("paste", (event) => {
  const pastedText = event.clipboardData.getData("text").trim();

  if (!pastedText) {
    return;
  }

  if (!pastedText.startsWith("http://") && !pastedText.startsWith("https://")) {
    return;
  }

  pastedImageUrl = pastedText;

  qrFile.value = "";

  filePreview.src = pastedText;
  fileUpload.classList.add("has-image");
});

const setLoading = (loading) => {
  generate.disabled = loading;
  generate.classList.toggle("loading", loading);

  if (loading) {
    buttonText.textContent = "Generating...";
    loader.style.display = "inline-block";
  } else {
    buttonText.textContent = "Generate";
    loader.style.display = "none";
  }
};
const createQrItem = async () => {
  const text = qrText.value.trim();
  const file = qrFile.files[0];

  if (!text || (!file && !pastedImageUrl)) {
    statusMessage.textContent =
      "Please enter text and select or paste an image.";

    statusMessage.classList.add("error");
    return;
  }

  setLoading(true);

  statusMessage.textContent = "Generating your unique QR Code...";
  statusMessage.classList.remove("error");
  statusMessage.classList.remove("successful");

  const { data, error } = await supabaseClient
    .from("qr_item")
    .insert({
      title: "Qr code",
      content: text,
      visitor: 0,
    })
    .select()
    .single();

  if (error) {
    statusMessage.textContent = "Could not create your QR record.";
    statusMessage.classList.add("error");

    setLoading(false);
    return;
  }

  const qrId = data.id;

  let finalImageUrl;

  if (file) {
    const fileName = `${Date.now()}-${file.name}`;

    const { data: uploadData, error: uploadError } =
      await supabaseClient.storage.from("qr-image").upload(fileName, file);

    if (uploadError) {
      statusMessage.textContent = "Could not upload the image.";
      statusMessage.classList.add("error");

      setLoading(false);
      return;
    }

    const { data: imageData } = supabaseClient.storage
      .from("qr-image")
      .getPublicUrl(uploadData.path);

    finalImageUrl = imageData.publicUrl;
  } else {
    finalImageUrl = pastedImageUrl;
  }

  if (!finalImageUrl) {
    statusMessage.textContent = "Could not get image URL.";
    statusMessage.classList.add("error");

    setLoading(false);
    return;
  }

  const { error: updateError } = await supabaseClient
    .from("qr_item")
    .update({
      image_url: finalImageUrl,
    })
    .eq("id", qrId);

  if (updateError) {
    statusMessage.textContent = "Could not save the image information.";

    statusMessage.classList.add("error");

    setLoading(false);
    return;
  }

  const qrUrl = `${window.location.origin}/view.html?id=${qrId}`;

  imgBox.innerHTML = "";

  new QRCode(imgBox, {
    text: qrUrl,
    width: 256,
    height: 256,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H,
  });

  statusMessage.textContent = "QR code generated successfully!";

  statusMessage.classList.add("successful");

  setLoading(false);
};

generate.addEventListener("click", () => {
  createQrItem();
});
