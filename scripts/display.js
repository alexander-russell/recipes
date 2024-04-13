//Plan:
// teach display.js to scale recipe
// scale via url, so .ps1 can pass as parameter
// inline form to rescale dynamically
// form should update scale and url but without reload
// then setup .ps1 to build a separate database incl. costs and save to disk
// switch js to reading from that not config
// get rid of config, communicate just by url params
// with the above inplace, could theoretically be hosted online
// don't know how to do that
// then with all that, build an index.html page
// and maybe a gallery.html page 


const recipeWrapper = document.querySelector(".recipe-wrapper")
const recipeImageBackground = document.querySelector(".recipe-image-background");
const costAttributeExtraWrapper = document.querySelector(".cost-attribute-extra-wrapper");

let config;
let recipeBook;
let recipe;
let params;
let configLoaded = false;
let recipesLoaded = false;

function formatTime(seconds) {
    const SECONDS_PER_HOUR = 3600
    if (seconds >= SECONDS_PER_HOUR) {
        startIdx = 12
    } else {
        startIdx = 14
    }
    return new Date(seconds * 1000).toISOString().slice(startIdx, 19);
}

function getEpochSeconds() {
    return Math.floor(new Date().getTime() / 1000);
}

function round(number, decimalPlaces) {
    return +number.toFixed(decimalPlaces);
}

//Read in the config, containing the recipes
fetch("data/config.json", { cache: "no-cache" })
    .then((response) => response.json())
    .then((data) => {
        config = data;
        configLoaded = true;
        start();
    })
    .catch(error => console.error(error));

//Read in the recipe data (not used anymore)
fetch("RecipesCost.json")
    .then((response) => response.json())
    .then((data) => {
        recipeBook = data;
        recipesLoaded = true;
        start();
    })
    .catch(error => console.error(error));

//Start up function, finds recipe and calls displayRecipe
async function start() {
    if (recipesLoaded && configLoaded) {
        // Extract URL arguments
        params = new URLSearchParams(document.location.search);
        recipeName = params.get("recipe");

        // Filter recipe
        recipesFiltered = recipeBook.Recipes.filter((currentValue) => {
            const success =
                currentValue.Name.toLowerCase().includes(recipeName.toLowerCase())
            return success;
        });

        // Scale the recipe
        scaleRecipe(recipesFiltered[0], params.get("yield"));
        // Display the recipe specified in the URL
        displayRecipe(recipesFiltered[0]);
    }
}

async function scaleRecipe(recipe, yield) {
    // Calculate factor
    const factor = yield / recipe.Yield.Quantity

    // Scale yield
    recipe.Yield.Quantity = yield;
    recipe.Yield.Extra = scaleRecipeString(recipe.Yield.Extra, factor);

    // Scale note
    recipe.Note = scaleRecipeString(recipe.Note, factor);

    // Scale items
    for (item of recipe.Items) {
        item.Quantity = round(item.Quantity * factor, 2);
        item.NameExtra = scaleRecipeString(item.NameExtra, factor);
        item.UnitExtra = scaleRecipeString(item.UnitExtra, factor);
    }

    // Scale steps
    for (step of recipe.Steps) {
        step.Content = scaleRecipeString(step.Content, factor);
    }
}

function scaleRecipeString(string, factor) {
    if (null == string) {
        return null;
    }
    // Capture numbers written like @2 or @2.4 in a string, multiply them by factor and replace
    return string.replace(/@(\d(\.\d+)?)/g, function (a, b) { return round(factor * b, 2); })
}

// Structure and display recipe on-screen
async function displayRecipe(recipe) {
    displayRecipeHeader(recipe);
    displayRecipeHeaderIcons(recipe);
    displayRecipeAttributes(recipe);
    displayRecipeNote(recipe);
    displayRecipeItems(recipe);
    displayRecipeSteps(recipe);
    configureRecipeImage(recipe);
    configureRecipeDiary(recipe);
    configureRecipeExtra(recipe);
    configureRecipeTimers(recipe.Timers);
}

function displayRecipeHeader(recipe) {
    // Configure site heading
    const siteHeading = document.querySelector("head>title");
    siteHeading.textContent = `${recipe.Name} | Alex's Recipes`;

    // Configure recipe title
    const recipeNameElement = document.querySelector(".recipe-name")
    recipeNameElement.textContent = recipe.Name

    // Configure type and category display
    const groupingTypeElement = document.querySelector(".grouping-type");
    groupingTypeElement.textContent = recipe.Type
    const groupingCategoryElement = document.querySelector(".grouping-category");
    groupingCategoryElement.textContent = recipe.Category
}

