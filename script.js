
const API = "https://www.themealdb.com/api/json/v1/1";
 
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const randomBtn = document.getElementById("random-btn");
const message = document.getElementById("message");
const result = document.getElementById("recipe-result");
const modalOverlay = document.getElementById("modal-overlay");
const modalContent = document.getElementById("modal-content");
const modalClose = document.getElementById("modal-close");
 
let currentMeals = []; 
 
// Helpers 
async function fetchMeals(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Network error");
  const data = await res.json();
  return data.meals || [];
}
 
function getIngredients(meal) {
  const list = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal["strIngredient" + i];
    const measure = meal["strMeasure" + i];
    if (ingredient && ingredient.trim()) {
      list.push(((measure || "").trim() + " " + ingredient.trim()).trim());
    }
  }
  return list;
}
 
function createCard(meal) {
  return `
    <article class="recipe-card" data-id="${meal.idMeal}">
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}" />
      <div class="recipe-info">
        <h3>${meal.strMeal}</h3>
        <p class="tags">${meal.strCategory || "Recipe"} . ${meal.strArea || "Unknown"}</p>
        <button class="toggle-btn">View Recipe</button>
      </div>
    </article>
  `;
}
 
function showMeals(meals) {
  currentMeals = meals;
  result.innerHTML = meals.map(createCard).join("");
}
 
function openModal(meal) {
  const ingredients = getIngredients(meal)
    .map((item) => `<li>${item}</li>`)
    .join("");
 
  modalContent.innerHTML = `
    <img class="modal-img" src="${meal.strMealThumb}" alt="${meal.strMeal}" />
    <h2>${meal.strMeal}</h2>
    <p class="tags">${meal.strCategory || "Recipe"} . ${meal.strArea || "Unknown"}</p>
    <h4>Ingredients</h4>
    <ul>${ingredients}</ul>
    <h4>Instructions</h4>
    <p>${meal.strInstructions}</p>
  `;
 
  modalOverlay.classList.remove("hidden");
}
 
function closeModal() {
  modalOverlay.classList.add("hidden");
}
 
// Actions 
async function loadInitialRecipes() {
  message.textContent = "Loading recipes...";
  try {
    const meals = await fetchMeals(API + "/search.php?s=");
    showMeals(meals.slice(0, 17));
    message.textContent = "Search for a recipe or get a random one!";
  } catch (err) {
    message.textContent = err;
  }
}
 
async function searchRecipes() {
  const query = searchInput.value.trim();
  if (!query) {
    message.textContent = "Please type something to search.";
    return;
  }
 
  message.textContent = "Searching...";
  result.innerHTML = "";
 
  try {
    const meals = await fetchMeals(API + "/search.php?s=" + encodeURIComponent(query));
    if (meals.length === 0) {
      message.textContent = `No recipes found for "${query}".`;
      return;
    }
    showMeals(meals);
    message.textContent = `Found ${meals.length} recipe(s) for "${query}"`;
  } catch (err) {
    message.textContent = "Something went wrong. Please try again.";
  }
}
 
async function getRandomRecipe() {
  message.textContent = "Finding a random recipe...";
  try {
    const meals = await fetchMeals(API + "/random.php");
    openModal(meals[0]);
    message.textContent = "Here's a random recipe for you!";
  } catch (err) {
    message.textContent = "Something went wrong. Please try again.";
  }
}
 
// Events 
searchBtn.addEventListener("click", searchRecipes);
 
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchRecipes();
});
 
randomBtn.addEventListener("click", getRandomRecipe);
 
modalClose.addEventListener("click", closeModal);
 
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});
 
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});


// "View Recipe" button on any card (event delegation)
result.addEventListener("click", (e) => {
  if (!e.target.classList.contains("toggle-btn")) return;
  const id = e.target.closest(".recipe-card").dataset.id;
  const meal = currentMeals.find((m) => m.idMeal === id);
  if (meal) openModal(meal);
});
 
loadInitialRecipes();
 
