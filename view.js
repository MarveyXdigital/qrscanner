const viewTitle = document.getElementById("viewTitle");
const viewImage = document.getElementById("viewImage");
const viewContent = document.getElementById("viewContent");
const visitorCount = document.getElementById("visitorCount");

// Get the QR ID from the URL
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

  // Display the information
  viewTitle.textContent = data.title;

  viewContent.textContent = data.content;

  viewImage.src = data.image_url;

  visitorCount.textContent = data.visitor;

  // Increase visitor count
  const { error: visitorError } = await supabaseClient.rpc(
    "increment_qr_visitors",
    {
      qr_id: id,
    },
  );

  if (visitorError) {
    console.log(visitorError);
    return;
  }

  // Update the number shown on the page
  visitorCount.textContent = Number(data.visitor) + 1;
};

loadQrItem();
