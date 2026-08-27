import * as THREE from 'three';
import { ConstructionMesh } from '@/screens/construction/type/editor/ThreeMesh';
import {MODEL_TO_BEAM_NAME_MAP} from "@/screens/construction/constants/beamConstants";
import {ModelDimensions} from "@/screens/construction/type/editor/Canvas3DAdvanced";

export function centerModel(model: THREE.Group): ModelDimensions {
    const box  = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    return { width: size.x, height: size.y, depth: size.z };
}

export async function loadGLBModel(
    fileUrl: string,
): Promise<{ model: THREE.Group; dimensions: ModelDimensions } | null> {
    try {
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');

        return new Promise((resolve, reject) => {
            const loader = new GLTFLoader();

            loader.load(
                fileUrl,
                (gltf) => {
                    const object = gltf.scene;

                    console.log('✅ GLB model loaded successfully:', fileUrl);
                    console.log('📦 Model children count:', object.children.length);

                    object.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            const newName = MODEL_TO_BEAM_NAME_MAP[child.name];
                            if (newName) {
                                console.log(`🔄 Renaming mesh: ${child.name} → ${newName}`);
                                child.name = newName;
                            }
                        }
                    });

                    resolve({ model: object, dimensions: centerModel(object) });
                },
                (progress) => {
                    console.log(
                        `📥 Loading: ${Math.round((progress.loaded / progress.total) * 100)}%`,
                    );
                },
                (error) => {
                    console.error('❌ Error loading GLB:', error);
                    reject(error);
                },
            );
        });
    } catch (error) {
        console.error('❌ Failed to load GLTFLoader or model:', error);
        return null;
    }
}

export function threeMeshToConstructionMesh(mesh: THREE.Mesh): ConstructionMesh {
    const geometry = mesh.geometry as THREE.BufferGeometry;
    return {
        name: mesh.name,
        geometry: {
            attributes: {
                position: { array: geometry.attributes.position.array as Float32Array },
            },
        },
        position:     { x: mesh.position.x, y: mesh.position.y, z: mesh.position.z },
        rotation:     { x: mesh.rotation.x, y: mesh.rotation.y, z: mesh.rotation.z },
        scale:        { x: mesh.scale.x,    y: mesh.scale.y,    z: mesh.scale.z },
        castShadow:   mesh.castShadow,
        receiveShadow: mesh.receiveShadow,
        visible:      mesh.visible,
        material: mesh.material
            ? {
                wireframe:  (mesh.material as THREE.MeshStandardMaterial).wireframe,
                color:      (mesh.material as THREE.MeshStandardMaterial).color,
                metalness:  (mesh.material as THREE.MeshStandardMaterial).metalness,
                roughness:  (mesh.material as THREE.MeshStandardMaterial).roughness,
                clone: () => (mesh.material as THREE.MeshStandardMaterial).clone(),
            }
            : undefined,
    };
}