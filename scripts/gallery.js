const galleryElement = document.querySelector(".gallery");
const galleryItemQueue = [];
const imageMinAspectRatio = 4 / 3;
let loadsNeededBeforeTranslate = 0;
let galleryItemLoadCount = 0;
const galleryItemLoadCountMax = 5;
let recipeBook;
let translateInterval;

function startTranslate() {
    if (!translateInterval) {
        translateInterval = setInterval(manageGallery, 5);
    }
}

function stopTranslate() {
    clearInterval(translateInterval);
    translateInterval = null;
}

fetch("RecipesCost.json")
    .then((response) => response.json())
    .then((data) => {
        recipeBook = data;
        start();
    })
    .catch(error => console.error(error));

function start() {
    loadGallery(recipeBook.Recipes);
}

function loadGallery(recipes) {
    // Calculate approximate minimum images needed to fill screen, assuming minimum aspect ratio, and using gallery height as image height
    const minImageCount = Math.ceil(window.innerWidth / (galleryElement.offsetHeight / imageMinAspectRatio));

    // Update first screen image load count
    loadsNeededBeforeTranslate = minImageCount;

    // Get recipes containing images
    recipes = recipes.filter((recipe) => {
        return recipe.Image !== ""
    })

    // Randomise order of images (do a dodgy 'random' shuffle for code simplicity)
    shuffleFisherYates(recipes);

    // Load, or queue the load of, each gallery item
    for (let i = 0; i < recipes.length; i++) {
        // Make the structure for the image
        const imageElement = createGalleryItem(recipes[i].Slug);

        // Load the first minImageCount right away, queue the rest
        if (i < minImageCount) {
            loadGalleryImage(imageElement, recipes[i]);
        } else {
            queueGalleryImage(imageElement, recipes[i]);
        }
    }
}

function createGalleryItem(recipeSlug) {
    // Create image wrapper
    const imageWrapper = document.createElement("div");
    galleryElement.appendChild(imageWrapper);

    // Create link wrapper
    const imageLinkElement = document.createElement("a");
    imageLinkElement.href = `/recipes/display/${recipeSlug}`;
    imageWrapper.appendChild(imageLinkElement);

    // Create actual image
    const imageElement = document.createElement("img");
    imageLinkElement.appendChild(imageElement);

    // Send back imageElement for later use
    return imageElement
}

function queueGalleryImage(imageElement, recipe) {
    // Put this imageElement and recipe onto the queue
    galleryItemQueue.push({
        imageElement: imageElement,
        recipe: recipe
    });
}

function loadGalleryImage(imageElement, recipe) {
    // Increment load counter
    galleryItemLoadCount++;

    // Load image source
    imageElement.setAttribute("src", `/recipes/images/${recipe.Slug}/main.avif`);

    // Configure a few different actions when the image loads
    imageElement.addEventListener("load", () => {
        // Decrement load counter
        galleryItemLoadCount--;

        // Decrement loads before translate can start counter
        loadsNeededBeforeTranslate--;

        // Check whether ready to start translate
        if (loadsNeededBeforeTranslate == 0) {
            initialiseGallery();
            startTranslate();
        }

        // Service load queue
        serviceLoadQueue();
    })

    // Configure a few different actions if the image fails to load
    imageElement.addEventListener("error", () => {
        // Decrement load counter
        galleryItemLoadCount--;

        // Delete this <img>'s grandparent <div> 
        imageElement.parentElement.parentElement.remove()

        // Service load queue
        serviceLoadQueue()
    });
}

function serviceLoadQueue() {
    // If still items in queue, and not already loading too many images concurrently, load one
    if (galleryItemQueue.length > 0) {
        if (galleryItemLoadCount < galleryItemLoadCountMax) {
            galleryItem = galleryItemQueue.shift();
            loadGalleryImage(galleryItem.imageElement, galleryItem.recipe);
        }
    }
}

function initialiseGallery() {
    // Set property to store left value for gallery position
    galleryElement.setAttribute("leftInt", 0);

    // Handle mouseover (stop animation)
    galleryElement.addEventListener("mouseover", () => {
        stopTranslate();
    });

    // Handle mouseout (start animation)
    galleryElement.addEventListener("mouseout", () => {
        startTranslate();
    });
}

function manageGallery() {
    // Calculate new gallery position
    let galleryPosition = +galleryElement.getAttribute("leftInt");
    galleryPosition -= 1;

    // If image will have moved to left of screen, move to end of row and reset gallery position to 0
    if (galleryPosition + galleryElement.children[0].offsetWidth < 0) {
        galleryElement.appendChild(galleryElement.children[0]);
        galleryPosition = 0;
    }

    // Update gallery position
    galleryElement.setAttribute("leftInt", galleryPosition);
    galleryElement.style.left = `${galleryPosition}px`;
}

function shuffleFisherYates(array) {
    // Iterate until no elements left unshuffled
    var remaining = array.length;
    while (remaining > 0) {
        // Randomly pick one of the remaining elements
        let selection = Math.floor(Math.random() * remaining);
        remaining--;

        // Swap the selected element with the last elemented in the unshuffled part of the array
        let lastUnshuffledItem = array[remaining];
        array[remaining] = array[selection];
        array[selection] = lastUnshuffledItem;
    }
}