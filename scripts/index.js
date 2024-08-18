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

// 2024-8-18 Future plan for revamping search menu to look more fully specified:
// - use an ol to contain them instead of an un, and each result is a <li> containing an <article> which has an <h2> and probably divs inside
//   - thats what duck duck go does, google is just div div div div div div
// - make each result a little recipe card, with Name type time cost per serve yield etc, only show if initialised value
// - consider limiting to 5 results with a show all button underneath