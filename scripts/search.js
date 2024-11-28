// Load recipes
fetchRecipeBook()
    .then((recipeBook => start(recipeBook.Recipes)));

function start(recipes) {
    // Filter active recipes
    const activeRecipes = filterActiveRecipes(recipes);

    // Add form event listener to display quick results on input change
    const input = document.querySelector("input#name");
    input.addEventListener("input", () => {
        populateResults(input.value, activeRecipes);
    });

    // Add form event listeners to go to full results on return or button press
    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            populateResults(input.value, activeRecipes);
        }
    });
    const button = document.querySelector(".search-button");
    button.addEventListener("click", () => {
        populateResults(input.value, activeRecipes);
    });

    // DEBUG autoload search result for "ban" so i can write the search design faster
    // populateResults("ban", activeRecipes);
}

function populateResults(query, recipes) {
    // Get results element
    const list = document.querySelector(".search-results");

    // Get matching results
    const results = recipes.filter((currentValue) => {
        const active = !currentValue.Retired;
        const nameMatch =
            currentValue.Name.toLowerCase().includes(query.toLowerCase());
        return active && nameMatch;
    });

    // Clear existing results
    while (list.hasChildNodes()) {
        list.childNodes[0].remove();
    }

    // Display results
    for (const result of results) {
        list.appendChild(createSearchResultElement(result));
    }

    console.log(results);
}

function createSearchResultElement(recipe) {
    // Define recipe link
    const url = `display/${recipe.Slug}`;

    // Determine image link
    const imgUrl = recipe.Image == "" ? "/recipes/Gallery/blank.avif" : (recipe.Image == "Local" ? `Gallery/${recipe.Name}.avif` : recipe.Image)

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

    // Add error image
    img.addEventListener("error", () => {
        img.src = "/recipes/Gallery/blank.avif";
    })

    // Create body
    const body = document.createElement("div");
    body.classList.add("body");
    article.appendChild(body);

    // Create heading
    const heading = document.createElement("h3");
    heading.classList.add("heading");
    heading.textContent = recipe.Name;
    body.appendChild(heading);

    // Create attributes list
    const attributes = document.createElement("ul");
    attributes.classList.add("attributes");
    body.appendChild(attributes);

    // Add time
    if (recipe.Time.Minutes != 0) {
        const time = document.createElement("li");
        time.textContent = recipe.Time.Minutes + " min";
        attributes.appendChild(time);
    }

    // Add yield
    if (recipe.Yield.Quantity != 0) {
        const yield = document.createElement("li");
        yield.textContent = `${recipe.Yield.Quantity} ${recipe.Yield.Unit}`;
        attributes.appendChild(yield);
    }

    // Add cost
    const cost = document.createElement("li");
    cost.textContent = recipe.Cost.AmountPerUnit.toLocaleString(undefined, { style: "currency", currency: "AUD", minimumFractionDigits: 2 }) + " per unit";
    attributes.appendChild(cost);

    // Add difficulty
    if (recipe.Difficulty != 0 && (recipe.Difficulty < 3 || recipe.Difficulty > 7)) {
        const difficulty = document.createElement("li");
        difficulty.textContent = recipe.Difficulty < 3 ? "easy" : "hard";
        attributes.appendChild(difficulty);
    }



    //Return created element
    return item;
}