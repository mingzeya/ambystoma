import * as helper from './helper.js';

// Initialize canvas
// Hidden canvas overlaps with the normal rendering canvas
var canvas = document.getElementById("game-canvas");
var ctx = canvas.getContext("2d");
var hidden_canvas = document.getElementById("hidden-canvas");
var hidden_ctx = hidden_canvas.getContext("2d");

// Game state variables
var ended = false;
var END_COUNT = 3;
var end_counter = END_COUNT; // To prevent game reset immediately, define a click counter of reset

// Initialize the bgm play for the very first click because Chrome doesn't allow play audio on load
var bgm_play = false;
var ambystoma_positions = [[587, 467],
    [515, 732], [811, 1035], [513, 1067],
    [1016,357], [935, 426], [1152, 410],
    [1250,617], [914, 797], [662, 425],
    [1057, 196], [296, 349], [294, 530],
    [242, 422], [224, 299], [548, 461],
    [251, 739], [294, 788], [489, 687],
    [598, 731], [1290, 509], [982, 154],
    [598, 184], [777, 397], [278, 875]]


// Define image objects
var all_objects = []; // Only for initialization
var all_ambystoma = []; // all the ambystoma
var found_ambystoma = []; // found ambystoma
var objectsToDraw = []; // all objects to draw

var transparent_background = {image: new Image(), zIndex: 1, source: 'assets/transparent_background.jpg'};
var solid_background = {image: new Image(), zIndex: 1, source: 'assets/background.jpg'};
for (var i = 0; i < 25; i++) {
    all_ambystoma.push({image: new Image(), zIndex: 2, source: `assets/ambystoma${i+1}.png`, x: ambystoma_positions[i][0], y: ambystoma_positions[i][1]});
}

all_objects = [transparent_background, solid_background];
all_objects = all_objects.concat(all_ambystoma);
objectsToDraw = [transparent_background];

// Initialize image objects' sources
for (var i = 0; i < all_objects.length; i++) {
    all_objects[i].image.src = all_objects[i].source;
    all_objects[i].image.crossOrigin = "anonymous";
}

// Define audio objects
var bgm_audio = document.getElementById("bgm_audio");
bgm_audio.volume = 0.1;
var bgm_audio_group = [bgm_audio];
var found_audio = document.getElementById("found_audio");
var found_audio_group = [found_audio];
var misclick_audio = document.getElementById("misclick_audio");
var misclick_audio_group = [misclick_audio];
var duplicate_audio = document.getElementById("duplicate_audio");
var duplicate_audio_group = [duplicate_audio];
var complete_audio = document.getElementById("complete_audio");
var complete_audio_group = [complete_audio];

// Typical draw
function draw() {
    // Draw objects
    helper.draw_objects(objectsToDraw, ctx);
    // Display score
    ctx.font = "70px cursive";
    ctx.fillText(found_ambystoma.length+"/25", 60, 110);
}

// Initialize game
function initialize() {
    found_ambystoma = [];
    objectsToDraw = [transparent_background];
    if (ended) {
        ended = false;
        end_counter = END_COUNT;
        helper.playSound(bgm_audio_group);
        draw();
    }
}

// End game
function end() {
    ended = true;
    helper.endSound(bgm_audio_group);
    helper.playSound(complete_audio_group);
    objectsToDraw = [solid_background];
}

// Initialize is called at first
initialize();

// Initial draw. This will be called after the images are loaded.
document.addEventListener('readystatechange', function() {
    draw();
    // Hidden layer will only be called once
    helper.draw_objects(all_ambystoma, hidden_ctx);
}, false);

// Listen on normal canvas, and transfer the event to hidden canvas
canvas.addEventListener("click", function(event) {
        var x = event.offsetX;
        var y = event.offsetY;
        var copied_click = new MouseEvent(
            "click",
            {
                clientX: event.offsetX,
                clientY: event.offsetY,
                bubbles: true
            }
        )
        
        hidden_canvas.dispatchEvent(copied_click);
    }
)

// Check if the clicked pixel is transparent. 
// If actually clicked on object, check which object it is
// Trigger corresponding event from objects
hidden_canvas.addEventListener("click", function(event) {
    if (!bgm_play) {
        helper.playSound(bgm_audio_group);
        bgm_play=true;
    }

    if (ended) {
        if (end_counter <= 0) {
            initialize();
        } else {
            end_counter -= 1;
        }
        return;
    }

    var x = event.offsetX;
    var y = event.offsetY;
    
    var pixelData = hidden_ctx.getImageData(x, y, 1, 1).data;
    console.log(x,y); 

    // If transparency on the pixel , array = [0,0,0,0]
    if((pixelData[0] == 0) && (pixelData[1] == 0) && (pixelData[2] == 0) && (pixelData[3] == 0)){
        console.log("Did not click on ambystoma!");
        helper.playSound(misclick_audio_group);
    } else {
        // Find closest clicked ambystoma
        var closest_ambystoma = null;
        var min_dist = Number.MAX_SAFE_INTEGER;
        for (var i in all_ambystoma) {
            var ax = all_ambystoma[i].x;
            var ay = all_ambystoma[i].y;
            var dist = helper.compute_dist(x,y,ax,ay);
            if (dist < min_dist) {
                closest_ambystoma = all_ambystoma[i];
                min_dist = dist;
            }
        }
        if (!found_ambystoma.includes(closest_ambystoma)) {
            console.log("Found ambystoma!")
            found_ambystoma.push(closest_ambystoma);
            objectsToDraw.push(closest_ambystoma);
            helper.playSound(found_audio_group);
            // Check if game finishes
            if (found_ambystoma.length == all_ambystoma.length) {
                end();
            }
            draw();
        } else {
            console.log("Found but duplicate!")
            helper.playSound(duplicate_audio_group);
        }
    }
})
