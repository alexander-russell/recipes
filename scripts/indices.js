// Load recipes
fetchRecipeBook()
    .then((recipeBook => start(recipeBook)));

// Start function runs when recipeBook is loaded from file
async function start(recipeBook) {
    const indexElement = document.querySelector(".index")

    // Retrieve URL params, obliterate them
    urlParams = new URLSearchParams(document.location.search);
    history.replaceState({}, "", window.location.href.split('?')[0])

    // Filter to active recipes and display
    const activeRecipes = filterActiveRecipes(recipeBook.Recipes);
    displayIndex(activeRecipes, indexElement, urlParams);
}

// Display index using recipe list
function displayIndex(recipes, indexElement, urlParams) {
    // Create skeleton sections with headings and empty lists, for each letter of alphabet
    createSkeletonIndex(indexElement);

    // Add index entries
    addIndexItemsRecipes(recipes);
    addIndexItemsVegetarian(recipes);
    addIndexItemsCuisine(recipes);
}

function createSkeletonIndex(indexElement) {
    for (let i = "A".charCodeAt(0); i <= "Z".charCodeAt(0); i++) {
        // Create section
        const section = document.createElement("section");
        section.classList.add("chapter");
        section.id = String.fromCharCode(i);
        indexElement.appendChild(section);

        // Create heading
        const heading = document.createElement("h2");
        heading.textContent = String.fromCharCode(i);
        section.appendChild(heading);

        // Create list
        const list = document.createElement("ol");
        section.appendChild(list);
    }
}

function addIndexItemsRecipes(recipes) {
    // Add each recipe in
    for (let recipe of recipes) {
        if (recipe.Name.charAt(0) === "A" || true) {
            const item = document.createElement("li");
            addIndexItem(item, recipe.Name);
            const link = document.createElement("a");
            link.textContent = recipe.Name;
            link.href = `/recipes/display/${recipe.Slug}`;
            item.appendChild(link)
        }
    }
}

function addIndexItemsVegetarian(recipes) {
    // Filter recipes to veg ones
    const recipesVeg = recipes
        .filter(recipe => recipe.Dietary.Vegetarian)
        .sort((a, b) => a.Name < b.Name)

    // Create nested index for these recipes
    addNestedIndexItem("Vegetarian", recipesVeg);
}

function addIndexItemsCuisine(recipes) {
    const cuisines = recipes
        .map(recipe => recipe.Cuisine)
        .filter(value => value != "")
        .filter((value, index, array) => array.indexOf(value) === index);

    for (const cuisine of cuisines) {
        addNestedIndexItem(cuisine, recipes.filter(recipe => recipe.Cuisine == cuisine));
    }
}

function addNestedIndexItem(name, recipes) {
    // Create details element to store collapsible list of vegetarian meals
    const details = document.createElement("details");
    addIndexItem(details, name);

    // Create summary for details element
    const summary = document.createElement("summary");
    details.appendChild(summary);

    // Add title to summary, with count
    const heading = document.createElement("span");
    heading.classList.add("name");
    heading.textContent = name;
    summary.appendChild(heading);
    const count = document.createElement("span");
    count.classList.add("count");
    count.textContent = recipes.length;
    summary.appendChild(count);

    // Populate list
    const list = document.createElement("ol")
    details.appendChild(list);
    for (const recipe of recipes) {
        item = document.createElement("li");
        item.textContent = recipe.Name;
        list.appendChild(item);
    }
}

function addIndexItem(item, name) {
    // Find chapter to insert into
    const chapter = document.querySelector(`#${name.charAt(0)}>ol`);

    // Go thorugh child nodes, insert this before the first node that is alphabetically greater than this
    let done = false;
    let child = chapter.firstChild
    while (!done) {
        // Put on end if no more child nodes
        if (child === null) {
            chapter.appendChild(item);
            done = true;
        } else {
            // Check if alphabetically this is the spot, then insert before this node
            if (child.textContent > name) {
                chapter.insertBefore(item, child);
                done = true;
            }
            // Move along
            child = child.nextSibling;
        }
    }
}