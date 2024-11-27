// Script entry point to follow

fetchRecipeBook()
    .then((recipeBook) => {
        const filteredRecipes = filterActiveRecipes(recipeBook.Recipes);
        start(filteredRecipes);
    })

function start(recipes) {
    // Analyse URL
    const params = new URLSearchParams(document.location.search);
    const yield = params.get("yield");
    const slug = window.location.pathname.split("display/")[1].split(".html")[0]

    // Select, scale and display recipe
    // BUG should this be getRecipeDeepClone?
    const recipe = getRecipe(recipes, slug);
    configureRecipe(recipe, yield)

    // Configure webpage name
    const siteHeading = document.querySelector("head>title");
    siteHeading.textContent = `${recipe.Name} | Alex's Recipes`;
}

function configureRecipe(recipe, yield) {
    // Scale recipe
    const recipeScaled = scaleRecipe(recipe, yield);
    // Display in viewer (pass original recipe for future re-scaling)
    displayRecipe(recipeScaled, recipe);
}

function scaleRecipe(recipe, yield) {
    // Deep clone object
    recipe = structuredClone(recipe);

    // Calculate factor
    const factor = (null === yield | yield == 0) ? 1 : yield / recipe.Yield.Quantity;

    // Update form element
    const yieldQuantityElement = document.querySelector(".yield-quantity");
    yieldQuantityElement.setAttribute("value", `${factor * recipe.Yield.Quantity}`);

    // Scale yield and note
    recipe.Yield.Quantity = yield;
    recipe.Yield.Extra = scaleRecipeString(recipe.Yield.Extra, factor);
    recipe.Note = scaleRecipeString(recipe.Note, factor);

    // Scale items
    for (item of recipe.Items) {
        item.Quantity = round(item.Quantity * factor, 2);
        item.NameDetail = scaleRecipeString(item.NameDetail, factor);
        item.UnitDetail = scaleRecipeString(item.UnitDetail, factor);

    }

    // Scale steps
    for (step of recipe.Steps) {
        step.Content = scaleRecipeString(step.Content, factor);
    }

    // Return modified recipe
    return recipe;
}

// Structure and display recipe
function displayRecipe(recipe, originalRecipe) {
    displayRecipeHeader(recipe);
    displayRecipeAttributes(recipe, originalRecipe);
    displayRecipeNote(recipe.Note);
    displayRecipeItems(recipe.Items);
    displayRecipeSteps(recipe.Steps);
    configureRecipeImage(recipe.Image, recipe.Name);
    configureRecipeDiary(recipe.Diary);
    configureRecipeCostBreakdown(recipe.Cost);
    displayTimers(recipe.Timers);
}

function displayRecipeHeader(recipe) {
    displayRecipeHeaderName(recipe.Name, recipe.Type, recipe.Category);
    displayRecipeHeaderIcons(recipe);
}

function displayRecipeHeaderName(name, type, category) {
    // Configure recipe title, type and category
    const recipeNameElement = document.querySelector(".recipe-name")
    recipeNameElement.textContent = name
    const groupingTypeElement = document.querySelector(".grouping-type");
    groupingTypeElement.textContent = type
    const groupingCategoryElement = document.querySelector(".grouping-category");
    groupingCategoryElement.textContent = category
}

function displayRecipeHeaderIcons(recipe) {
    // Clear existing icons
    const list = document.querySelector(".icons-list")
    while (list.hasChildNodes()) {
        list.childNodes[0].remove();
    }

    // Create new icons
    icons = [
        createRecipeHeaderIconHome(),
        createRecipeHeaderIconImage(recipe.Image),
        createRecipeHeaderIconDiary(recipe.Diary),
        createRecipeHeaderIconCost(recipe.Cost),
        createRecipeHeaderIconConditional(recipe.Favourite, createIconHeart),
        createRecipeHeaderIconConditional(recipe.Bulk, createIconTruck),
        createRecipeHeaderIconConditional(recipe.Dietary.Vegetarian || recipe.Dietary.Vegan, createIconLeaf),
        createRecipeHeaderIconConditional(recipe.Dietary.GlutenFree, createIconGlide)
    ]

    // Add all returned icons to icon list element
    icons.filter(icon => null != icon).forEach(icon => list.appendChild(icon));
}

