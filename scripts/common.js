//Read in the recipe data
async function fetchRecipeBook() {
    return fetch("/recipes/RecipesCost.json")
        .then((response) => response.json())
        .catch(error => console.error(error));
}

// Filter recipe array, remove retired recipes
function filterActiveRecipes(recipes) {
    return recipes.filter(recipe => !recipe.Retired);
}

// Create icon from SVG path
function createIcon(name, description, viewbox, path) {
    const size = 27;
    // Create list item
    const iconWrapperElement = document.createElement("li");
    iconWrapperElement.classList.add("icon-wrapper");
    // // Create and configure svg element
    iconWrapperElement.innerHTML = `
        <svg height="${size}" xmlns="http://www.w3.org/2000/svg" width=${size} viewBox="${viewbox}" aria-labelledby=${name} class="icon" role="img">
            <title id=${name}>${description}</title>
            <path d="${path}"></path>
        </svg>`;
    // Return completed object
    return iconWrapperElement;
}

function createIconExpand() {
    return createIcon("expand-icon", "Expand all categories", "M344 0L488 0c13.3 0 24 10.7 24 24l0 144c0 9.7-5.8 18.5-14.8 22.2s-19.3 1.7-26.2-5.2l-39-39-87 87c-9.4 9.4-24.6 9.4-33.9 0l-32-32c-9.4-9.4-9.4-24.6 0-33.9l87-87L327 41c-6.9-6.9-8.9-17.2-5.2-26.2S334.3 0 344 0zM168 512L24 512c-13.3 0-24-10.7-24-24L0 344c0-9.7 5.8-18.5 14.8-22.2s19.3-1.7 26.2 5.2l39 39 87-87c9.4-9.4 24.6-9.4 33.9 0l32 32c9.4 9.4 9.4 24.6 0 33.9l-87 87 39 39c6.9 6.9 8.9 17.2 5.2 26.2s-12.5 14.8-22.2 14.8z");
}

function formatTime(seconds) {
    const SECONDS_PER_HOUR = 3600
    if (seconds >= SECONDS_PER_HOUR) {
        startIdx = 12
    } else {
        startIdx = 14
    }
    return new Date(seconds * 1000).toISOString().slice(startIdx, 19);
}

function getEpochSeconds() {
    return Math.floor(new Date().getTime() / 1000);
}

function round(number, decimalPlaces) {
    return +number.toFixed(decimalPlaces);
}
