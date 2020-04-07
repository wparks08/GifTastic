const API_KEY = "api_key=76ZP5rDu1BBh38KPtocOB2mx6rVyy6gC";
const GIF_URL = "https://api.giphy.com/v1/gifs/search?";
const GIF_BY_ID_URL = "https://api.giphy.com/v1/gifs/";
const RANDOM_ID_URL = "https://api.giphy.com/v1/randomid";
const LIMIT = "&limit=10";

const FAVORITES_KEY = "favorites";

//Store initial button names here
const topics = ["German Shepherd", "Puppy", "Corgi", "Husky", "Doggo", "Australian Shepherd", "Puppers", "Bork", "Heckin Cute"];
let favorites = [];
let currentTopic;
let offset = 0;
let viewingFavorites = false;
let randomId = "";

const $favoriteButton = $("<button>")
    .addClass("btn btn-success m-1")
    .attr("id", "favorites")
    .html("Favorites");

//Function to render buttons in the HTML
//Buttons should have data-name attribute matching the topic
//#button-display

function renderButtons() {
    const $topicButtons = topics.map(createTopicButton);
    $("#button-display")
        .empty()
        .append($favoriteButton)
        .append($topicButtons);
}

//Create an individual button for a topic

function createTopicButton(topic) {
    return $("<button>")
        .attr("data-name", topic)
        .addClass("btn btn-primary topic m-1")
        .html(topic);
}

//Grab 10 static images and place them on the page
//display the gif's rating under every gif

function getGifs() {
    $("#more").show();
    $.ajax({
        url: GIF_URL + API_KEY + LIMIT + `&q=${currentTopic}` + `&offset=${offset}` + `&random_id=${randomId}`,
        method: "GET"
    }).then(function (response) {
        response.data.forEach(function (gif) {
            renderGif(gif);
        })
    }, function (error) {
        console.log("Giphy API Error: " + error);
    })

    offset += 10;
}

//Function to get a specific gif

function getGifById(id) {
    $.ajax({
        url: GIF_BY_ID_URL + id + "?" + API_KEY + `&random_id=${randomId}`,
        method: "GET"
    }).then(function (response) {
        renderGif(response.data);
    }, function (error) {
        console.log("Giphy API Error: " + error);
    })
}

//Function to get random user id

function getRandomId() {
    $.ajax({
        url: RANDOM_ID_URL + "?" + API_KEY,
        method: "GET"
    }).then(function (response) {
        localStorage.setItem("randomId", response.data.random_id);
        randomId = response.data.random_id;
    }, function (error) {
        console.log("Giphy API Error: " + error);
    })
}

function actionRegister(url) {
    $.ajax({
        url: url + "&" + API_KEY + "&random_id=" + randomId + "&ts=" + new Date().valueOf(),
        method: "GET"
    }).then(function (response) {
    }, function (error) {
        console.log("Giphy API Error: " + error);
    })
}

//Function to actually render the gifs
//#gif-display

function renderGif(gif) {
    //expand on this
    let container = $("<div>")
        .addClass("giftainer p-2 text-center m-2");
    
    let image = $("<img>")
        .attr("src", gif.images.fixed_height_still.url)
        .data("playing", false)
        .data("stillurl", gif.images.fixed_height_still.url)
        .data("gifurl", gif.images.fixed_height.url);
    image.on("click", togglePlaying);

    let favoriteIcon = $("<a>")
        .attr("href", "#")
        .attr("data-id", gif.id)
        .addClass("float-right favoritify")

    let clearfix = $("<div>")
        .addClass("clearfix mb-2");

    toggleFavoriteStar(favoriteIcon);

    container.append([`<p>${gif.title}</p>`, image, clearfix, `<p class="float-left">Rating: ${gif.rating}</p>`, favoriteIcon]);
    
    $("#gif-display").append(container);

    if (gif.analytics) {
        image.data("onClickUrl", gif.analytics.onclick.url);
        actionRegister(gif.analytics.onload.url);
    }
}

//Click event assigned to gifs, to toggle play/pause

function togglePlaying() {
    let data = $(this).data();

    if (data.playing) {
        $(this).attr("src", data.stillurl);
        $(this).data("playing", false);
    } else {
        if (data.onClickUrl) {
            actionRegister(data.onClickUrl);
        }
        $(this).attr("src", data.gifurl);
        $(this).data("playing", true);
    }
}

//Function to add or toggle a favorite star when clicked

function toggleFavoriteStar(element) {
    if (favorites.includes(element.data("id"))) {
        fillFavoriteStar(element);
    } else {
        outlineFavoriteStar(element);
    }
}

function fillFavoriteStar(element) {
    element.empty();
    element.append(
        $("<i>")
            .addClass("material-icons")
            .text("star")
    );
}

function outlineFavoriteStar(element) {
    element.empty();
    element.append(
        $("<i>")
            .addClass("material-icons")
            .text("star_border")
    );
}

//Functions to add and remove a gif id from favorites

function addFavorite(id) {
    favorites.push(id);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

function removeFavorite(id) {
    for (let i = 0; i < favorites.length; i++) {
        if (favorites[i] === id) {
            favorites.splice(i, 1);
            break;
        }
    }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

//Function to get favorites from local storage and passing to favorites array

function getFavorites() {
    if (localStorage.getItem(FAVORITES_KEY)) {
        favorites = JSON.parse(localStorage.getItem("favorites"));
    }
}

function displayFavorites() {
    viewingFavorites = true;
    $("#more").hide();
    $("#gif-display").empty();
    favorites.forEach(function (id) {
        getGifById(id);
    });
}

//Function to grab new topic from form and add it to array

$(".add-button").on("click", function(event) {
    event.preventDefault();
    const newButtonName = $("#new-button-name").val();
    topics.push(newButtonName);
    renderButtons();

    $("#new-button-name").val("");
})

//Click event assigned to buttons to grab specified gifs via API call

$(document).on("click", ".topic", function() {
    viewingFavorites = false;
    currentTopic = $(this).data().name;
    $("#gif-display").empty();
    offset = 0;
    getGifs();
});

//Click event to save a gif to favorites

$(document).on("click", ".favoritify", function(event) {
    event.preventDefault();
    let id = $(this).data("id");
    if (favorites.includes(id)) {
        removeFavorite(id)
    } else {
        addFavorite(id);
    }
    toggleFavoriteStar($(this));
    if (viewingFavorites) {
        displayFavorites();
    }
})

//Click event to load more gifs

$("#more").on("click", function(event) {
    event.preventDefault();
    getGifs();
});

//Click event to display favorites

$(document).on("click", "#favorites", function(event) {
    event.preventDefault();
    displayFavorites();
});

//Initialize favorites from local storage
getFavorites();

if (!localStorage.getItem("randomId")) {
    getRandomId();
} else {
    randomId = localStorage.getItem("randomId");
}

//Call renderButtons() to initialize page
$("#more").hide();
renderButtons();