const imgBox = document.getElementById("imageBox");
const qrImg = document.getElementById("qrImage");
const qrText = document.getElementById("qrText");
const generate = document.getElementById("generate");
const qrFile = document.getElementById("qrFile");
const statusMessage = document.getElementById("statusMessage");

const createQrItem = async () => {
  const text = qrText.value.trim();
  const file = qrFile.files[0];

  if (!text || !file) {
    statusMessage.textContent = "please enter some text or Url";
    return;
  }
  statusMessage.textContent = "Generating your unique Qr Code...";

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
    return;
  }

  const qrId = data.id;

  const fileName = `${Date.now()}-${file.name}`;

  const { data: uploadData, error: uploadError } = await supabaseClient.storage
    .from("qr-image")
    .upload(fileName, file);

  if (uploadError) {
    statusMessage.textContent = "Could not upload the image.";
    return;
  }

  const { data: imageData } = supabaseClient.storage
    .from("qr-image")
    .getPublicUrl(uploadData.path);
  const imageUrl = imageData.publicUrl;

  if (!imageUrl) {
    statusMessage.textContent = "Could not get image Url";
    return;
  }

  const { error: updateError } = await supabaseClient
    .from("qr_item")
    .update({
      image_url: imageUrl,
    })
    .eq("id", qrId);

  if (updateError) {
    statusMessage.textContent = "could not save  the image information.";
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
  statusMessage.textContent = "QR code generated successully!";
};

generate.addEventListener("click", () => {
  createQrItem();
});
