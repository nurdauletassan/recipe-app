document.addEventListener('DOMContentLoaded', () => {
  const apiKey = 'b83a7bf1dc04451fa2af73f2549a5dd9';

  const searchInput = document.getElementById('searchInput');
  const recipeGrid = document.getElementById('recipeGrid');
  const recipeModal = document.getElementById('recipeModal');
  const recipeDetails = document.getElementById('recipeDetails');
  const closeModal = document.getElementById('closeModal');
  const likedBtn = document.getElementById('likedBtn'); // Liked button from sidebar
  const homeBtn = document.getElementById('homeBtn'); // Home button from sidebar
  const appleBtn = document.getElementById('appleBtn'); // Apple button for ingredient search

  // Load saved recipes from localStorage
  const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes')) || [];

  // Event Listener for Home button click
  homeBtn.addEventListener('click', async () => {
    // Clear any search input
    searchInput.value = '';

    // Display a welcome message or default recipes
    recipeGrid.innerHTML = '<p></p>';
    homeBtn.classList.add('active');
    likedBtn.classList.remove('active');
    appleBtn.classList.remove('active');
    
    try {
      const popularRecipes = await fetchPopularRecipes(); // Fetch default popular recipes
      displayRecipes(popularRecipes);
    } catch (error) {
      console.error("Error fetching popular recipes:", error);
    }
  });
    homeBtn.click();
  // Event Listener for Liked button click
  likedBtn.addEventListener('click', () => {
    // Set Liked button as active
    likedBtn.classList.add('active');
    homeBtn.classList.remove('active');
    appleBtn.classList.remove('active'); // Remove active from home button

    displayRecipes(savedRecipes, true);
  });

  // Event Listener for Apple button click to search by ingredients
  appleBtn.addEventListener('click', async () => {
    // Set Liked button as active
    appleBtn.classList.add('active');
    likedBtn.classList.remove('active');
    homeBtn.classList.remove('active');
    
    const ingredientQuery = searchInput.value.trim();
    if (ingredientQuery.length > 0) {
      try {
        const recipes = await fetchRecipesByIngredients(ingredientQuery);
        displayRecipes(recipes);
      } catch (error) {
        console.error("Error fetching recipes by ingredients:", error);
      }
    } else {
      recipeGrid.innerHTML = '<p class="error-message">Please enter an ingredient to search for.</p>';
    }
  });

  // Function to fetch popular recipes (default display)
  async function fetchPopularRecipes() {
    try {
      const response = await fetch(
        `https://api.spoonacular.com/recipes/random?number=12&apiKey=${apiKey}`
      );
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data.recipes || [];
    } catch (error) {
      console.error("Error in fetchPopularRecipes:", error);
      return [];
    }
  }

  // Event Listener for search input (normal search)
  searchInput.addEventListener('input', async (e) => {
    const query = e.target.value.trim();
    if (query.length > 2) {
      try {
        const recipes = await fetchRecipes(query);
        displayRecipes(recipes);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    }
  });

  // Function to fetch recipes by ingredients from Spoonacular API
  async function fetchRecipesByIngredients(ingredients) {
    try {
      const response = await fetch(
        `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients}&number=12&apiKey=${apiKey}`
      );
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error("Error in fetchRecipesByIngredients:", error);
      return [];
    }
  }

  // Function to fetch recipes from Spoonacular API (general search)
  async function fetchRecipes(query) {
    try {
      const response = await fetch(
        `https://api.spoonacular.com/recipes/complexSearch?query=${query}&number=12&apiKey=${apiKey}`
      );
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error("Error in fetchRecipes:", error);
      return [];
    }
  }

  // Function to display recipes in the grid
  function displayRecipes(recipes, isSaved = false) {
    recipeGrid.innerHTML = '';
    if (recipes.length === 0) {
      recipeGrid.innerHTML = '<p class="error-message">No recipes found. Try a different search term.</p>';
      return;
    }

    recipes.forEach(recipe => {
      const recipeCard = document.createElement('div');
      recipeCard.classList.add('recipe-card');
      const preparationTime = recipe.readyInMinutes ? `${recipe.readyInMinutes} minutes` : 'N/A';
      const imageSrc = recipe.image || recipe.imageUrl || '/img/default-recipe.png';

      recipeCard.innerHTML = `
        <div class="image-wrapper">
          <img src="${imageSrc}" alt="${recipe.title}">
        </div>
        <h3>${recipe.title}</h3>
        <p>Ready in: ${preparationTime} minutes</p>
      `;

      recipeCard.addEventListener('click', () => showRecipeDetails(recipe.id));
      recipeGrid.appendChild(recipeCard);
    });
  }

  // Function to show recipe details in a modal
  async function showRecipeDetails(id) {
    try {
      const recipeInfo = await fetchRecipeDetails(id);
      const { title, image, extendedIngredients, instructions } = recipeInfo;

      // Check if the recipe is already saved
      const isSaved = savedRecipes.some(saved => saved.id === recipeInfo.id);
      const saveIconSrc = isSaved ? "/img/saved-black.svg" : "/img/saved-white.svg";

      // Render recipe details modal
      recipeDetails.innerHTML = `
        <div class="modal-header">
          <h2>${title}</h2>
          <button id="saveRecipeBtn" class="save-btn">
            <img id="saveIcon" src="${saveIconSrc}" alt="Save" />
          </button>
        </div>
        <img src="${image}" alt="${title}">
        <h3>Ingredients:</h3>
        <div class="ingredients-grid">
          ${extendedIngredients.map(ing => `<div class="ingredient-item">${ing.original}</div>`).join('')}
        </div>
        <h3>Instructions:</h3>
        <p>${instructions || 'No instructions available.'}</p>
      `;

      recipeModal.style.display = 'flex';

      // Add click event for save button
      const saveRecipeBtn = document.getElementById('saveRecipeBtn');
      const saveIcon = document.getElementById('saveIcon');
      saveRecipeBtn.addEventListener('click', () => toggleSaveRecipe(recipeInfo, saveIcon));
    } catch (error) {
      console.error("Error fetching recipe details:", error);
    }
  }

  // Function to toggle save/unsave recipe

  // Function to fetch recipe details
  async function fetchRecipeDetails(id) {
    try {
      const response = await fetch(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${apiKey}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error in fetchRecipeDetails:", error);
      return {};
    }
  }

  closeModal.addEventListener('click', () => {
    recipeModal.style.display = 'none';
  });
});
