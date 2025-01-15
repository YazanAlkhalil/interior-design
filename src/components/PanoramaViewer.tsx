import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { Mesh } from 'three'

interface PanoramaViewerProps {
  imageUrl: string
}

export const PanoramaViewer = ({ imageUrl }: PanoramaViewerProps) => {
  const mesh = useRef<Mesh>(null)
  const texture = useTexture(imageUrl)

  useFrame(() => {
    if (mesh.current) {
      // Optional: Add subtle automatic rotation
      mesh.current.rotation.y += 0.0005
    }
  })

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial map={texture} side={2} /> {/* side: 2 is THREE.BackSide */}
    </mesh>
  )
} 