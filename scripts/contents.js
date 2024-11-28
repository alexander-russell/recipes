// Load recipes
fetchRecipeBook()
    .then((recipeBook => start(recipeBook)));

// Start function runs when recipeBook is loaded from file
async function start(recipeBook) {
    const contentsElement = document.querySelector(".contents")

    // Retrieve URL params, obliterate them
    urlParams = new URLSearchParams(document.location.search);
    history.replaceState({}, "", window.location.href.split('?')[0])

    // Filter to active recipes and display
    const activeRecipes = filterActiveRecipes(recipeBook.Recipes);
    displayContents(activeRecipes, contentsElement, urlParams);
}

// Display contents using recipe list
function displayContents(recipes, contentsElement, urlParams) {
    // Display each type of recipe
    const allTypes = recipes.map((recipe) => recipe.Type)
    const types = [...new Set(allTypes)]
    for (const type of types.sort()) {
        // Filter relevant recipes and use them
        const subRecipes = recipes.filter((recipe) => recipe.Type == type)
        displayType(type, subRecipes, contentsElement, urlParams)
    }
}

function displayType(type, recipes, contentsElement, urlParams) {
    // Display type information
    const heading = document.createElement("h2");
    heading.textContent = type;
    contentsElement.appendChild(heading)

    // Display sub-categories
    const allCategories = recipes.map((recipe) => recipe.Category)
    const categories = [...new Set(allCategories)]
    for (const category of categories.sort()) {
        // Filter relevant recipes and use them
        const subRecipes = recipes.filter((recipe) => recipe.Category == category)
        displayCategory(category, subRecipes, contentsElement, urlParams);
    }
}

function displayCategory(category, recipes, contentsElement, urlParams) {
    // Display category information
    const details = document.createElement("details");
    contentsElement.appendChild(details);
    const summary = document.createElement("summary");
    details.appendChild(summary);
    const name = document.createElement("span");
    name.classList.add("name");
    name.textContent = `${category}`;
    summary.appendChild(name);
    const count = document.createElement("span");
    count.classList.add("count");
    count.textContent = recipes.length;
    summary.appendChild(count);

    // Populate category dropdown menu with recipes
    populateCategoryDropdown(recipes, details);

    // Configure category dropdown menu
    configureDropdown(details, category, urlParams);
}

function populateCategoryDropdown(recipes, details) {
    const list = document.createElement("ul");
    details.appendChild(list);
    for (recipe of recipes) {
        const item = document.createElement("li");
        list.appendChild(item);
        const link = document.createElement("a");
        link.textContent = recipe.Name;
        link.href = `/recipes/display/${recipe.Slug}`;
        item.appendChild(link);
    }
}

function configureDropdown(details, category, urlParams) {
    if (urlParams.get("focus") == category) {
        // Open the details pane and mark it for focus styling
        details.setAttribute("open", "");
        details.classList.add("focus");
    }
}

function toggleList() {
    // Determine which control is visible, and therefore what action to perform
    const visibleControl = document.querySelector(".list-control:not(.hidden)")
    expand = visibleControl.querySelector("#expand-icon") != null

    // Switch visible control (either expand or minimise)
    const listControls = document.querySelectorAll(".list-control");
    listControls.forEach(listControl => listControl.classList.toggle("hidden"));

    // Expand or minimise details elements
    const allDetails = document.querySelectorAll("details");
    if (expand) {
        allDetails.forEach(detail => detail.setAttribute("open", ""));
    } else {
        allDetails.forEach(detail => detail.removeAttribute("open"));
    }
}