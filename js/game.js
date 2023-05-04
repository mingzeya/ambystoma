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

// Define which bgm to play
var bgm_index = -1;

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
var all_clickable_objects = [];
var found_ambystoma = []; // found ambystoma
var objectsToDraw = []; // all objects to draw

var transparent_background = new helper.image_object('assets/transparent_background.jpg', 1);
var solid_background = new helper.image_object('assets/background.jpg', 1);
var all_ambystoma = []; // all the ambystoma
var AMBYSTOMA_TAG = "ambystoma";
for (var i = 0; i < 25; i++) {
    all_ambystoma.push(
        new helper.image_object(`assets/ambystoma${i+1}.png`, 1, 
            ambystoma_positions[i][0], ambystoma_positions[i][1],
            AMBYSTOMA_TAG, click_on_unfound_ambystoma)
    );
}
var cat_object = new helper.image_object(`assets/cat.png`, 1, 
    776, 627,
    "", click_on_cat);
var dog_object = new helper.image_object(`assets/dog.png`, 1,
    962, 775,
    "", click_on_dog);
var hythlodaeus_object = new helper.image_object(`assets/hythlodaeus.png`, 1, 
    115, 1138,
    "", click_on_hythlodaeus);
var hythlodaeus_small_object = new helper.image_object(`assets/hythlodaeus_small.png`, 1, 
    925, 931,
    "", click_on_hythlodaeus);
var zenos_object = new helper.image_object(`assets/zenos_big.png`, 1, 
    269, 1170,
    "", click_on_zenos);
var zenos_small_object = new helper.image_object(`assets/zenos_small.png`, 1, 
    1038, 783,
    "", click_on_zenos);    

all_clickable_objects = [cat_object, dog_object,
    hythlodaeus_object, hythlodaeus_small_object,
    zenos_object, zenos_small_object];
all_clickable_objects = all_clickable_objects.concat(all_ambystoma);
objectsToDraw = [transparent_background];

// Define audio objects
var bgm_audio = document.getElementById("bgm_audio");
bgm_audio.volume = 0.05;
var bgm_audio_group = [bgm_audio];
var bgm_audio_2 = document.getElementById("bgm_audio_2");
bgm_audio_2.volume = 0.05;
var bgm_audio_group_2 = [bgm_audio_2]
var bgm_audio_groups = [bgm_audio_group, bgm_audio_group_2];

var found_audio = document.getElementById("found_audio");
var found_audio_group = [found_audio];
var misclick_audio = document.getElementById("misclick_audio");
var misclick_audio_group = [misclick_audio];
var duplicate_audio = document.getElementById("duplicate_audio");
var duplicate_audio_group = [duplicate_audio];
var complete_audio = document.getElementById("complete_audio");
var complete_audio_group = [complete_audio];
var cat_audio = document.getElementById("cat_audio");
var cat_audio_group = [cat_audio];
var hythlodaeus_audio = document.getElementById("hythlodaeus_audio");
var hythlodaeus_audio2 = document.getElementById("hythlodaeus_audio2");
var hythlodaeus_audio3 = document.getElementById("hythlodaeus_audio3");
var hythlodaeus_audio4 = document.getElementById("hythlodaeus_audio4");
var hythlodaeus_audio_group = [hythlodaeus_audio, hythlodaeus_audio2,
hythlodaeus_audio3, hythlodaeus_audio4];
var zenos_audio = document.getElementById("zenos_audio");
var zenos_audio_group = [zenos_audio];

// Typical draw
function draw() {
    // Draw objects
    helper.draw_objects(objectsToDraw, ctx);
    // Display score
    ctx.font = "70px cursive";
    ctx.fillText(found_ambystoma.length+"/25", 60, 110);
}

// reInitialize game
function reInitialize() {
    found_ambystoma = [];
    for (var i in all_clickable_objects) {
        if (all_clickable_objects[i].tag == AMBYSTOMA_TAG) {
            all_clickable_objects[i].click_func = click_on_unfound_ambystoma;
        }
    }

    objectsToDraw = [transparent_background];
    ended = false;
    end_counter = END_COUNT;
    bgm_index = -1;
    helper.endSound(complete_audio_group);
    helper.playSound(bgm_audio_group);
    draw();
}

// End game
function end() {
    ended = true;
    end_current_bgm();
    helper.playSound(complete_audio_group);
    objectsToDraw = [solid_background];
}

// End current bgm
function end_current_bgm() {
    if (bgm_index != -1) {
        helper.endSound(bgm_audio_groups[bgm_index]);
    }
}

// Play next bgm
function play_next_bgm() {
    end_current_bgm();
    bgm_index = (bgm_index + 2)%(bgm_audio_groups.length + 1) - 1;
    console.log("bgm_index: " + bgm_index);
    if (bgm_index != -1) {
        helper.playSound(bgm_audio_groups[bgm_index]);
    }
}

// Initial draw. This will be called after the images are loaded.
document.addEventListener('readystatechange', function() {
    draw();
    // Hidden layer will only be called once
    helper.draw_objects(all_clickable_objects, hidden_ctx);
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

// Define click events for different groups of objects
function click_on_unfound_ambystoma(ambystoma) {
    console.log("Found ambystoma!")

    // Update arrays
    found_ambystoma.push(ambystoma);
    objectsToDraw.push(ambystoma);
    // Update click function
    ambystoma.click_func = click_on_found_ambystoma;
    // Play sound
    helper.playSound(found_audio_group);
    // Check if game finishes
    if (found_ambystoma.length == all_ambystoma.length) {
        end();
    }
}

function click_on_found_ambystoma(clicked) {
    console.log("Found but duplicate!");
    helper.playSound(duplicate_audio_group);
}

function click_on_cat(clicked) {
    console.log("Click on cat!");
    helper.playSound(cat_audio_group);
}

function click_on_dog(clicked) {
    console.log("Click on dog!");
    play_next_bgm();
}

function click_on_hythlodaeus(clicked) {
    console.log("Click on Hythlodaeus!");
    helper.playSound(hythlodaeus_audio_group);
}

function click_on_hythlodaeus_small(clicked) {
    console.log("Click on Hythlodaeus_small!");
    helper.playSound(hythlodaeus_audio_group);
}

function click_on_zenos(clicked) {
    console.log("Click on Zenos!");
    helper.playSound(zenos_audio_group);
}

// Check if the clicked pixel is transparent. 
// If actually clicked on object, check which object it is
// Trigger corresponding event from objects
hidden_canvas.addEventListener("click", function(event) {
    if (ended) {
        if (end_counter <= 0) {
            reInitialize();
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
        var clicked_object = null;
        var min_dist = Number.MAX_SAFE_INTEGER;
        for (var i in all_clickable_objects) {
            var dist = helper.compute_dist(x,y,all_clickable_objects[i].pos_x,all_clickable_objects[i].pos_y);
            if (dist < min_dist) {
                clicked_object = all_clickable_objects[i];
                min_dist = dist;
            }
        }

        // Trigger event for clickable object
        clicked_object.click_func(clicked_object);

        // Finally, update the display
        draw();
    }
})

// Remove spinner
document.getElementById("spinner").remove();