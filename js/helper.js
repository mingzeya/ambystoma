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
        audios[i].pause();
        audios[i].currentTime = 0
    }
}


// Other simple helpers
// Note this is not distance, this is square of distance, but still works for relative distance comparison
export function compute_dist(x,y,ax,ay) {
    return Math.pow(x-ax,2) + Math.pow(y-ay,2);
}