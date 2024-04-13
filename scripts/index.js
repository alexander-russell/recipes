let allRecipes;
let searchNameField = document.getElementById('name');
let searchTypeField = document.getElementById('type');
let searchCategoryField = document.getElementById('category');

//for data fetching
// async function populate() {
//     // const requestURL = "https://raw.githubusercontent.com/alexander-russell37/hosting/main/Recipes.json";
//     const requestURL = "../data/Recipes.json"
//     const request = new Request(requestURL);
//     const response = await fetch(request);
//     allRecipes = await response.json();
//     populateRecipes(allRecipes, '', '', '');
// }

fetch("../Site/data/Selection.txt")
    .then((response) => response.text())
    .then((data) => {
        SelectionName = data
        console.log(data)
    })

fetch("../Recipes.json")
    .then((response) => response.json())
    .then((data) => {
        populateRecipes(data, '', '', '');
        allRecipes = data;
        // start();
    })
    .catch(err => console.error(err));


function start() {
    for (let i = 0; i < allRecipes.length; i++) {
        console.log(allRecipes[i].name);
        myImg = document.createElement("img")
        myImg.setAttribute("src", `../Gallery/${allRecipes[i].name}.jpg`);
        myImg.setAttribute("width", "10");
        document.body.appendChild(myImg)
    }
}

function imageExists(url) {
    return new Promise(resolve => {
        var img = new Image()
        img.addEventListener('load', () => resolve(true))
        img.addEventListener('error', () => resolve(false))
        img.src = url
    })
}


// async function doThing() {

//     let requestURL2 = "../data/ex.txt";
//     let Brequest = new Request(requestURL2)
//     const response = await fetch(Brequest);
//     let textblah = await response.text();
//     console.log(textblah);
// }

// doThing();

// fetch("../data/ex.txt")
//     .then((response) => response.text())
//     .then((data) => console.log(data.split("\n")[2]));

//for presenting
function populateRecipes(allRecipes, searchName, searchType, searchCategory) {
    //clear options list and recipe sections
    // const table = document.querySelector('.movie-table');
    const recipesDisplayed = document.querySelectorAll('.recipe');
    for (const recipeDisplayed of recipesDisplayed) {
        recipeDisplayed.remove();
    }
    document.querySelector(".recipe-options").innerHTML = '';
    //filter
    let recipes = allRecipes.filter((currentValue) => {
        const success =
            currentValue.name.toLowerCase().includes(searchName.toLowerCase()) &&
            currentValue.type.toLowerCase().includes(searchType.toLowerCase()) &&
            currentValue.category.toLowerCase().includes(searchCategory.toLowerCase());
        return success;
    });

    //format and display options
    optionsList = document.querySelector(".recipe-options")
    for (let i = 0; i < recipes.length; i++) {
        optionsListItem = document.createElement("li");
        optionsListItemLink = document.createElement("a");
        optionsListItemLink.setAttribute("href", `#${recipes[i].name.toLowerCase().replace(" ", "-")}`)
        optionsListItemLink.textContent = recipes[i].name;
        // optionsListItem.textContent = recipes[i].name;
        optionsListItem.appendChild(optionsListItemLink);
        optionsList.appendChild(optionsListItem);
    }

    //format and display full recipes
    const page = document.querySelector(".page");
    for (let i = 0; i < recipes.length; i++) {
        //create section
        recipeSection = document.createElement("section");
        recipeSection.setAttribute('class', 'recipe');
        recipeSection.setAttribute('id', recipes[i].name.toLowerCase().replace(' ', '-'))
        //create title
        recipeTitle = document.createElement("h2");
        recipeTitle.textContent = recipes[i].name;
        //display image
        // TODO check if it exists before display
        recipeImage = document.createElement("img");
        recipeImage.setAttribute("src", `../Gallery/${allRecipes[i].name}.jpg`);
        recipeImage.setAttribute("width", "100");
        //create note
        recipeNote = document.createElement("p");
        recipeNote.innerHTML = `-----<br>${recipes[i].note}<br>-----`;
        //create ingredients heading
        recipeIngredientsHeading = document.createElement("h3");
        recipeIngredientsHeading.textContent = "Ingredients:"
        //create ingredients list
        recipeIngredientsList = document.createElement("ul");
        for (item of recipes[i].items) {
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
        for (step of recipes[i].steps) {
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
        page.insertBefore(recipeSection, page.childNodes[10]);
    }
}

//initial presentation
// populate();

//updating based on field changes
searchNameField.addEventListener('keydown', () => {
    populateRecipes(allRecipes, searchNameField.value, searchTypeField.value, searchCategoryField.value);
});

searchTypeField.addEventListener('keydown', () => {
    populateRecipes(allRecipes, searchNameField.value, searchTypeField.value, searchCategoryField.value);
});

searchCategoryField.addEventListener('keydown', () => {
    populateRecipes(allRecipes, searchNameField.value, searchTypeField.value, searchCategoryField.value);
});

