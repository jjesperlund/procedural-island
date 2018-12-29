vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
     return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v)
  { 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //   x0 = x0 - 0.0 + 0.0 * C.xxx;
  //   x1 = x0 - i1  + 1.0 * C.xxx;
  //   x2 = x0 - i2  + 2.0 * C.xxx;
  //   x3 = x0 - 1.0 + 3.0 * C.xxx;
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

// Permutations
  i = mod289(i); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients: 7x7 points over a square, mapped onto an octahedron.
// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
  }

    uniform float scale;
    uniform float displacement;
    uniform float time;
    uniform float islandRadius;
    uniform float beachWidth;
    uniform vec3 cameraPos;

    varying float res_noise;
    varying float distanceToOrigin;
    varying float distanceToCamera;
    varying vec3 vWorldPosition;
    varying vec3 vViewPosition;
    varying vec3 vNormal;
    

  void main() {

    vNormal = normal;

    // Only displace in positive y direction
    if (vNormal.y < 0.0) vNormal.y *= -1.0;

    distanceToCamera = length(cameraPos - vWorldPosition); 

    /* --- Noise parameters ----------------------------------------- */
      // Properties
      const int octaves = 4;
      float freq_multiplier = 2.0;
      float noise_gain = 0.5;

      // Initial values
      float amplitude = 0.35;
      //float frequency = (15.0 - distanceToCamera) / 20.0 + 0.6;
      float frequency = 0.5;
  
      // Loop octaves and calculate summed simplex noise
      for (int i = 0; i < octaves; i++) {
          res_noise += amplitude * snoise(frequency * position);
          frequency *= freq_multiplier;
          amplitude *= noise_gain;
      }
      res_noise += 0.5;

      vWorldPosition.x = position.x;
      vWorldPosition.y = position.y + vNormal.y * res_noise;
      vWorldPosition.z = position.z;      

      /* --- Distance in xz-plane from position to plane origin ----------------------------------------- */
      vec2 position_xz = position.xz;
      distanceToOrigin = sqrt(dot(position_xz, position_xz));
      // Add noise to island radius to not make the island perfectly circular
      float freq = 0.4;
      amplitude = 0.4;
      float radiusNoise = amplitude * snoise(freq * vec3(position_xz, 1.0));
      distanceToOrigin += radiusNoise;

      float mountainsDecayStart = beachWidth * 7.0;
      float vegetationEnd= islandRadius - 0.6;
      float vegetationStart = islandRadius - beachWidth * 2.1;

      // Trees      
      float ttt_noise = 0.4 * snoise(25.5 * (position));
      ttt_noise *= 1.0 - smoothstep(vegetationStart, vegetationEnd, distanceToOrigin);
      vWorldPosition.y += step(0.2, ttt_noise);

      // Smoothstep mountains to decay as the distance from origin increases
      vWorldPosition.y *= smoothstep(islandRadius - mountainsDecayStart/ 15.0, islandRadius - mountainsDecayStart, distanceToOrigin);

      // Step vegetation to beach transition
      vWorldPosition.y *= step(0.2, islandRadius - distanceToOrigin);


      // Beach elevation decay to ocean
      vWorldPosition.y += 0.07; 
      vWorldPosition.y *= smoothstep(islandRadius + 0.05, islandRadius - beachWidth, distanceToOrigin);

      //Transform vertex into eye space
      vViewPosition = vec3(modelViewMatrix * vec4( vWorldPosition, 1.0 )); 
      //Transform vertex normal into eye space
      vNormal = vec3(modelViewMatrix * vec4(vNormal, 0.0));

      //vNormal = normalMatrix * vNormal; //normalMatrix is worldToObject


      gl_Position = projectionMatrix * modelViewMatrix * vec4(vWorldPosition, 1.0);
    }