function empty_func(blah) { return undefined; }

// Define image object class
export class image_object {
    constructor(source, zIndex, pos_x = 0, pos_y = 0, click_func = empty_func) {
        // Construct image object within
        this.image = new Image();
        this.image.src = source;
        this.image.crossOrigin = "anonymous";
        // zIndex for drawing order
        this.zIndex = zIndex;
        // optional position for click position
        this.pos_x = pos_x;
        this.pos_y = pos_y;
        // click function
        this.click_func = click_func;
        this.click_func_initial = click_func;
        // TODO: Refactor to remove this flag. Always use click_func
        this.rendered = false;
    }

    reset() {
        this.click_func = this.click_func_initial;
        this.rendered = false;
    }
}

// Function to draw objects with different layers
export function draw_objects(objectsToDraw, ctx) {
    objectsToDraw.sort(function(a, b) {
        return a.zIndex - b.zIndex;
    });
    // draw the objects in order
    for (var i = 0; i < objectsToDraw.length; i++) {
        ctx.drawImage(objectsToDraw[i].image, 0, 0);
    }
}

// Sound-related functions
export function playSound(audios) {
    endSound(audios);
    const randomIndex = Math.floor(Math.random() * audios.length);
    audios[randomIndex].play();
}

export function endSound(audios) {
    for (var i in audios) {
        if (!audios.paused) {
            audios[i].pause();
            audios[i].currentTime = 0
        }
    }
}

// Other simple helpers
// Note this is not distance, this is square of distance, but still works for relative distance comparison
export function compute_dist(x,y,ax,ay) {
    return Math.pow(x-ax,2) + Math.pow(y-ay,2);
}