// Initialize canvas
// Hidden canvas overlaps with the normal rendering canvas
var canvas = document.getElementById("game-canvas");
var ctx = canvas.getContext("2d");
var hidden_canvas = document.getElementById("hidden-canvas");
var hidden_ctx = hidden_canvas.getContext("2d");
var ended = false;
// To prevent game reset immediately, define a click counter of reset
var END_COUNT = 3;
var end_counter = END_COUNT;
var bgm_play = false;
var ambystoma_positions = [[632, 471],
                            [515, 732],
                            [811, 1035],
                            [513, 1067],
                            [1016, 357],
                            [935, 426],
                            [1152, 410],
                            [1250, 617],
                            [914, 797],
                            [662, 425],
                            [1057, 196],
                            [296, 349],
                            [294, 530],
                            [242, 422],
                            [224, 299],
                            [548, 461],
                            [251, 739],
                            [294, 788],
                            [489, 687],
                            [598, 731],
                            [1290, 509],
                            [982, 154],
                            [598, 184],
                            [777, 397],
                            [278, 875]]


// Define objects
var transparent_background = {image: new Image(), zIndex: 1, source: 'assets/transparent_background.jpg'};
var solid_background = {image: new Image(), zIndex: 1, source: 'assets/background.jpg'};
all_ambystoma = [];
found_ambystoma = [];
for (var i = 0; i < 25; i++) {
    all_ambystoma.push({image: new Image(), zIndex: 2, source: `assets/ambystoma${i+1}.png`, x: ambystoma_positions[i][0], y: ambystoma_positions[i][1]});
}

all_objects = [transparent_background, solid_background];
all_objects = all_objects.concat(all_ambystoma);

// Initialize objects' sources
for (var i = 0; i < all_objects.length; i++) {
    all_objects[i].image.src = all_objects[i].source;
    all_objects[i].image.crossOrigin = "anonymous";
} 

// Define what to draw
objectsToDraw = [transparent_background];


// Function to draw objects with different layers
function draw_objects(objectsToDraw, ctx) {
    objectsToDraw.sort(function(a, b) {
        return a.zIndex - b.zIndex;
    });
    // draw the objects in order
    for (var i = 0; i < objectsToDraw.length; i++) {
        ctx.drawImage(objectsToDraw[i].image, 0, 0);
    }
}

// Typical draw
function draw() {
    draw_objects(objectsToDraw, ctx);
    // Display score
    ctx.font = "70px cursive";
    ctx.fillText(found_ambystoma.length+"/25", 60, 110);
}

// Initial draw. This will be called after the images are loaded.
document.addEventListener('readystatechange', function() {
    draw();
    // Hidden layer will only be called once
    draw_objects(all_ambystoma, hidden_ctx);
}, false);

// Note this is not distance, this is square of distance
function compute_dist(x,y,ax,ay) {
    return Math.pow(x-ax,2) + Math.pow(y-ay,2);
}

function initialize() {
    found_ambystoma = [];
    objectsToDraw = [transparent_background];
    draw();
    ended = false;
    end_counter = END_COUNT;
    playSound("bgm", 0.1);
}

function end() {
    objectsToDraw = [solid_background];
    draw();
    ended = true;
    endSound("bgm");
    playSound("complete");
}

function playSound(name, volume=1.0) 
{
    var audio = document.getElementById(name);
    audio.currentTime = 0;
    audio.volume=volume
    audio.play();
}

function endSound(name)
{
    var audio = document.getElementById(name);
    audio.pause();
    audio.currentTime = 0;
}

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
// If actually clicked on object, check which object it is.
// If object is not yet shown, show it.
// Change to show the complete image when there object is clicked.
hidden_canvas.addEventListener("click", function(event) {
        if (!bgm_play) {
            playSound("bgm", 0.1);
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
            playSound("misclick", 0.6);
        } else {
            // Find closest ambystoma
            var closest_ambystoma = null;
            var min_dist = Number.MAX_SAFE_INTEGER;
            for (var i in all_ambystoma) {
                var ax = all_ambystoma[i].x;
                var ay = all_ambystoma[i].y;
                var dist = compute_dist(x,y,ax,ay);
                if (dist < min_dist) {
                    closest_ambystoma = all_ambystoma[i];
                    min_dist = dist;
                }
            }
            if (!found_ambystoma.includes(closest_ambystoma)) {
                found_ambystoma.push(closest_ambystoma);
                objectsToDraw.push(closest_ambystoma);
                console.log("Found ambystoma!")
                playSound("found");
                // Check if game finishes
                if (found_ambystoma.length == all_ambystoma.length) {
                    end();
                } else {
                    // Update display
                    draw();
                }
            } else {
                console.log("Found but duplicate!")
                playSound("duplicate");
            }
        }
    }
)