function displayRecipeHeaderIcons(recipe) {
    ////////////  Stuff for icons-wrapper        ////////////
    const iconsListElement = document.querySelector(".icons-list")
    // Clear existing icons
    while (iconsListElement.hasChildNodes()) {
        iconsListElement.childNodes[0].remove();
    }

    // If image: add camera icon
    if (recipe.Image != "") {
        // Add element
        const cameraIcon = createIconCamera();
        iconsListElement.appendChild(cameraIcon);
        // Configure click event for camera icon, display image on click
        cameraIcon.addEventListener("click", (event) => {
            recipeImageBackground.style = "display: flex;";
        });
    }

    // If diary entry: add book icon
    if (recipe.Diary && recipe.Diary.length != 0) {
        const recipeDiaryBackground = document.querySelector(".recipe-diary-background");

        // Add icon
        const bookIcon = createIconBook()
        iconsListElement.appendChild(bookIcon);

        // Configure click event for book icon, display diary on click
        bookIcon.addEventListener("click", (event) => {
            recipeDiaryBackground.style = "display: flex;";
        });
    }

    // Add table of contents icon
    if (recipeBook.Recipes.length != 0) {
        const recipeExtraBackground = document.querySelector(".recipe-extra-background");

        // Add icon
        const listIcon = createIconList()
        iconsListElement.appendChild(listIcon);

        // Configure click event for list icon, display extra recipes on click
        listIcon.addEventListener("click", (event) => {
            recipeExtraBackground.style = "display: flex;";
        });
    }

    // If favourite: add heart icon
    if (recipe.Favourite) {
        iconsListElement.appendChild(createIconHeart());
    }
    // If bulk: add truck icon
    if (recipe.basicAttributesulk) {
        iconsListElement.appendChild(createIconTruck());
    }
    // If vegetarian/vegan: add lead icon
    if (recipe.Dietary.Vegetarian || recipe.Dietary.Vegan) {
        iconsListElement.appendChild(createIconLeaf());
    }
    // If gluten free: add glide icon
    if (recipe.Dietary.GlutenFree) {
        iconsListElement.appendChild(createIconGlide());
    }

}

function createIconCamera() {
    return createIcon("camera-icon", "Picture of the recipe", "0 0 512 512", "M149.1 64.8L138.7 96H64C28.7 96 0 124.7 0 160V416c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V160c0-35.3-28.7-64-64-64H373.3L362.9 64.8C356.4 45.2 338.1 32 317.4 32H194.6c-20.7 0-39 13.2-45.5 32.8zM256 192a96 96 0 1 1 0 192 96 96 0 1 1 0-192z");
}

function createIconTruck() {
    return createIcon("truck-icon", "Makes lots", "0 0 640 512", "M48 0C21.5 0 0 21.5 0 48V368c0 26.5 21.5 48 48 48H64c0 53 43 96 96 96s96-43 96-96H384c0 53 43 96 96 96s96-43 96-96h32c17.7 0 32-14.3 32-32s-14.3-32-32-32V288 256 237.3c0-17-6.7-33.3-18.7-45.3L512 114.7c-12-12-28.3-18.7-45.3-18.7H416V48c0-26.5-21.5-48-48-48H48zM416 160h50.7L544 237.3V256H416V160zM112 416a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm368-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z");
}

function createIconHeart() {
    return createIcon("heart-icon", "Favourite", "0 0 512 512", "M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z");
}

