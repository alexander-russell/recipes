//Read in the recipe data
fetch("RecipesCost.json")
    .then((response) => response.json())
    .then((data) => {
        // recipeBook = data;
        recipeBookInitial = data;
        start(data);
    })
    .catch(error => console.error(error));

async function start(recipeBook) {
    console.log("start() not overwritten");
}