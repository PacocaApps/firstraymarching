const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Fullscreen quad geometry
const geometry = new THREE.PlaneGeometry(2, 2);

// Raymarching fragment shader
const material = new THREE.ShaderMaterial({
  uniforms: {
    iResolution: { value: new THREE.Vector3(window.innerWidth, window.innerHeight, 1) },
    iTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    uTime: { value: 0 }
  },
  fragmentShader: `
  uniform float uTime;
uniform vec2 uResolution;

    #define MAX_STEPS 100
    #define MAX_DIST 100.0
    #define SURFACE_DIST 0.0001
    
    float sdSphere(vec3 p, vec3 c, float r){
      return length(p - c) - r;
    }
    float sdSine(vec3 p){
    return sin(p.y * 1.0) * 0.5 + 0.5;
    }
          float world(vec3 p){
    float distance =  sdSine(p);
    float d2 = sdSphere(p, vec3(0.0,sin(uTime), 0.0), 0.5);
    float sphere1 = sdSphere(p, vec3(0.0,0.0,0.0), 1.0);
    float sphere2 = sdSphere(p, vec3(1.0*sin(uTime),0.0,0.0), 1.0);
    float m = max(sphere1, sphere2);
    float m1 = min(m, d2);
    return min(distance, m1);
    }

    
    vec3 computeNormals(vec3 p){
  float eps = 0.001;
  float dx = world(p + vec3(eps,0,0)) - world(p - vec3(eps,0,0));
  float dy = world(p + vec3(0,eps,0)) - world(p - vec3(0,eps,0));
  float dz = world(p + vec3(0,0,eps)) - world(p - vec3(0,0,eps));
  return normalize(vec3(dx, dy, dz));
}


 
   float raymarch(vec3 ro, vec3 rd){
    float dperc = 0.0;
    vec3 color = vec3(0.0);
    for(int i = 0; i < MAX_STEPS; i++){
      vec3 p = ro + rd*dperc;
      float dS = world(p);
      dperc += dS;
      if(dperc > MAX_DIST || dS < SURFACE_DIST) {
      break;
      }

    }
            return dperc;

   }


 vec3 lighting(vec3 p, vec3 n){
    vec3 lightPos = vec3(5.0, 5.0, 5.0);
    vec3 lightDir = normalize(lightPos - p);
    float diff = max(dot(n, lightDir), 0.0);
    vec3 color = vec3(diff,0,0);
    return color;
}

void main() {
  vec2 uv = gl_FragCoord.xy/uResolution.xy;
  uv -= 0.5;
  uv.x *= uResolution.x / uResolution.y;

  // Ray Origin - camera
  vec3 ro = vec3(0.0, 0.0, 5.0);
  // Ray Direction
  vec3 rd = normalize(vec3(uv, -1.0));
  // Raymarching
  float d = raymarch(ro, rd);
  vec3 p = ro + rd * d;

  vec3 color = vec3(0.0);

  if(d<MAX_DIST) {
    color = lighting(p, computeNormals(p));
  }

  gl_FragColor = vec4(color, 1.0);
}

  `
});

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

function animate(time) {
  material.uniforms.iTime.value = time * 0.001;
    material.uniforms.uTime.value = time * 0.001;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();