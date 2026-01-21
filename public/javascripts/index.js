async function previewUrl(){
    try {
        let url = document.getElementById("urlInput").value;
        const preview = await fetch(`/api/v1/urls/preview?url=${encodeURIComponent(url)}`);
        const previewHTML = await preview.text();

        if(!preview.ok){
            throw new Error ("failed to retrieve preview, please try again");
        } 

        displayPreviews(previewHTML);

    } catch (error) {
        console.error("fetch unsuccessful", error);
        displayPreviews(error);
    }
}

function displayPreviews(previewHTML){
    document.getElementById("url_previews").innerHTML = previewHTML;
}
