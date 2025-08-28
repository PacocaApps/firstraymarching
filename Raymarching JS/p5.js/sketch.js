


var phi = 0.0;

var ctx;
var canvas;
let pixels = [];

function setup() {
createCanvas(150,150)
for (let i = 0; i < width; i++) {
    pixels[i] = [];
    for (let j = 0; j < height; j++) {
        let pixel = new Pixel(i, j, [0,255,0]);
        pixels[i][j] = pixel;
    }
}
}



class Pixel {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
    }
    draw() {
        fill(this.color[0], this.color[1], this.color[2]);
           noStroke();
        rect(this.x, this.y, 1, 1);
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


function normalizes(p)
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
    let scale = 4.3 ;
    return  (Math.sin(p[0]*scale) + Math.sin(p[1]*scale) + Math.sin(p[2]*scale))/3.0;
}



function raymarching(ro,rd){
    var currentpos = [0, 0, 0];
    const NUMBER_OF_STEPS = 30;
    var total_distance_traveled = 0.0;
    const  MINIMUM_HIT_DISTANCE = 0.01;
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
            let directiontolight = normalizes(subv(lightpos,currentpos));
            let diffuseintensity = Math.max(0,dotp(normal,directiontolight));
            let color = scalarmul([1,0,0], diffuseintensity*8);
            return [color[0]*255,color[1]*255,color[2]*255];
        }
        if(total_distance_traveled > MAXIMUM_TRACE_DISTANCE) {
            // Missed
            break;
        }
                total_distance_traveled += distancetoclosest;


    }
    return [0,0,0];
}



function world(p) {
   sphere0 = distancefromsphere(p, [0, 0, 0], 10);
   displace = Math.sin(p[0]*3)*Math.sin(p[1]*3)*Math.sin(p[2]*3)*0.027;
   sphere1 = distancefromsphere(p, [1.0, 1.0, 0.02], 10);
   sinefield = sdSine(p)
   return sphere0 + displace;
   //return Math.max(sphere0 + displace, sinefield);
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
 
     var cameraposition = [0,0,-11.1 + Math.abs(Math.sin(phi))];
     var ro = cameraposition;
     phi = phi + 0.1

    for (let i = 0; i < pixels.length; i++) {
        for (let j = 0; j < pixels[i].length; j++) {
            // Map pixel to viewport coordinates (centered at 0,0)
            let x = (i - width / 2);
            let y = (j - height / 2);
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
