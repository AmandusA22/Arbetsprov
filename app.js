var input = document.getElementById("input");
var searchResults = document.getElementById("search-results");

var searchElem = document.getElementById("search");

// We only want the search options to be displayed the search input or search results is the focused element.
document.querySelector("body").addEventListener("click", function() {
  if (document.activeElement.id === "input" || document.activeElement.className.includes("listElement")) {
    searchResults.className += " is-shown"
  } else {
    searchResults.classList.remove("is-shown")
  }
});

input.onkeyup = function(e) {
  search();
}

// Enable going through the search results from your keyboard
searchResults.onkeydown = function(e) {
  var tabIndex = document.activeElement.tabIndex;
  if (e.keyCode == 40 && document.activeElement.nextSibling) {
    document.activeElement.nextSibling.focus()
  }
  if (e.keyCode == 38 && document.activeElement.previousSibling) {
    document.activeElement.previousSibling.focus()
  }
}

// Adds a search history list item to the DOM.
function addHistoryItem(data) {
  var name = data.name
  var ul = document.querySelector('ul.searches-saved');
  var li = createSavedSearchListItem();
  var nameP = createParagraph(name);
  li.appendChild(nameP);
  var dateP = createDateParagraph();
  li.appendChild(dateP)
  var deleteButton = createDeleteButton(li);
  li.appendChild(deleteButton);
  li.id = data.id;
  ul.insertBefore(li, null);
}

function createDeleteButton(li) {
  var deleteDiv = document.createElement("DIV");
  deleteDiv.className = "delete-div";
  var deleteIcon = document.createElement("DIV");
  deleteIcon.className = "delete-icon";
  deleteDiv.addEventListener('click', function() {
    removeItem(li.id);
  });
  deleteDiv.appendChild(deleteIcon);
  return deleteDiv;
}

function removeItem(id) {
  var elem = document.getElementById(id);
  return elem.parentNode.removeChild(elem);
}

function createSavedSearchListItem() {
  var li = document.createElement('li');
  li.className = "added-item";
  return li;
}

function createDateParagraph() {
  // Creates a date with correct format taking timezone into consideration
  var date = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60 * 1000).toISOString().substr(0, 19).replace('T', ' ');;
  var dateP = document.createElement("SPAN");
  dateP.className = "date";
  dateP.appendChild(document.createTextNode(date))
  return dateP;
}

function createParagraph(name) {
  var namePararagraph = document.createElement("SPAN");
  var nameNode = document.createTextNode(name);
  namePararagraph.className = "item-name"
  namePararagraph.appendChild(nameNode);
  return namePararagraph;
}

var timeout;

var req = new XMLHttpRequest();
// saves request in timeout since only the last entered text in the input is relevant and there's no need to send requests when user is typing.
function search() {
  req.addEventListener("load", handleResults);
  var spinner = document.getElementById("spinner");
  spinner.className += " is-shown";
  // removes previous results;
  while (searchResults.firstChild) {
    searchResults.removeChild(searchResults.firstChild);
  }

  clearTimeout(timeout);
  // In case the user types more after 400ms before a request is resolved.
  req.abort();

  timeout = setTimeout(function() {
    req.open("GET", "https://api.github.com/search/repositories?q=" + input.value)
    req.send();
  }, 400);
}

function handleResults(evt) {
  spinner.classList.remove("is-shown");
  var response = JSON.parse(evt.currentTarget.response);

  if (!response.items) {
    return;
  }

  response.items.map((repositorie, index) => {
    var repositorieElem = createListElement(repositorie, index);
    searchResults.appendChild(repositorieElem);
  })
}

function createListElement(data, index) {

  var listElement = document.createElement('li');
  listElement.className = "listElement";
  listElement.tabIndex = index;
  listElement.appendChild(document.createTextNode(data.name));

  listElement.addEventListener('click', function() {
    addHistoryItem(data);
  });

  listElement.onkeyup = function(e) {
    if (e.keyCode == 13) {
      addHistoryItem(data);
    }
  }
  return listElement;
}
