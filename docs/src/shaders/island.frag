// Enable extenstion to access dFdx(), dFdy()
#extension GL_OES_standard_derivatives : enable


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


varying float res_noise;
varying float distanceToOrigin;
varying float distanceToCamera;
varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec3 vViewPosition;

uniform vec3 backgroundColor;
uniform float islandRadius;
uniform float beachWidth;
uniform vec3 lightPos;
uniform vec3 cameraPos;


struct PointLight {
    vec3 position;
    vec3 color;
    float distance;
    float decay;

    int shadow;
    float shadowBias;
    float shadowRadius;
    vec2 shadowMapSize;
    float shadowCameraNear;
    float shadowCameraFar;
};

uniform PointLight pointLights[ NUM_POINT_LIGHTS ];

vec4 computeLighting(vec3 vViewPosition, vec3 newNormal) 
{
    float Kd;
    float Ka = 0.8;

    for (int l = 0; l < NUM_POINT_LIGHTS; l++) {
        // Will be used for attenuation.
        float lightDistance = length(pointLights[l].position -  vViewPosition);
        vec3 lightDirection = normalize(pointLights[l].position -  vViewPosition);

        // Calculate the dot product of the light vector and vertex normal. If the normal and light vector are
        // pointing in the same direction then it will get max illumination.
        Kd = max(dot(newNormal, lightDirection), 0.0);

        // Add attenuation.
        Kd = Kd * (1.0 / (1.0 + (0.25 * lightDistance * lightDistance)));
        //lightColor.rgb += clamp(dot(lightDirection, newNormal), 0.0, 1.0) * pointLights[l].color;
    }

    vec3 diffuseLighting = pointLights[0].color * Kd;
    vec3 ambientLighting = vec3(1., 1., 1.) * Ka;
    return vec4(ambientLighting + diffuseLighting, 1.0);
}

vec4 addVegetation(vec3 vWorldPosition, vec4 island_color, float noiseMult, float freqMult)
{
    float vegetationEnd= islandRadius - 0.7;
    float vegetationStart = islandRadius - beachWidth * 2.2;

    float greensNoise = noiseMult * 0.5 * snoise(70.0 * freqMult * vWorldPosition); //+ 
                        //noiseMult/ * snoise(150. * vWorldPosition);
    float greens_color_step = smoothstep(0.1, 0.9, greensNoise);
    vec4 greens1 = vec4(11.0/255.0, 56.0/255.0, 11.0/255.0, 1.0);
    vec4 greens2 = vec4(15.0/255.0, 63.0/255.0, 15.0/255.0, 1.0);
    vec4 greens_color = mix(greens1, greens2, greens_color_step);
    float greens_step = 1.0 - smoothstep(vegetationStart, vegetationEnd, distanceToOrigin);

    return mix(island_color, greens_color, greens_step);
}


void main() {

    float maxCameraDistanceToOrigin = 14.0;
    float cameraDistanceToOrigin = length(cameraPos);
    
    // Mapping the noise gain and frequency to the viewing distance
    float noiseMultiplier = maxCameraDistanceToOrigin - cameraDistanceToOrigin;
    float freqMultiplier = noiseMultiplier * 0.5;

    vec4 island_color;

    // Calculate new normal for each facet after displacement
    vec3 newNormal = normalize(cross( dFdx( vViewPosition ), dFdy( vViewPosition ) ));
    
    float islandEdge = smoothstep(islandRadius + beachWidth / 5.0, islandRadius - beachWidth / 5.0, distanceToOrigin);

    // Mountains
    vec4 mountain_color1 = vec4(93.0/255.0, 91.0/255.0, 86.0/255.0, 1.0);
    vec4 mountain_color2 = vec4(87.0/255.0, 85.0/255.0, 80.0/255.0, 1.0);
    float mountainNoise = noiseMultiplier * snoise(20.0 * noiseMultiplier * vWorldPosition);
    float color_step = smoothstep(0.1, 0.9, mountainNoise);
    island_color = mix(mountain_color1, mountain_color2, color_step);

    // Tree forrest      
    island_color = addVegetation(vWorldPosition, island_color, noiseMultiplier, freqMultiplier);

    // Beach
    vec4 sand1 = vec4(189.0/255.0, 183.0/255.0, 172.0/255.0, 1.0);
    vec4 sand2 = vec4(182./255., 172./255., 153./255., 1.0);
    float sandNoise = noiseMultiplier * 0.08 * snoise(freqMultiplier * 30.0 * vWorldPosition);
    color_step = smoothstep(0.1, 0.5, sandNoise);
    vec4 beach_color = mix(sand1, sand2, color_step);

    // Mountains to beach transition
    float mountainBeachEdge = smoothstep(islandRadius - beachWidth/ 2.5, islandRadius - beachWidth, distanceToOrigin);
    island_color = mix(beach_color, island_color, mountainBeachEdge);

    vec4 lighting = computeLighting(vViewPosition, newNormal);

    gl_FragColor = island_color * lighting;

}