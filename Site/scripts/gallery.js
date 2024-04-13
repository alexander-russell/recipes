const galleryElement = document.querySelector(".gallery");

fetch("../Recipes.json")
    .then((response) => response.json())
    .then((data) => {
        allRecipes = data;
        start();
    })
    .catch(error => console.error(error));

function start() {
    populateGallery(allRecipes);
}

function populateGallery(recipes) {
    for (recipe of recipes) {
        // Determine image address
        let imageAddress = null;
        if (recipe.image == "Local") {
            imageAddress = `../Gallery/${recipe.name}.jpg`;
        }
        else if (recipe.image != "") {
            imageAddress = recipe.image;
        }
        // If address found, add to src element
        if (imageAddress != null) {
            // If image found, create image elements
            const imageWrapperWrapper = document.createElement("div");
            galleryElement.appendChild(imageWrapperWrapper);
            const imageWrapper = document.createElement("div");
            imageWrapperWrapper.appendChild(imageWrapper);
            const imageElement = document.createElement("img");
            imageElement.setAttribute("src", imageAddress);
            // imageElement.setAttribute("height", "100px");
            imageWrapper.appendChild(imageElement);
        }
    }
}