function createIconGlide() {
    return createIcon("glide-icon", "Gluten free", "0 0 448 512", "M252.8 148.6c0 8.8-1.6 17.7-3.4 26.4-5.8 27.8-11.6 55.8-17.3 83.6-1.4 6.3-8.3 4.9-13.7 4.9-23.8 0-30.5-26-30.5-45.5 0-29.3 11.2-68.1 38.5-83.1 4.3-2.5 9.2-4.2 14.1-4.2 11.4 0 12.3 8.3 12.3 17.9zM448 80v352c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V80c0-26.5 21.5-48 48-48h352c26.5 0 48 21.5 48 48zm-64 187c0-5.1-20.8-37.7-25.5-39.5-2.2-.9-7.2-2.3-9.6-2.3-23.1 0-38.7 10.5-58.2 21.5l-.5-.5c4.3-29.4 14.6-57.2 14.6-87.4 0-44.6-23.8-62.7-67.5-62.7-71.7 0-108 70.8-108 123.5 0 54.7 32 85 86.3 85 7.5 0 6.9-.6 6.9 2.3-10.5 80.3-56.5 82.9-56.5 58.9 0-24.4 28-36.5 28.3-38-.2-7.6-29.3-17.2-36.7-17.2-21.1 0-32.7 33-32.7 50.6 0 32.3 20.4 54.7 53.3 54.7 48.2 0 83.4-49.7 94.3-91.7 9.4-37.7 7-39.4 12.3-42.1 20-10.1 35.8-16.8 58.4-16.8 11.1 0 19 2.3 36.7 5.2 1.8 .1 4.1-1.7 4.1-3.5z");
}

function createIconLeaf() {
    return createIcon("leaf-icon", "Vegan or Vegetarian", "0 0 512 512", "M272 96c-78.6 0-145.1 51.5-167.7 122.5c33.6-17 71.5-26.5 111.7-26.5h88c8.8 0 16 7.2 16 16s-7.2 16-16 16H288 216s0 0 0 0c-16.6 0-32.7 1.9-48.3 5.4c-25.9 5.9-49.9 16.4-71.4 30.7c0 0 0 0 0 0C38.3 298.8 0 364.9 0 440v16c0 13.3 10.7 24 24 24s24-10.7 24-24V440c0-48.7 20.7-92.5 53.8-123.2C121.6 392.3 190.3 448 272 448l1 0c132.1-.7 239-130.9 239-291.4c0-42.6-7.5-83.1-21.1-119.6c-2.6-6.9-12.7-6.6-16.2-.1C455.9 72.1 418.7 96 376 96L272 96z");
}

function createIconBook() {
    return createIcon("book-icon", "Diary entries for recipe", "0 0 448 512", "M96 0C43 0 0 43 0 96V416c0 53 43 96 96 96H384h32c17.7 0 32-14.3 32-32s-14.3-32-32-32V384c17.7 0 32-14.3 32-32V32c0-17.7-14.3-32-32-32H384 96zm0 384H352v64H96c-17.7 0-32-14.3-32-32s14.3-32 32-32zm32-240c0-8.8 7.2-16 16-16H336c8.8 0 16 7.2 16 16s-7.2 16-16 16H144c-8.8 0-16-7.2-16-16zm16 48H336c8.8 0 16 7.2 16 16s-7.2 16-16 16H144c-8.8 0-16-7.2-16-16s7.2-16 16-16z");
}

function createIconClock() {
    return createIcon("clock-icon", "Make a clock visible", "0 0 512 512", "M256 0a256 256 0 1 1 0 512A256 256 0 1 1 256 0zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z")
}

function createIconList() {
    return createIcon("list-icon", "Browse other recipes", "0 0 512 512", "M40 48C26.7 48 16 58.7 16 72v48c0 13.3 10.7 24 24 24H88c13.3 0 24-10.7 24-24V72c0-13.3-10.7-24-24-24H40zM192 64c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zM16 232v48c0 13.3 10.7 24 24 24H88c13.3 0 24-10.7 24-24V232c0-13.3-10.7-24-24-24H40c-13.3 0-24 10.7-24 24zM40 368c-13.3 0-24 10.7-24 24v48c0 13.3 10.7 24 24 24H88c13.3 0 24-10.7 24-24V392c0-13.3-10.7-24-24-24H40z")
}

