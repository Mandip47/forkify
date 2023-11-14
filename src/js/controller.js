import * as model from './model.js';
import {MODAL_CLOSE_SEC} from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';

///////////////////////////////////////
// if (module.hot) {
//   module.hot.accept();
// }

const controlRecipes = async function () {
  
  try {
    const id = window.location.hash.slice(1);
    // loading receipe
  
    if (!id) return;
    recipeView.renderSpinner();

    // update results view tomark selected recipe
    resultsView.update(model.getSearchResultsPage());
    //loading recipe
    bookmarksView.update(model.state.bookmarks);
    
    await model.loadRecipe(id);
    // rendering recipe
    
    recipeView.render(model.state.recipe);
    //updating bookmarks view

  } catch (error) {
    recipeView.renderError();
    console.log(error);
  }
};

const controlSearchResults = async function () {
  try {

    resultsView.renderSpinner();

    // get search history
    const query = searchView.getQuery();
    if (!query) return;

    //load search
    await model.loadSearchResults(query);

    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage(1));

    // render initial paginationbutton

    paginationView.render(model.state.search);

  } catch (error) {
    console.log(error);
  }
};

const controlPagination = function (goToPage) {

  //render new results
  resultsView.render(model.getSearchResultsPage(goToPage));

  // render new  paginationbutton
  paginationView.render(model.state.search);

}

const controlServings = function (newServings) {
  ///Update the recipe servings
  model.updateServings(newServings);
  // update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);

}

const controlAddBookmark = function () {

  // add remove bookmarks
  if(!model.state.recipe.bookmarked)
    model.addBookmark(model.state.recipe);  
  else
  model.deleteBookmark(model.state.recipe.id);  


//pdate recipe view
recipeView.update(model.state.recipe);
bookmarksView.render(model.state.bookmarks);

}

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
}

const controlAddRecipe = async function (newRecipe) { 
  try {
    //show loading spinner
    addRecipeView.renderSpinner();
    
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // /render recipe

    recipeView.render(model.state.recipe);

    // sucess message
    addRecipeView.renderMessage();
    //render bookmark view

    bookmarksView.render(model.state.bookmarks);

    //change id in the url
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    //close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);

  } catch (err) {
    console.error('up', err);
    addRecipeView.renderError(err.message);
  }
}


const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};

init();