function createRecipeHeaderIconHome() {
    // Create icon
    homeIcon = createIconHome();

    // Configure click event
    homeIcon.classList.add("clickable");
    homeIcon.addEventListener("click", () => {
        location.href = "/recipes";
    });

    return homeIcon
}

function createRecipeHeaderIconImage(image) {
    if (image == "") {
        return null;
    }

    // Add element
    const cameraIcon = createIconCamera();

    // Configure click event for camera icon, display image on click
    cameraIcon.classList.add("clickable");
    cameraIcon.addEventListener("click", () => {
        openRecipeOverlayDisplay("image");
    });

    return cameraIcon;
}

function createRecipeHeaderIconDiary(diary) {
    if (null == diary || diary.length == 0) {
        return null;
    }

    // Create icon
    const bookIcon = createIconBook()

    // Configure click event for book icon, display diary on click
    bookIcon.classList.add("clickable");
    bookIcon.addEventListener("click", (event) => {
        openRecipeOverlayDisplay("diary");
    });

    return bookIcon;
}

function createRecipeHeaderIconCost(cost) {
    // Create icon
    const moneyIcon = createIconMoney();

    // Configure click event, display cost breakdown on click
    moneyIcon.classList.add("clickable");
    moneyIcon.addEventListener("click", (event) => {
        openRecipeOverlayDisplay("cost");
    });

    return moneyIcon;
}

function createRecipeHeaderIconConditional(test, iconFunction) {
    if (test) {
        return iconFunction();
    } else {
        return null;
    }
}

function displayRecipeAttributes(recipe, recipeOriginal) {
    // Handle difficulty (simple object)
    if (recipe.Difficulty != 0) {
        const attributeDifficultyElement = document.querySelector(`.difficulty-value`);
        attributeDifficultyElement.textContent = `${recipe.Difficulty}/10`
    } else {
        document.querySelector("span.difficulty").remove()
    }

    // Handle time (nested object)
    if (recipe.Time.Minutes != 0) {
        const attributeTimeElement = document.querySelector(`.time-value`);
        attributeTimeElement.textContent = `${recipe.Time.Minutes} min`
        if (recipe.Time.Extra) {
            attributeTimeElement.textContent += ` (${recipe.Time.Extra})`
        }
    } else {
        document.querySelector("span.time").remove()
    }

    // Handle yield (nested object)
    // Test against unscaled yield to determine if field filled out, rather than just form unfilled
    if (recipeOriginal.Yield.Quantity != 0) {
        const attributeYieldQuantityElement = document.querySelector(".yield-quantity");
        attributeYieldQuantityElement.setAttribute("placeholder", `${recipe.Yield.Quantity}`);
        const attributeYieldUnitElement = document.querySelector(".yield-unit");
        attributeYieldUnitElement.textContent = recipe.Yield.Unit;
        if (recipe.Yield.Extra) {
            attributeYieldUnitElement.textContent += ` (${recipe.Yield.Extra})`;
        }

        // Add yield change event handler
        attributeYieldQuantityElement.oninput = (event) => {
            // Modify the URL without reload, then rescale recipe
            history.pushState({}, "", window.location.href.split('?')[0] + `?yield=${event.target.value}`);
            configureRecipe(recipeOriginal, event.target.value);
        };
    } else {
        document.querySelector("span.yield").remove();
    }

    // Handle cost (calculated by powershell)
    displayRecipeCost(recipe);
}

