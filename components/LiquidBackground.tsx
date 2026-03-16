"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { useRef, useEffect } from "react"
import * as THREE from "three"

function LiquidPlane() {

  const mesh = useRef<any>(null)

  const mouse = useRef(new THREE.Vector2(0.5,0.5))

  useEffect(() => {

    const handleMouse = (e: MouseEvent) => {

      mouse.current.x = e.clientX / window.innerWidth
      mouse.current.y = 1 - e.clientY / window.innerHeight

    }

    window.addEventListener("mousemove", handleMouse)

    return () => window.removeEventListener("mousemove", handleMouse)

  }, [])

  useFrame(({ clock }) => {

    if (mesh.current) {

      mesh.current.material.uniforms.uTime.value =
        clock.getElapsedTime() * 0.25

      mesh.current.material.uniforms.uMouse.value =
        mouse.current

    }

  })

  return (

    <mesh ref={mesh} scale={[10,10,1]}>

      <planeGeometry args={[1,1,64,64]} />

      <shaderMaterial
        uniforms={{
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2(0.5,0.5) }
        }}

        vertexShader={`
          varying vec2 vUv;

          void main(){

            vUv = uv;

            gl_Position =
              projectionMatrix *
              modelViewMatrix *
              vec4(position,1.0);

          }
        `}

        fragmentShader={`

          uniform float uTime;
          uniform vec2 uMouse;

          varying vec2 vUv;

          void main(){

            vec2 uv = vUv;

            float wave =
              sin((uv.x + uTime) * 5.0) *
              cos((uv.y + uTime) * 5.0);

            float dist =
              distance(uv, uMouse);

            float intensity =
              wave * 0.4 + dist * 0.6;

            vec3 beige =
              vec3(0.96,0.93,0.88);

            vec3 rust =
              vec3(0.72,0.36,0.22);

            vec3 sage =
              vec3(0.42,0.50,0.41);

            vec3 color =
              mix(beige, rust, intensity);

            color =
              mix(color, sage, dist * 0.3);

            gl_FragColor =
              vec4(color,0.55);

          }

        `}
        transparent
      />

    </mesh>

  )

}

export default function LiquidBackground(){

  return(

    <div className="fixed inset-0 w-screen h-screen -z-10 opacity-70">

      <Canvas
        camera={{ position:[0,0,1] }}
        gl={{ antialias:true }}
      >

        <LiquidPlane />

      </Canvas>

    </div>

  )

}