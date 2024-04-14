let recipeBook;
let recipesLoaded = false;
let searchInputted = false;

// Get data
fetch("RecipesCost.json")
    .then((response) => response.json())
    .then((data) => {
        recipeBook = data;
        recipesLoaded = true;
        start();
    })
    .catch(error => console.error(error));

function start() {
    if (recipesLoaded) {
        // Add form event listener
        const searchInputElement = document.querySelector("input#name");
        searchInputElement.addEventListener("input", (event) => {
            searchInputted = true;
            populateResults(event.target.value);
        });
    }
}

//
function populateResults(query) {
    if (searchInputted) {
        // Get element
        searchResultsList = document.querySelector(".search-results");
        
        // Get matching results
        let results = recipeBook.Recipes.filter((currentValue) => {
            const success =
            currentValue.Name.toLowerCase().includes(query.toLowerCase())
            return success;
        });
        console.log(results);

        // Clear existing
        while (searchResultsList.hasChildNodes()) {
            searchResultsList.childNodes[0].remove();
        }

        // Add new results
        for (const result of results) {
            // Create list item
            searchResultElement = document.createElement("li");
            searchResultElement.classList.add("search-result");
            searchResultsList.appendChild(searchResultElement);

            // Create link
            searchResultLinkElement = document.createElement("a");
            searchResultLinkElement.href = `display?recipe=${result.Name}`;
            searchResultLinkElement.textContent = result.Name;
            searchResultElement.appendChild(searchResultLinkElement);
        }
    }
}