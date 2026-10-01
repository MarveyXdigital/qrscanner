const imgBox = document.getElementById("imageBox");
const qrImg = document.getElementById("qrImage");
const qrText = document.getElementById("qrText");
const generate = document.getElementById("generate");
const qrFile = document.getElementById("qrFile");
const statusMessage = document.getElementById("statusMessage");

const supabaseUrl = "https://wjvmyvjxkcscgjgobojb.supabase.co";
const supabaseKey = "sb_publishable_5kBv6WsQ38rFt0nb0zEgsA_Bl-BzU4S";

const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

const createQrItem = async () => {
  const text = qrText.value.trim();
  const file = qrFile.files[0];

  if (!text && !file) {
    statusMessage.textContent = "please enter some text or Url";
    return;
  }
  if (!file) {
    statusMessage.textContent = "please selece image to proceed";
    return;
  }

  statusMessage.textContent = "Generating your unique Qr Code...";

  const { data, error } = await supabaseClient
    .from("qr_item")
    .insert({
      title: qrText.value,
      content: text,
      visitor: 0,
    })
    .select()
    .single();
  if (error) {
    statusMessage.textContent = "Could not create your QR record.";
    return;
  }
  // Get database ID
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
  statusMessage.testContent = "QR code generated successully!";
};

generate.addEventListener("click", () => {
  createQrItem();
});
// function generateQr() {
//   const inputValue = qrText.value.trim();
//   if (inputValue.length > 0) {
//     qrImg.src =
//       "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" +
//       encodeURIComponent(inputValue);
//     imgBox.classList.add("show-img");
//   } else {
//     qrText.classList.add("error");
//     setTimeout(() => {
//       qrText.classList.remove("error");
//     }, 1000);
//   }
// }
// generate.addEventListener("click", generateQr);

// qrText.addEventListener("keydown", (event) => {
//   if (event.key === "Enter") {
//     generateQr();
//   }
// });

// var qrcode = new QRCode(document.getElementById("qrcode"), {
//   text: "https://example.com",
//   width: 256,
//   height: 256,
//   colorDark: "#000000",
//   colorLight: "#ffffff",
//   correctLevel: QRCode.CorrectLevel.H,
// });