function displayRecipeCost(recipe) {
    const attributeCostWrapper = document.querySelector(".cost-wrapper");
    const attributeCostElement = document.querySelector(".cost-value");
    attributeCostElement.textContent = `$${recipe.Cost.CostString}`;

    // Populate cost exclusions list
    const costAttributeExtra = document.querySelector(".cost-attribute-extra");
    const costAttributeExtraWrapper = document.querySelector(".cost-attribute-extra-wrapper");
    if (recipe.Cost.ExclusionsString != "") {
        costAttributeExtra.textContent = recipe.Cost.ExclusionsString
        // Handle pop-up pane for cost exclusions
        attributeCostWrapper.addEventListener("mouseover", (event) => {
            costAttributeExtraWrapper.style.display = "flex";
        });
        attributeCostWrapper.addEventListener("mousemove", (event) => {
            costAttributeExtraWrapper.style.left = `${event.x + 5}px`;
            costAttributeExtraWrapper.style.top = `${event.y + 5}px`;
        });
        attributeCostWrapper.addEventListener("mouseout", (event) => {
            costAttributeExtraWrapper.style.display = "none"
        });
    }
}

function displayRecipeNote(note) {
    // Find the element
    const notesElement = document.querySelector(".notes");

    // Clean up common LaTeX commands in note for HTML
    note = note
        .replace(/\\href{(?<link>.*?)}{(?<name>.*?)}/g, '<a href="$1">$2</a>')
        .replace(/\\textit{(?<content>.*?)}/g, '<cite>$1</cite>')
        .replace(/\\hyperref\[\w+:.*?\]{(?<name>.*?)}/g, '<cite>$1</cite>')
        .replace("\\&", "&");

    // Assign note to element
    notesElement.innerHTML = note;
}


function displayRecipeItems(items) {
    const list = document.querySelector(".items-list");

    // Clear previous items
    while (list.hasChildNodes()) {
        list.childNodes[0].remove();
    }

    // Display new items, keeping track of most recent group name
    let prevGroup = "";
    for (const item of items) {
        displayRecipeItem(item, list, prevGroup);
        prevGroup = item.Group;
    }
}

function displayRecipeItem(item, list, prevGroup) {
    // Add a group subheading
    if (item.Group != null && item.Group != prevGroup) {
        if (item.Group != "") {
            // For new group name that isn't blank, add a heading
            const subheading = document.createElement("h4");
            subheading.classList.add("items-group-title");
            subheading.textContent = item.Group
            list.appendChild(subheading);
        } else {
            // For new group name that is blank, add a gap
            const gap = document.createElement("div");
            gap.classList.add("items-list-gap");
            list.appendChild(gap);
        }
    }

    // Create item wrapper
    const listElement = document.createElement("li");
    listElement.classList.add("item");
    list.appendChild(listElement);

    // Create item name
    const itemNameWrapper = document.createElement("span");
    itemNameWrapper.classList.add("item-name-wrapper");
    listElement.appendChild(itemNameWrapper);
    const itemName = document.createElement("span");
    itemName.classList.add("item-name");
    itemName.textContent = item.Name;
    itemNameWrapper.appendChild(itemName);

    // Create item name extra
    const itemNameExtra = document.createElement("span");
    itemNameExtra.classList.add("item-name-extra");
    itemNameExtra.textContent = item.NameDetail ? item.NameDetail : "";
    itemNameWrapper.appendChild(itemNameExtra);

    // Create item detail wrapper
    const itemDetails = document.createElement("span");
    itemDetails.classList.add("item-details");
    listElement.appendChild(itemDetails);

    // Create item quantity
    const itemQuantity = document.createElement("span");
    itemQuantity.classList.add("item-quantity");
    if (item.Quantity != 0) {
        itemQuantity.textContent = item.Quantity;
        itemDetails.appendChild(itemQuantity);
    }

    // Create item unit
    const itemUnit = document.createElement("span");
    itemUnit.classList.add("item-unit");
    itemUnit.textContent = item.Unit;
    itemDetails.appendChild(itemUnit);

    // Create item unit extra
    const itemUnitExtra = document.createElement("span");
    itemUnitExtra.classList.add("item-unit-extra");
    itemUnitExtra.textContent = item.UnitDetail ? item.UnitDetail : "";
    itemDetails.appendChild(itemUnitExtra);
}


