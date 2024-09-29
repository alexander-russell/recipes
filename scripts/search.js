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

        // DEBUG autoload search result for "ban" so i can write the search design faster
        searchInputted = true;
        populateResults("ban");
    }
}

//
function populateResults(query) {
    if (searchInputted) {
        // Get element
        searchResultsList = document.querySelector(".search-results");

        // Get matching results
        let results = recipeBook.Recipes.filter((currentValue) => {
            const active = !currentValue.Retired;
            const nameMatch =
                currentValue.Name.toLowerCase().includes(query.toLowerCase());
            return active && nameMatch;
        });
        console.log(results);

        // Clear existing
        while (searchResultsList.hasChildNodes()) {
            searchResultsList.childNodes[0].remove();
        }

        // Add new results
        for (const result of results) {
            // searchResultsList.appendChild(createSearchResultElement(result));
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

function createSearchResultElement(recipe) {
    // Define recipe link
    const url = `display?recipe=${recipe.Name}`;

    // Determine image link
    const imgUrl = (recipe.Image == "Local") ? `Gallery/${recipe.Name}.avif` : recipe.Image

    // Create list item
    const item = document.createElement("li");
    item.classList.add("search-result");

    // Create link
    const link = document.createElement("a");
    link.classList.add("search-result-link");
    link.href = url;
    item.appendChild(link);

    // Create article element
    const article = document.createElement("article");
    article.classList.add("search-result-article");
    link.appendChild(article);

    // Create image
    const img = document.createElement("img");
    img.setAttribute("src", imgUrl);
    article.appendChild(img);

    // Create body
    const body = document.createElement("div");
    body.classList.add("body");
    article.appendChild(body);

    // Create heading
    const heading = document.createElement("h3");
    heading.classList.add("heading");
    heading.textContent = recipe.Name;
    body.appendChild(heading);

    // Create link
    // const link = document.createElement("a");
    // link.href = `display?recipe=${recipe.Name}`;
    // link.textContent = recipe.Name;
    // item.appendChild(link);

    //Return created element
    return item;
}