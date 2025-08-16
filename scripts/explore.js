// Prefill form values from URL parameters
let prefilled = false;
const paramsInitial = new URLSearchParams(document.location.search);
if (paramsInitial != null) {
    // Use params as form field values
    for (element of document.querySelector("#explore-form").elements) {
        if (paramsInitial.get(element.id)) {
            prefilled = true;
            if (element.classList.contains("toggle")) {
                element.checked = true
                // If advanced toggle is on, open it
                if (element.id == "advanced") {
                    toggleAdvanced();
                }
            } else {
                element.value = paramsInitial.get(element.id)
            }
        }
    }
}

// Load recipes
fetchRecipeBook()
    .then((recipeBook => start(recipeBook.Recipes)));

function start(recipesAll) {
    // Select elements
    const form = document.querySelector("#explore-form");
    const list = document.querySelector(".search-results");

    // Filter active recipes
    const recipes = filterActiveRecipes(recipesAll);

    // Populate dynamic form elements
    populateTypeOptions(recipes);
    populateCategoryOptions(recipes);

    // Monitor type select and repopulate category on change
    document.querySelector("#filter-type").addEventListener("change", (event) => {
        populateCategoryOptions(recipes);
    });

    //alert("before prefill submit");
    // If form was prefilled from URL, submit that (URL is already configured so could skip to displayResults, but looks clearer this way)
    if (prefilled) {
        submit(recipes, list);
    }
    //alert("after prefill submit");

    // Prevent form redirecting on submit
    form.addEventListener("submit", (event) => {
        event.preventDefault()
        submit(recipes, list);
    });

    // Enter keypress in form submits form
    form.addEventListener("keydown", (event) => {
        if (event.key == "Enter") {
            submit(recipes, list);
        }
    });
}

function toggleAdvanced() {
    const advancedElements = document.querySelectorAll(".advanced");
    for (const advancedElement of advancedElements) {
        advancedElement.classList.toggle("visible");
    }
}

// toggleAdvanced()

function populateTypeOptions(recipes) {
    // Determine unique types and append them to the type filter dropdown option list
    const typeSelect = document.querySelector("#filter-type");
    const uniqueTypes = recipes.map(recipe => recipe.Type).filter((value, index, array) => array.indexOf(value) === index)
    for (const type of uniqueTypes) {
        const option = document.createElement("option");
        option.textContent = type;
        option.value = type.toLowerCase();
        typeSelect.appendChild(option);
    }
}

function populateCategoryOptions(recipes) {
    // Save old value
    const categorySelect = document.querySelector("#filter-category");
    const oldValue = categorySelect.value;

    // Determine unique categories and append them to the type filter dropdown option list (filter to those available in selected type)
    const type = document.querySelector("#filter-type").value;
    const uniqueCategories = recipes
        .filter(recipe => type == "any" || recipe.Type.toLowerCase() == type)
        .map(recipe => recipe.Category)
        .filter((value, index, array) => array.indexOf(value) === index)

    // Add these options to the select element (don't remove the first element because it is "Any")
    while (categorySelect.childElementCount > 1) { categorySelect.children[1].remove() }
    for (const category of uniqueCategories) {
        const option = document.createElement("option");
        option.textContent = category;
        option.value = category.toLowerCase();
        categorySelect.appendChild(option);
    }

    // If old selection still exists in new set, set value back to old selection
    if (uniqueCategories.map(category => category.toLowerCase()).indexOf(oldValue) != -1) {
        categorySelect.value = oldValue;
    }
}

function submit(recipes, list) {
    pushSearchToUrl();
    displayResults(recipes, list);
}

function pushSearchToUrl() {
    const paramsNew = new URLSearchParams(new FormData(document.querySelector("#explore-form")));
    history.pushState({}, "", window.location.href.split('?')[0] + `?${paramsNew}`);
}

function displayResults(recipes, list) {
    // Read params
    const params = new URLSearchParams(document.location.search);

    // Get matching results and sort them
    const results = recipes
        .filter(filterRecipe.bind(null, params))
        .sort(sortRecipe.bind(null, params));

    console.log(results);

    // Clear existing results
    while (list.hasChildNodes()) {
        list.childNodes[0].remove();
    }

    // Display results
    for (const result of results) {
        list.appendChild(createSearchResultElement(result));
    }
}

function filterRecipe(params, recipe) {
    const type = params.get('filter-type');
    console.log(type);
    return recipe.Name.toLowerCase().includes(params.get("query").toLowerCase()) &&
        // Advanced fields
        ((null == params.get('advanced')) || (
            (params.get('filter-type') == "any" || recipe.Type.toLowerCase() == params.get('filter-type')) &&
            (params.get('filter-category') == "any" || recipe.Category.toLowerCase() == params.get('filter-category'))
        ));
}

function sortRecipe(params, a, b) {
    let comparison = 0;
    switch (params.get("sort-property")) {
        case "name":
            // comparison = a.Name == b.Name ? 0 : a.Name < b.Name ? -1 : 1
            comparison = compare(a.Name, b.Name);
            break;
        case "cost":
            comparison = compare(a.Cost.Amount, b.Cost.Amount);
            break;
        case "cost-per-serve":
            comparison = compare(a.Cost.AmountPerUnit, b.Cost.AmountPerUnit);
            break;
        case "time":
            comparison = compare(a.Time.Minutes, b.Time.Minutes);
            break;
        case "difficulty":
            comparison = compare(a.Difficulty, b.Difficulty);
            break;
        default:
            console.log(`Error: unhandledSortProperty: ${params.get("sort-property")}`)
    }

    return params.get("sort-order") === "ascending" ? comparison : -comparison
}

function compare(a, b) {
    return a == b ? 0 : a < b ? -1 : 1
}

function createSearchResultElement(recipe) {
    // Define recipe link
    const url = `display/${recipe.Slug}`;

    // Determine image link
    const imgUrl = recipe.Images.indexOf("main.avif") == -1 ? "/recipes/images/blank.avif" : `/recipes/images/${recipe.Slug}/main.avif`

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
        img.src = "/recipes/images/blank.avif";
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
    // cost.textContent = recipe.Cost.AmountPerUnit.toLocaleString(undefined, { style: "currency", currency: "AUD", minimumFractionDigits: 2 }) + " per unit";
    cost.textContent = "$" + recipe.Cost.CostString;
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