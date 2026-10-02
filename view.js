const viewTitle = document.getElementById("viewTitle");
const viewImage = document.getElementById("viewImage");
const viewContent = document.getElementById("viewContent");

// Get the ID from the QR URL

const params = new URLSearchParams(window.location.search);

const id = params.get("id");

// Load the QR information

const loadQrItem = async () => {
  if (!id) {
    viewContent.textContent = "QR code information was not found.";
    return;
  }

  const { data, error } = await supabaseClient
    .from("qr_item")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.log(error);

    viewContent.textContent = "Could not load this QR code.";

    return;
  }

  console.log("QR data:", data);

  // Display title

  viewTitle.textContent = data.title;

  // Display text

  viewContent.textContent = data.content;

  // Display image

  if (data.image_url) {
    viewImage.src = data.image_url;
  } else {
    viewImage.style.display = "none";
  }
};

loadQrItem();
