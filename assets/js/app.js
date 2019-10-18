const API_KEY = "api_key=76ZP5rDu1BBh38KPtocOB2mx6rVyy6gC";
const GIF_URL = "https://api.giphy.com/v1/gifs/search?";
const LIMIT = "&limit=10";

//Store initial button names here
var topics = ["German Shepherd", "Puppy", "Corgi", "Husky", "Doggo", "Australian Shepherd", "Puppers", "Bork", "Heckin Cute"];
var currentTopic;
var offset = 0;

//Function to render buttons in the HTML
//Buttons should have data-name attribute matching the topic
//#button-display

function renderButtons() {
    $("#button-display").empty();
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
        console.log(error);
    })

    offset += 10;
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

    container.append([`<p>${gif.title}</p>`, staticImage, `<p>Rating: ${gif.rating}</p>`]);
    
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
    currentTopic = $(this).data().name;
    $("#gif-display").empty();
    offset = 0;
    getGifs();
});

//Click event to load more gifs

$("#more").on("click", function(event) {
    event.preventDefault();
    getGifs();
})

//Call renderButtons() to initialize page
$("#more").hide();
renderButtons();