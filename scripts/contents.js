const contents = document.querySelector(".contents")

// Start function runs when recipeBook is loaded from file
async function start(recipeBook) {
    // console.log(recipeBook.Recipes.length)
    displayContents(recipeBook.Recipes);
}

// Display contents using recipe list
function displayContents(recipes) {
    // Display each type of recipe
    const allTypes = recipes.map((recipe) => recipe.Type)
    const types = [...new Set(allTypes)]
    for (const type of types.sort()) {
        // Filter relevant recipes and use them
        const subRecipes = recipes.filter((recipe) => recipe.Type == type)
        displayType(type, subRecipes)
    }
}

function displayType(type, recipes) {
    // Display type information
    const heading = document.createElement("h2");
    heading.textContent = type;
    contents.appendChild(heading)

    // Display sub-categories
    const allCategories = recipes.map((recipe) => recipe.Category)
    const categories = [...new Set(allCategories)]
    for (const category of categories.sort()) {
        // Filter relevant recipes and use them
        const subRecipes = recipes.filter((recipe) => recipe.Category == category)
        displayCategory(category, subRecipes);
    }
}

function displayCategory(category, recipes) {
    // Display category information
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    const name = document.createElement("span");
    name.classList.add("name");
    name.textContent = `${category}`;
    summary.appendChild(name);
    const count = document.createElement("span");
    count.classList.add("count");
    count.textContent = recipes.length;
    summary.appendChild(count);
    details.appendChild(summary);
    contents.appendChild(details);

    // Configure category dropdown menu

    // Populate category dropdown menu with recipes
    populateCategoryDropdown(recipes, details);
}

function populateCategoryDropdown(recipes, details) {
    const list = document.createElement("ul");
    details.appendChild(list);
    for (recipe of recipes) {    
        const item = document.createElement("li");
        list.appendChild(item);
        const link = document.createElement("a");
        link.textContent = recipe.Name;
        link.href = `../display?recipe=${recipe.Name}`;
        item.appendChild(link);
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