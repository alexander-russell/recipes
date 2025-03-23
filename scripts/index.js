// Load recipes
fetchRecipeBook()
    .then((recipeBook => start(recipeBook.Recipes)));

function start(recipes) {
    // Filter active recipes
    const activeRecipes = filterActiveRecipes(recipes);

    // Add form event listener to display quick results on input change
    const input = document.querySelector("input#name");
    input.addEventListener("input", () => {
        populateQuickResults(input.value, activeRecipes);
    });

    // Add form event listeners to focus first result on return or button click
    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            document.querySelector(".search-results a").focus()
        }
    });
    const button = document.querySelector("button.search");
    button.addEventListener("click", (event) => {
        event.preventDefault();
        document.querySelector(".search-results a").focus()
    });
}

function populateQuickResults(query, recipes) {
    // Get element
    searchResultsList = document.querySelector(".search-results");

    // Get matching results
    const results = recipes.filter((currentValue) => {
        const active = !currentValue.Retired;
        const nameMatch =
            currentValue.Name.toLowerCase().includes(query.toLowerCase());
        return active && nameMatch;
    });

    // Clear existing results
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
        searchResultLinkElement.href = `display/${result.Slug}`;
        searchResultLinkElement.textContent = result.Name;
        searchResultElement.appendChild(searchResultLinkElement);
    }
}

function invokeSearch(query) {
    window.location.href = `/recipes/search?query=${query}`;
}