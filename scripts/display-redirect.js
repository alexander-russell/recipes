// Load recipes
fetchRecipeBook()
    .then(recipeBook => start(recipeBook.Recipes))

function start(recipes) {
    // Get URL parameters
    params = new URLSearchParams(document.location.search);

    // If there isn't a recipe param specified, return home
    if (!params.get("recipe")) {
        window.location = "/recipes"
    } else {
        // Determine which recipe this URL refers to
        selection = recipes.filter(recipe => recipe.Name == params.get("recipe"))
    
        // Redirect to new slug or fail to 404
        if (selection.length == 1) {
            window.location = `/recipes/display/${selection[0].Slug}`
        } else {
            window.location = "/404"
        }
    }
}