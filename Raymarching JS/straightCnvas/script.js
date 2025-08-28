
var ctx;
var canvas;
window.addEventListener("load", setup);
let pixels = [];

function setup() {
 canvas = document.getElementById("myCanvas");
 ctx = canvas.getContext("2d");
for (let i = 0; i < canvas.width; i++) {
    pixels[i] = [];
    for (let j = 0; j < canvas.height; j++) {
        let pixel = new Pixel(i, j, "green");
        pixels[i][j] = pixel;
    }
}
draw();
}


function rect(x, y, w, h, color) {
    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

class Pixel {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
    }
    draw() {
        rect(this.x, this.y, 1, 1, this.color);
    }
    colorPixel(color) {
        this.color = color;
    }

}
// Vector Tools
function addv(p,c){
    return [p[0] + c[0], p[1] + c[1], p[2] + c[2]];
}
function subv(p,c){
    return [p[0] - c[0], p[1] - c[1], p[2] - c[2]];
}
function dotp(p,c){
    return p[0] * c[0] + p[1] * c[1] + p[2] * c[2];
}
function scalarmul(p,s){
    return [p[0] * s, p[1] * s, p[2] * s];
}


function normalize(p)
{
    let length = Math.sqrt(p[0]**2 + p[1]**2 + p[2]**2);
    if (length > 0) {
        return [p[0]/length, p[1]/length, p[2]/length];
    }
    return p;
}

function distancefromsphere(p,c,r){
     let dv = subv(p,c);
     return Math.sqrt(dotp(dv,dv)) - r;
}
function sdSine(p){
    let scale = 4.3;
    return  (Math.sin(p[0]*scale) + Math.sin(p[1]*scale) + Math.sin(p[2]*scale))/3.0;
}



function raymarching(ro,rd){
    var currentpos = [0, 0, 0];
    const NUMBER_OF_STEPS = 100;
    var total_distance_traveled = 0.0;
    const  MINIMUM_HIT_DISTANCE = 0.001;
    const  MAXIMUM_TRACE_DISTANCE = 200.0;
    const step_size = 0.1;
    for(i=0;i<NUMBER_OF_STEPS;i++){
        // Raymarching logic goes here
        //ro = rayorigin and rd = raydirection
        currentpos = addv(ro, scalarmul(rd, i*step_size));
        let distancetoclosest = world(currentpos);
        if(distancetoclosest < MINIMUM_HIT_DISTANCE) {

            let normal =  calculate_normals(currentpos);
            let lightpos = [0.0,400.0,-30.0]
            let directiontolight = normalize(subv(lightpos,currentpos));
            let diffuseintensity = Math.max(0,dotp(normal,directiontolight));
            let color = scalarmul([1,0,0], diffuseintensity*8);
            return `rgb(${Math.floor((color[0]) * 255)},${Math.floor((color[1]) * 255)},${Math.floor((color[2]) * 255)})`;
        }
        if(total_distance_traveled > MAXIMUM_TRACE_DISTANCE) {
            // Missed
            break;
        }
                total_distance_traveled += distancetoclosest;


    }
    return "rgb(0 0 0)";
}



function world(p) {
   sphere0 = distancefromsphere(p, [0, 0, 0], 10);
   displace = Math.sin(p[0]*3)*Math.sin(p[1]*3)*Math.sin(p[2]*3)*0.027;
   sphere1 = distancefromsphere(p, [1.0, 1.0, 0.02], 10);
   sinefield = sdSine(p)
   return Math.max(sphere0 + displace, sinefield);
}

function calculate_normals(p){
    const smallstepx = [0.001,0,0]
    const smallstepy = [0,0.001,0]
    const smallstepz = [0,0,0.001]
    let gradient_x = world(addv(p, smallstepx)) - world(subv(p, smallstepx));
    let gradient_y = world(addv(p, smallstepy)) - world(subv(p, smallstepy));
    let gradient_z = world(addv(p, smallstepz)) - world(subv(p, smallstepz));
//return normalized normal

    let normal = [gradient_x, gradient_y, gradient_z];
    let length = Math.sqrt(normal[0]**2 + normal[1]**2 + normal[2]**2);
    if (length > 0) {
        normal = [normal[0]/length, normal[1]/length, normal[2]/length];
    }
    return normal;
}


function draw() {
     var cameraposition = [0,0,-10.1];
     var ro = cameraposition;
     

    for (let i = 0; i < pixels.length; i++) {
        for (let j = 0; j < pixels[i].length; j++) {
            // Map pixel to viewport coordinates (centered at 0,0)
            let x = (i - canvas.width / 2);
            let y = (j - canvas.height / 2);
            let z = 0; // Image plane at z=0

            // Ray direction: from camera to pixel on image plane
            let rd = [x - ro[0], y - ro[1], z - ro[2]];

            // Normalize rd
            let len = Math.sqrt(rd[0]*rd[0] + rd[1]*rd[1] + rd[2]*rd[2]);
            rd = [rd[0]/len, rd[1]/len, rd[2]/len];

            pixels[i][j].colorPixel(raymarching(ro, rd));
            pixels[i][j].draw();
        }
    }
}