function displayRecipeSteps(steps) {
    // Get steps element
    const list = document.querySelector(".steps-list");

    //Clear previous steps
    while (list.hasChildNodes()) {
        list.childNodes[0].remove();
    }

    //Add new steps
    for (const step of steps) {
        displayRecipeStep(step, list);
    }
}

function displayRecipeStep(step, list) {
    //Create step element
    const listItem = document.createElement("li");
    listItem.textContent = step.Content;
    list.appendChild(listItem);
}

// Overlay management to follow

// Handle click of overlay, close button and background
function configureOverlayBehaviour(name) {
    // On click anywhere (except image itself), hide image (includes close button)
    const overlayBackground = document.querySelector(`.recipe-${name}-background`);
    overlayBackground.addEventListener("click", (mouse) => {
        closeRecipeOverlayDisplay(name);
    });

    // On click on image itself, catch event bubble, do nothing
    const overlay = document.querySelector(`.recipe-${name}`);
    overlay.addEventListener("click", (event) => {
        event.stopPropagation()
    });
}

// Control visibility of image and diary sections
function closeRecipeOverlayDisplay(name) {
    const overlayBackground = document.querySelector(`.recipe-${name}-background`);
    overlayBackground.classList.add("hidden");
    document.querySelector(".recipe-content-wrapper").classList.remove("hidden");
}

function openRecipeOverlayDisplay(name) {
    const overlayBackground = document.querySelector(`.recipe-${name}-background`);
    overlayBackground.classList.remove("hidden");
    document.querySelector(".recipe-content-wrapper").classList.add("hidden");

        // On Escape keypress, close the overlay
        document.body.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeRecipeOverlayDisplay(name);
            }
        });
}

function configureRecipeImage(path, name) {
    // Get image element
    const image = document.querySelector(".recipe-image");

    // Determine image address
    if (path == "Local") {
        path = `/recipes/Gallery/${name}.avif`
    }

    // If address found, use that image
    if (path != null) {
        image.setAttribute("src", path);
    }

    // On click of close button, hide image and show content
    configureOverlayBehaviour("image");
}

function configureRecipeDiary(diary) {
    if (diary) {
        // Get diary elements
        const list = document.querySelector(".recipe-diary");

        // Clear existing entries
        while (list.hasChildNodes()) {
            list.childNodes[0].remove();
        }

        // Add entries
        for (const entry of diary) {
            // Make date tag
            const date = document.createElement("dt");
            date.textContent = entry.Date.substring(0, 10);
            list.appendChild(date);

            // Make content description
            const content = document.createElement("dd");
            content.textContent = entry.Content;
            list.appendChild(content);
        }

        // Set up click to close
        configureOverlayBehaviour("diary");
    }
}

function configureRecipeCostBreakdown(cost) {
    // Get cost breakdown element
    const table = document.querySelector(".recipe-cost");
    const tbody = table.querySelector("tbody");

    // Add a row for each item
    for (itemCost of cost.ItemCosts) {
        const row = tbody.insertRow();
        row.insertCell().textContent = itemCost.Name;
        row.insertCell().textContent = `${itemCost.Item.Quantity == 0 ? "" : itemCost.Item.Quantity} ${itemCost.Item.Unit}`;
        row.insertCell().textContent = (itemCost.Ingredient != null && itemCost.Ingredient.Price != 0) ? `$${itemCost.Ingredient.Price} per ${itemCost.Ingredient.Quantity} ${itemCost.Ingredient.Unit}` : "";
        row.insertCell().textContent = itemCost.Amount != 0 ? `$${itemCost.Amount.toFixed(2)}` : '';

        // If item wasn't found, mark row
        if (!itemCost.Success) {
            row.classList.add("cost-failed");
        }
    }

    // Display recipe total in footer (fancy currency string formatting, undefined will use user locale)
    document.querySelector(".total-cell").textContent = cost.Amount.toLocaleString(undefined, { style: "currency", currency: "AUD", minimumFractionDigits: 2 });

    // Set up click to close
    configureOverlayBehaviour("cost");
}

// TODO:
// cost breakdown overlay