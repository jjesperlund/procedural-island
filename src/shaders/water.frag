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

uniform float islandRadius;
uniform float beachWidth;

varying float noise;
varying vec3 vPosition;
varying vec3 vViewPosition;
varying vec3 vNormal;

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

vec4 computeLighting(vec3 vViewPosition, vec3 N) 
{
    float Kd;
    float Ka = 0.8;
    float Ks = 0.0;
    float specularShininess = 100.0;

    vec3 ambientColor = vec3(1., 1., 1.);
    vec3 diffuseColor = pointLights[0].color;
    vec3 specularColor = ambientColor;

    for (int l = 0; l < NUM_POINT_LIGHTS; l++) {
        // Will be used for attenuation.
        float lightDistance = length(pointLights[l].position -  vViewPosition);
        vec3 L = normalize(pointLights[l].position -  vViewPosition);

        // Calculate the dot product of the light vector and vertex normal. If the normal and light vector are
        // pointing in the same direction then it will get max illumination.
        Kd = max(dot(N, L), 0.0);

        // Add attenuation.
        Kd = Kd * (1.0 / (1.0 + (0.25 * lightDistance * lightDistance)));
        //lightColor.rgb += clamp(dot(L, N), 0.0, 1.0) * pointLights[l].color;

        //Specular
        if(Kd > 0.0) {
          vec3 R = reflect(-L, N);      // Reflected light vector
          vec3 V = normalize(-vViewPosition); // Vector to viewer
          // Compute the specular term
          float specAngle = max(dot(R, V), 0.0);
          Ks = pow(specAngle, specularShininess);
        }
    }

    //vec3 ambientLighting =  * Ka;
    //vec3 diffuseLighting =  * Kd;
    //return vec4(ambientLighting + diffuseLighting, 1.0);

    return vec4(Ka * ambientColor +
                Kd * diffuseColor +
                Ks * specularColor, 1.0);
}

void main() {

  /* --- Distance in xz-plane from position to plane origin ----------------------------------------- */
  vec2 position_xz = vPosition.xz;
  float distanceToOrigin = sqrt(dot(position_xz, position_xz));
  // Add noise to island radius to not make the island perfectly circular
  float freq = 0.4;
  float amplitude = 0.4;
  float radiusNoise = amplitude * snoise(freq * vec3(position_xz, 1.0));
  distanceToOrigin += radiusNoise;

  vec4 waterColor = vec4(0.0, 0.15 * noise, 0.3 * noise + 0.6, 1.0);
  vec4 shallowWaterColor = vec4(0.3 * noise + 0.3, 0.3 * noise + 0.5, 0.3 * noise + 1.0, 1.0);
  vec4 waterFoam = vec4(noise + 0.7, noise + 0.7, noise + 0.7, 1.0);

  // Deep water to shallow water transition
  float shallowBegin = islandRadius + beachWidth * 5.0;
  float deepToShallow = smoothstep(shallowBegin, islandRadius, distanceToOrigin);
  waterColor = mix(waterColor, shallowWaterColor, deepToShallow);

  // Water to foam transition
  //float distanceToIslandEdge = abs(islandRadius - distanceToOrigin);
  float waterToFoam = smoothstep(islandRadius + 0.07, islandRadius, distanceToOrigin);
  waterColor = mix(waterColor, waterFoam, waterToFoam);

  // Calculate new normal for each facet after displacement
  vec3 newNormal = normalize(cross( dFdx( vViewPosition ), dFdy( vViewPosition ) ));

  vec4 lighting = computeLighting(vViewPosition, newNormal);

  gl_FragColor = waterColor * lighting;

}