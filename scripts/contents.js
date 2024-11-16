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
    console.log(`TYPE: ${type.toUpperCase()}`);

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
    console.log(` CATEGORY: ${category}`);

    // Configure category dropdown menu

    // Populate category dropdown menu with recipes
    populateCategoryDropdown(recipes);
}

function populateCategoryDropdown(recipes) {
    for (recipe of recipes) {    
        console.log(`  ${recipe.Name}`)
    }
}