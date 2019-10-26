const API_KEY = "api_key=76ZP5rDu1BBh38KPtocOB2mx6rVyy6gC";
const GIF_URL = "https://api.giphy.com/v1/gifs/search?";
const GIF_BY_ID_URL = "https://api.giphy.com/v1/gifs/";
const LIMIT = "&limit=10";

const FAVORITES_KEY = "favorites";

//Store initial button names here
var topics = ["German Shepherd", "Puppy", "Corgi", "Husky", "Doggo", "Australian Shepherd", "Puppers", "Bork", "Heckin Cute"];
var favorites = [];
var currentTopic;
var offset = 0;
var viewingFavorites = false;

//Function to render buttons in the HTML
//Buttons should have data-name attribute matching the topic
//#button-display

function renderButtons() {
    $("#button-display").empty();

    let favoriteButton = $("<button>")
        .addClass("btn btn-success m-1")
        .attr("id", "favorites")
        .html("Favorites");

    $("#button-display").append(favoriteButton);

    topics.forEach(function (topic) {
        let btn = $("<button>")
            .attr("data-name", topic)
            .addClass("btn btn-primary topic m-1")
            .html(topic);
        $("#button-display").append(btn);
    });
}

//Grab 10 static images and place them on the page
//display the gif's rating under every gif

function getGifs() {
    $("#more").show();
    $.ajax({
        url: GIF_URL + API_KEY + LIMIT + `&q=${currentTopic}` + `&offset=${offset}`,
        method: "GET"
    }).then(function (response) {
        console.log(response);
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
        url: GIF_BY_ID_URL + id + "?" + API_KEY,
        method: "GET"
    }).then(function (response) {
        console.log(response);
        renderGif(response.data);
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
    
    let staticImage = $("<img>")
        .attr("src", gif.images.fixed_height_still.url)
        .data("playing", false)
        .data("stillurl", gif.images.fixed_height_still.url)
        .data("gifurl", gif.images.fixed_height.url);
    staticImage.on("click", togglePlaying);

    let favoriteIcon = $("<a>")
        .attr("href", "#")
        .attr("data-id", gif.id)
        .addClass("float-right favoritify")

    let clearfix = $("<div>")
        .addClass("clearfix mb-2");

    toggleFavoriteStar(favoriteIcon);

    container.append([`<p>${gif.title}</p>`, staticImage, clearfix, `<p class="float-left">Rating: ${gif.rating}</p>`, favoriteIcon]);
    
    $("#gif-display").append(container);
}

//Click event assigned to gifs, to toggle play/pause

function togglePlaying() {
    let data = $(this).data();

    if (data.playing) {
        $(this).attr("src", data.stillurl);
        $(this).data("playing", false);
    } else {
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

//Function to get favorites from local storage and assing to favorites array

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
    let newButtonName = $("#new-button-name").val();
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

//Call renderButtons() to initialize page
$("#more").hide();
renderButtons();