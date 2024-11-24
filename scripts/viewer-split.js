fetchRecipeBook()
    .then((recipeBook) => {
        filteredRecipes = filterActiveRecipes(recipeBook.Recipes);
        console.log(filteredRecipes);
    })