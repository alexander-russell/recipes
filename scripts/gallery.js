const galleryElement = document.querySelector(".gallery");
let recipeBook;
let translateInterval;

function startTranslate() {
    if (!translateInterval) {
        translateInterval = setInterval(manageGallery, 10);
    }
}

function stopTranslate() {
    clearInterval(translateInterval);
    translateInterval = null;
}

fetch("../Recipes.json")
    .then((response) => response.json())
    .then((data) => {
        recipeBook = data;
        start();
    })
    .catch(error => console.error(error));

function start() {
    // Load all images into DOM
    loadGallery(recipeBook.Recipes);

    // Add listener to last element
    galleryElement.lastChild.childNodes[0].childNodes[0].addEventListener("load", () => {
        // alert();
        console.log(galleryElement.lastChild);
        initialiseGallery();
        startTranslate();
    });
}

function loadGallery(recipes) {
    console.log("loading");
    for (const recipe of recipes) {
        // Determine image address
        let imageAddress = null;
        if (recipe.Image == "Local") {
            imageAddress = `/Gallery/${recipe.Name}.jpg`;

        }
        else if (recipe.image != "") {
            imageAddress = recipe.image;
        }

        // If image found, create image elements
        if (imageAddress != null) {
            // Create image wrapper
            const imageWrapper = document.createElement("div");
            imageWrapper.setAttribute("leftInt", 0);
            imageWrapper.style.left = `${imageWrapper.getAttribute("leftInt")}px`;
            galleryElement.appendChild(imageWrapper);

            // Create link wrapper
            const imageLinkElement = document.createElement("a");
            imageLinkElement.href = `/recipes/display?recipe=${recipe.Name}`;
            imageWrapper.appendChild(imageLinkElement);

            // Create actual image
            const imageElement = document.createElement("img");
            imageElement.setAttribute("src", imageAddress);
            imageLinkElement.appendChild(imageElement);

            // Handle png
            imageElement.addEventListener("error", () => {
                if (imageElement.src.match(".jpg")) {
                    // Try for .png
                    imageElement.src = imageElement.src.replace(".jpg", ".png");
                } else {
                    // Remove event listener
                    imageElement.addEventListener("error", () => { });
                }
            });
        }
    }

}

function initialiseGallery() {
    console.log("initialising");
    // Set fixed positioning of all images based on loaded width
    let sumWidth = 0;
    for (const item of galleryElement.children) {
        item.setAttribute("leftInt", sumWidth);
        item.style.left = `${item.getAttribute("leftInt")}px`;
        item.style.position = "fixed";
        item.style.height = "60%";
        sumWidth += item.childNodes[0].childNodes[0].width - 1;
    }

    // Handle mouseover (stop animation)
    galleryElement.addEventListener("mouseover", () => {
        stopTranslate();
    });

    galleryElement.addEventListener("mouseout", () => {
        startTranslate();
    });
}

function manageGallery() {
    console.log("managing");
    for (item of galleryElement.children) {
        // Get current left and decrement it
        let leftInt = +item.getAttribute("leftInt");
        leftInt -= 1;
        item.setAttribute("leftInt", leftInt);
        // Get width
        const itemImage = item.children[0].children[0];
        const imageWidth = itemImage.width;

        // Update position
        item.style.left = `${leftInt}px`;

        // Send to back
        if (leftInt + imageWidth <= 0) {
            // Get details about current last item
            const lastItem = galleryElement.lastChild;
            const lastItemImage = lastItem.children[0].children[0];
            const lastItemLeftInt = +lastItem.getAttribute("leftInt");
            const lastItemWidth = lastItemImage.width;

            // Move this to last
            galleryElement.appendChild(item);

            // Update position
            leftInt = lastItemLeftInt + lastItemWidth;
            item.setAttribute("leftInt", leftInt);
            item.style.left = `${leftInt}px`;
        }
    }
}