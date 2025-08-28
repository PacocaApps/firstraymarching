 uniform vec3 iResolution;
    uniform float iTime;

    // Signed distance to a sphere at the origin
    float sphereSDF(vec3 p, float r) {
      return length(p) - r;
    }

    // Raymarching function
    float raymarch(vec3 ro, vec3 rd) {
      float t = 0.0;
      for(int i = 0; i < 64; i++) {
        vec3 p = ro + rd * t;
        float d = sphereSDF(p, 1.0);
        if(d < 0.001) return t;
        t += d;
        if(t > 100.0) break;
      }
      return -1.0;
    }

    // Calculate normal from SDF
    vec3 getNormal(vec3 p) {
      float eps = 0.001;
      float dx = sphereSDF(p + vec3(eps,0,0), 1.0) - sphereSDF(p - vec3(eps,0,0), 1.0);
      float dy = sphereSDF(p + vec3(0,eps,0), 1.0) - sphereSDF(p - vec3(0,eps,0), 1.0);
      float dz = sphereSDF(p + vec3(0,0,eps), 1.0) - sphereSDF(p - vec3(0,0,eps), 1.0);
      return normalize(vec3(dx, dy, dz));
    }

    void main() {
      vec2 uv = (gl_FragCoord.xy / iResolution.xy) * 2.0 - 1.0;
      uv.x *= iResolution.x / iResolution.y;

      // Camera setup
      vec3 ro = vec3(0.0, 0.0, 3.0); // Camera position
      vec3 rd = normalize(vec3(uv, -1.5)); // Ray direction

      float t = raymarch(ro, rd);

      vec3 color = vec3(0.0);
      if(t > 0.0) {
        vec3 p = ro + rd * t;
        vec3 normal = getNormal(p);
        vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
        float diff = max(dot(normal, lightDir), 0.0);
        color = vec3(1.0, 0.2, 0.2) * diff;
      }

      gl_FragColor = vec4(color, 1.0);
    }