function displayRecipeAttributes(recipe) {
    // Handle difficulty (simple object)
    const attributeDifficultyElement = document.querySelector(`.difficulty-value`);
    attributeDifficultyElement.textContent = `${recipe.Difficulty}/10`

    // Handle time (nested object)
    const attributeTimeElement = document.querySelector(`.time-value`);
    attributeTimeElement.textContent = `${recipe.Time.Minutes} min`
    if (recipe.Time.Extra) {
        attributeTimeElement.textContent += ` (${recipe.Time.Extra})`
    }

    // Handle yield (nested object)
    const attributeYieldElement = document.querySelector(`.yield-value`);
    const attributeYieldQuantityElement = document.querySelector(".yield-quantity");
    attributeYieldQuantityElement.value = recipe.Yield.Quantity;
    const attributeYieldUnitElement = document.querySelector(".yield-unit");
    attributeYieldUnitElement.textContent = recipe.Yield.Unit
    if (recipe.Yield.Extra) {
        attributeYieldUnitElement.textContent += ` (${recipe.Yield.Extra})`
    }

    // Add yield change event handler
    attributeYieldQuantityElement.addEventListener("keyup", (event) => {
        console.log(event);
        if (event.key === "Enter") {
            location.href = `display?recipe=${params.get("recipe")}&yield=${event.target.value}`;
        }
    });

    // Handle cost (read from config, calculated by powershell)
    const attributeCostWrapper = document.querySelector(".cost-wrapper");
    const attributeCostElement = document.querySelector(".cost-value");
    attributeCostElement.textContent = `$${recipe.Cost.CostString}`;

    // Populate cost exclusions list
    const costAttributeExtra = document.querySelector(".cost-attribute-extra");
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

function displayRecipeNote(recipe) {
    // Find the element
    const notesElement = document.querySelector(".notes");

    // Clean up common LaTeX commands in note for HTML
    recipeNote = recipe.Note;
    recipeNote = recipeNote.replace(/\\href{(?<link>.*?)}{(?<name>.*?)}/g, '<a href="$1">$2</a>');
    recipeNote = recipeNote.replace(/\\textit{(?<content>.*?)}/g, '<cite>$1</cite>');
    recipeNote = recipeNote.replace(/\\hyperref\[\w+:.*?\]{(?<name>.*?)}/g, '<cite>$1</cite>');

    // Assign note to element
    notesElement.innerHTML = recipeNote;
}

function displayRecipeItems(recipe) {
    const itemsListElement = document.querySelector(".items-list");

    //Clear previous items
    while (itemsListElement.hasChildNodes()) {
        itemsListElement.childNodes[0].remove();
    }

    prevGroup = "";
    for (const item of recipe.Items) {
        displayRecipeItem(item);
    }
}

function displayRecipeItem(item) {
    const itemsListElement = document.querySelector(".items-list");

    // Add a group subheading
    if (item.Group != null && item.Group != prevGroup) {
        if (item.Group != "") {
            // For new group name that isn't blank, add a heading
            const subheading = document.createElement("h4");
            subheading.classList.add("items-group-title");
            subheading.textContent = item.Group
            itemsListElement.appendChild(subheading);
        } else {
            // For new group name that is blank, add a gap
            const gap = document.createElement("div");
            gap.classList.add("items-list-gap");
            itemsListElement.appendChild(gap);
        }
    }
    prevGroup = item.Group

    // Create item wrapper
    const listElement = document.createElement("li");
    listElement.classList.add("item");
    itemsListElement.appendChild(listElement);

    // Create item name
    const itemNameWrapper = document.createElement("span");
    itemNameWrapper.classList.add("item-name-wrapper");
    listElement.appendChild(itemNameWrapper);
    const itemName = document.createElement("span");
    itemName.classList.add("item-name");
    itemName.textContent = item.Name;
    itemNameWrapper.appendChild(itemName);

    // Create whitespace before name extra
    const preNameExtraWhitespace = document.createElement("span")
    preNameExtraWhitespace.textContent = " "
    itemNameWrapper.appendChild(preNameExtraWhitespace);

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

    // Create whitespace before unit
    const preUnitWhitespace = document.createElement("span")
    preUnitWhitespace.textContent = " "
    itemDetails.appendChild(preUnitWhitespace);

    // Create item unit
    const itemUnit = document.createElement("span");
    itemUnit.classList.add("item-unit");
    itemUnit.textContent = item.Unit;
    itemDetails.appendChild(itemUnit);

    // Create whitespace before unit extra
    const preUnitExtraWhitespace = document.createElement("span")
    preUnitExtraWhitespace.textContent = " "
    itemDetails.appendChild(preUnitExtraWhitespace);

    // Create item unit extra
    const itemUnitExtra = document.createElement("span");
    itemUnitExtra.classList.add("item-unit-extra");
    itemUnitExtra.textContent = item.UnitDetail ? item.UnitDetail : "";
    itemDetails.appendChild(itemUnitExtra);
}

function displayRecipeSteps(recipe) {
    // Get steps element
    const stepsListElement = document.querySelector(".steps-list");

    //Clear previous steps
    while (stepsListElement.hasChildNodes()) {
        stepsListElement.childNodes[0].remove();
    }

    //Add new steps
    for (step of recipe.Steps) {
        displayRecipeStep(step);
    }
}

function displayRecipeStep(step) {
    // Get steps element
    const stepsListElement = document.querySelector(".steps-list");

    //Create step element
    const listItem = document.createElement("li");
    listItem.textContent = step.Content;
    stepsListElement.appendChild(listItem);
}

function configureRecipeImage(recipe) {
    // Get image element
    const recipeImage = document.querySelector(".recipe-image");

    // Determine image address
    let imageAddress = null;
    if (recipe.Image == "Local") {
        //TODO support png 
        imageAddress = `Gallery/${recipe.Name}.jpg`;
    }
    else if (recipe.Image != "") {
        imageAddress = recipe.Image;
    }

    // If address found, use that image
    if (imageAddress != null) {
        recipeImage.setAttribute("src", imageAddress);
    }

    // On click of close button, hide image
    const imageCloseWrapper = document.querySelector(".image-close-wrapper");
    imageCloseWrapper.addEventListener("click", (mouse) => {
        recipeImageBackground.style = "display: none;";
    });

    // On click anywhere (except image itself), hide image
    recipeImageBackground.addEventListener("click", (mouse) => {
        recipeImageBackground.style = "display: none;";
    });

    // On click on image itself, catch event bubble, do nothing
    recipeImage.addEventListener("click", (event) => {
        event.stopPropagation()
    });
}

function configureRecipeDiary(recipe) {
    // Get diary elements
    const recipeDiaryBackground = document.querySelector(".recipe-diary-background");
    const recipeDiaryWrapper = document.querySelector(".recipe-diary-wrapper");
    const recipeDiaryElement = document.querySelector(".recipe-diary");

    // Clear existing entries
    while (recipeDiaryElement.hasChildNodes()) {
        recipeDiaryElement.childNodes[0].remove();
    }

    // Add entries
    if (recipe.Diary) {
        for (const entry of recipe.Diary) {
            // Make date tag
            const diaryItemTag = document.createElement("dt");
            diaryItemTag.textContent = entry.Date.substring(0, 10);
            recipeDiaryElement.appendChild(diaryItemTag);
            // Make content description
            const diaryItemDescription = document.createElement("dd");
            diaryItemDescription.textContent = entry.Content;
            recipeDiaryElement.appendChild(diaryItemDescription);
        }
    }

    // On click of close button, hide diary
    const diaryCloseWrapper = document.querySelector(".diary-close-wrapper");
    diaryCloseWrapper.addEventListener("click", (mouse) => {
        recipeDiaryBackground.style = "display: none;";
    });

    // On click anywhere (except diary itself), hide diary
    recipeDiaryBackground.addEventListener("click", (mouse) => {
        recipeDiaryBackground.style = "display: none;";
    });

    // On click on diary itself, catch event bubble, do nothing
    recipeDiaryWrapper.addEventListener("click", (event) => {
        event.stopPropagation()
    });
}

function configureRecipeExtra() {
    // Get recipe wrapper element
    const recipeExtraBackground = document.querySelector(".recipe-extra-background");
    const recipeExtraWrapper = document.querySelector(".recipe-extra-wrapper");
    const recipeExtra = document.querySelector(".recipe-extra");

    // Clear existing items
    while (recipeExtra.hasChildNodes()) {
        recipeExtra.childNodes[0].remove();
    }

    // Add recipe names to list
    for (let i = 0; i < recipeBook.Recipes.length; i++) {//extraRecipe of config.ExtraRecipes) {
        // Create link element
        const recipeExtraItemLink = document.createElement("a");
        recipeExtraItemLink.classList.add("recipe-extra-item-link");
        recipeExtraItemLink.setAttribute("href", `display?recipe=${recipeBook.Recipes[i].Name}`);
        recipeExtra.appendChild(recipeExtraItemLink)

        // Create button element within link
        const recipeExtraItem = document.createElement("button");
        recipeExtraItem.classList.add("recipe-extra-item");
        recipeExtraItem.textContent = recipeBook.Recipes[i].Name;
        recipeExtraItemLink.appendChild(recipeExtraItem);

        // Load this recipe on click
        // recipeExtraItem.addEventListener("click", () => {
        // window.location.href = "";
        // displayRecipe(config.ExtraRecipes[i]);
        // });
    }

    // On click of close button, hide diary
    const extraCloseWrapper = document.querySelector(".extra-close-wrapper");
    extraCloseWrapper.addEventListener("click", (mouse) => {
        recipeExtraBackground.style = "display: none;";
    });

    // On click anywhere (except diary itself), hide diary
    recipeExtraBackground.addEventListener("click", (mouse) => {
        recipeExtraBackground.style = "display: none;";
    });

    // On click on diary itself, catch event bubble, do nothing
    recipeExtraWrapper.addEventListener("click", (event) => {
        event.stopPropagation()
    });
}

// Create timer elements or a clock
async function configureRecipeTimers(timers) {
    let timersWrapperElement = document.querySelector(".timers-wrapper")
    let timersElement = document.querySelector(".timers");

    // If no timersWrapperElement, create it
    if (!timersWrapperElement) {
        const infoWrapperElement = document.querySelector(".info-wrapper");
        timersWrapperElement = document.createElement("div");
        timersWrapperElement.classList.add("timers-wrapper");
        infoWrapperElement.appendChild(timersWrapperElement)
    }

    // If no timersElement, create it
    if (!timersElement) {
        timersElement = document.createElement("div");
        timersElement.classList.add("timers");
        timersWrapperElement.appendChild(timersElement);
    }

    // Clear any existing timers (or clock)
    while (timersElement.hasChildNodes()) {
        timersElement.childNodes[0].remove();
    }

    // If no timers, add a clock
    if (timers.length == 0) {
        configureRecipeClock(timers);

    }

    // Add an element for each timer
    for (let i = 0; i < timers.length; i++) {
        configureRecipeTimer(timers[i], i);
    }

    // Check up on the timers every second
    // TODO don't do this unless atleast one timer is active
    setInterval(manageTimers, 1000);
}

function configureRecipeClock(timers) {
    //Get the empty timers element
    let timersWrapperElement = document.querySelector(".timers-wrapper")
    let timersElement = document.querySelector(".timers");

    //Create clock wrapper
    const clockWrapperElement = document.createElement("div");
    clockWrapperElement.classList.add("clock-wrapper");
    timersElement.appendChild(clockWrapperElement);

    //Create clock element
    const clockElement = document.createElement("button");
    clockElement.classList.add("clock");
    clockElement.textContent = new Date().toTimeString().substring(0, 8);
    clockWrapperElement.appendChild(clockElement);

    //Add double click to delete
    clockWrapperElement.addEventListener("dblclick", () => {
        //Remove the clock element
        timersWrapperElement.remove();

        //Add a clock icon to icons bar to bring it back
        const iconsListElement = document.querySelector(".icons-list")
        const clockIcon = createIconClock();
        iconsListElement.appendChild(clockIcon);

        // Configure click event for clock icon - bring back clock
        clockIcon.addEventListener("click", (event) => {
            configureRecipeTimers(timers);
            clockIcon.remove();
        });
    });
}

function configureRecipeTimer(timer, i) {
    //Find the timers list element
    const timersElement = document.querySelector(".timers");

    //Create timer
    const timerElement = document.createElement("button");
    timerElement.classList.add("timer");
    timerElement.id = `timer-${i}`;
    timerElement.setAttribute("remaining", timer.Seconds);
    timerElement.setAttribute("total", timer.Seconds);
    timerElement.setAttribute("lastupdated", getEpochSeconds());
    timerElement.setAttribute("name", timer.Name);

    //Create wrapper to store timer content
    const timerContentElement = document.createElement("div");
    timerContentElement.classList.add("timer-content");
    timerElement.appendChild(timerContentElement);

    //Add name
    const timerNameElement = document.createElement("div");
    timerNameElement.classList.add("timer-name");
    timerNameElement.textContent = timer.Name;
    timerContentElement.appendChild(timerNameElement);

    //Add time
    const timerTimeElement = document.createElement("div");
    timerTimeElement.classList.add("timer-time");
    timerTimeElement.textContent = formatTime(timer.Seconds);
    timerContentElement.appendChild(timerTimeElement);

    //Append to list of timers
    timersElement.appendChild(timerElement);

    //Add click event listener (Play Pause)
    timerElement.addEventListener("click", () => {
        // Determine current state of timer
        active = timerElement.classList.contains("active");
        elapsed = timerElement.classList.contains("elapsed");

        // Determine new state based on current state
        if (active) {
            if (elapsed) {
                alert("active and elapsed??");
            } else {
                timerElement.classList.remove("active");
            }
        } else {
            if (elapsed) {
                total = timerElement.getAttribute("total");
                timerElement.classList.remove("elapsed");
                timerElement.setAttribute("remaining", total);
            } else {
                timerElement.classList.add("active");
            }
        }

        //add double click event listener (Reset)
        timerElement.addEventListener("dblclick", (event) => {
            timerElement.setAttribute("remaining", timer.Seconds);
            timerElement.classList.remove("active");
            timerElement.classList.remove("elapsed");
            manageTimer(i);
        });

        //Synchronise with display
        manageTimer(i);
    });
}

function manageTimers() {
    // Find all timers in the timer list
    timerElements = document.querySelectorAll('.timer');

    // if no timers, manage clock
    if (timerElements.length == 0) {
        clockElement = document.querySelector(".clock");
        if (clockElement) {
            clockElement.textContent = new Date().toTimeString().substring(0, 8);
        }
    }

    // manage each timer
    for (let i = 0; i < timerElements.length; i++) {
        manageTimer(i);
    }
}

function manageTimer(i) {
    // Find this timer
    const timerElement = document.querySelector(`#timer-${i}`);

    // Get remaining time and state
    let remaining = timerElement.getAttribute("remaining");
    let active = timerElement.classList.contains("active");
    let elapsed = timerElement.classList.contains("elapsed");

    //Handle timer that is started on zero
    if (active && remaining == 0) {
        total = timerElement.getAttribute("total");
        timerElement.setAttribute("remaining", total);
    }

    // Get epoch seconds now and when the timer was last updated, for timekeeping
    const lastUpdated = timerElement.getAttribute("lastupdated");
    const currentTime = getEpochSeconds();

    //Update timer remaining (decrement active timers, increment elapsed timers). only if haven't been updated already this second
    if (lastUpdated != currentTime) {
        timerElement.setAttribute("lastupdated", currentTime);
        if (active) {
            remaining--;
        }
        if (elapsed) {
            remaining++;
        }
        timerElement.setAttribute("remaining", remaining);
    }

    //Handle elapsed timer
    if (active && remaining == 0) {
        timerElement.classList.add("elapsed");
        timerElement.classList.remove("active");
    }

    //Make elapsed timer flash
    elapsed = timerElement.classList.contains("elapsed");
    if (elapsed) {
        //Control bold text flashing
        if (getEpochSeconds() % 2 == 0) {
            timerElement.classList.add("flashing");
        } else {
            timerElement.classList.remove("flashing");
        }

        //Speak timer name aloud
        if (!timerElement.classList.contains("speaking")) {
            //Add speaking class (so too many utterances aren't queued)
            timerElement.classList.add("speaking");

            //Arrange text to speech of timer name
            const speaker = window.speechSynthesis
            const utterance = new SpeechSynthesisUtterance(timerElement.getAttribute("name"));
            speaker.speak(utterance);

            //Remove speaking class when this is done
            utterance.addEventListener("end", () => {
                timerElement.classList.remove("speaking");
            });
        }
    } else {
        timerElement.classList.remove("flashing");
    }

    //Ensure display is synced
    const timerTimeElement = document.querySelector(`#timer-${i} .timer-time`);
    timerTimeElement.textContent = formatTime(remaining);
}

function createIcon(name, description, viewbox, path) {
    const size = 27;
    // Create list item
    const iconWrapperElement = document.createElement("li");
    iconWrapperElement.classList.add("icon-wrapper");
    // // Create and configure svg element
    iconWrapperElement.innerHTML = `
        <svg height="${size}" xmlns="http://www.w3.org/2000/svg" width=${size} viewBox="${viewbox}" aria-labelledby=${name} class="icon" role="img">
            <title id=${name}>${description}</title>
            <path d="${path}"></path>
        </svg>`;
    // Return completed object
    return iconWrapperElement;
}

