const recipeWrapperElement = document.querySelector(".recipe-wrapper")
let config;
let allRecipes;
let recipe;
let configLoaded = false;
let recipesLoaded = false;

//Read in the config, esp. name of the recipe to display (passed from PowerShell)
fetch("../Site/data/config.json", {cache: "no-cache"})
    .then((response) => response.json())
    .then((data) => {   
        config = data;
        configLoaded = true;
        start();
        console.log(data)
    })
    .catch(error => console.error(error));

//Read in the recipe data
fetch("../Recipes.json")
    .then((response) => response.json())
    .then((data) => {
        allRecipes = data;
        recipesLoaded = true;
        start();
    })
    .catch(error => console.error(error));

//Start up function, finds recipe and calls displayRecipe
async function start() {
    console.log("start() called");
    if (!recipesLoaded || !configLoaded) {
        console.log("something not loaded")
        return;
    }
    //filter
    recipesFiltered = allRecipes.filter((currentValue) => {
        const success =
            currentValue.name.toLowerCase().includes(config.selectedName.toLowerCase())
        return success;
    });
    //Extract first element from filtered recipes
    recipe = recipesFiltered[0]
    //Display recipe
    displayRecipe(recipe);
}

// Structure and display recipe on-screen
async function displayRecipe(recipe) {
    //create section
    recipeSection = document.createElement("section");
    recipeSection.setAttribute('class', 'recipe');
    recipeSection.setAttribute('id', recipe.name.toLowerCase().replace(' ', '-'))
    //create title
    recipeTitle = document.createElement("h2");
    recipeTitle.textContent = recipe.name;
    //display image
    // TODO check if it exists before display
    recipeImage = document.createElement("img");
    recipeImage.setAttribute("src", `../Gallery/${recipe.name}.jpg`);
    recipeImage.setAttribute("width", "100");
    //create note
    recipeNote = document.createElement("p");
    recipeNote.innerHTML = `-----<br>${recipe.note}<br>-----`;
    //create ingredients heading
    recipeIngredientsHeading = document.createElement("h3");
    recipeIngredientsHeading.textContent = "Ingredients:"
    //create ingredients list
    recipeIngredientsList = document.createElement("ul");
    for (item of recipe.items) {
        recipeIngredientsListItem = document.createElement("li");
        recipeIngredientsListItem.textContent = `${item.thing} (${item.quantity})`;
        //append because in loop
        recipeIngredientsList.appendChild(recipeIngredientsListItem);
    }
    //create steps heading
    recipeStepsHeading = document.createElement("h3");
    recipeStepsHeading.textContent = "Steps:"
    //create steps list
    recipeStepsList = document.createElement("ol");
    for (step of recipe.steps) {
        recipeStepsListItem = document.createElement("li");
        recipeStepsListItem.textContent = step;
        //append because in loop
        recipeStepsList.appendChild(recipeStepsListItem);
    }
    //append bits
    recipeSection.appendChild(recipeTitle);
    recipeSection.appendChild(recipeImage);
    recipeSection.appendChild(recipeNote);
    recipeSection.appendChild(recipeIngredientsHeading);
    recipeSection.appendChild(recipeIngredientsList);
    recipeSection.appendChild(recipeStepsHeading);
    recipeSection.appendChild(recipeStepsList);
    recipeWrapperElement.appendChild(recipeSection)
}