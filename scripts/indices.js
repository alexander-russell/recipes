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

    // Create test nested index (pretty cool)
    // l = document.createElement("li");
    // l.textContent = "Alphabet"
    // u = document.createElement("ol");
    // l.appendChild(u);
    // l1 = document.createElement("li");
    // l1.textContent = "hey1";
    // u.appendChild(l1)
    // l2 = document.createElement("li");
    // l2.textContent = "hey2";
    // u.appendChild(l2)
    // addIndexItem(l, "A", "Alphabet");
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
            addIndexItem(item, recipe.Name.charAt(0), recipe.Name);
            const link = document.createElement("a");
            link.textContent = recipe.Name;
            link.href = `/recipes/display/${recipe.Slug}`;
            item.appendChild(link)
        }
    }
}

function addIndexItem(item, letter, name) {
    // Find chapter to insert into
    const chapter = document.querySelector(`#${letter}>ol`);
    
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