import * as THREE from 'three';
import { useEffect } from 'react';

interface SelectiveOutlinesProps {
    model: THREE.Group;
    selectedPartName: string;
}

export function SelectiveOutlines({ model, selectedPartName }: SelectiveOutlinesProps) {
    useEffect(() => {
        if (!model) return;

        const meshesToOutline: THREE.Mesh[] = [];
        model.traverse((child) => {
            if (child instanceof THREE.Mesh && child.name === selectedPartName) {
                meshesToOutline.push(child);
            }
        });

        console.log(`🎯 Creating outlines for ${meshesToOutline.length} meshes:`, selectedPartName);

        meshesToOutline.forEach((mesh) => {
            const edges   = new THREE.EdgesGeometry(mesh.geometry as THREE.BufferGeometry);
            const outline = new THREE.LineSegments(
                edges,
                new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 2, depthTest: true }),
            );
            mesh.add(outline);
        });

        return () => {
            meshesToOutline.forEach((mesh) => {
                const toRemove: THREE.Object3D[] = [];
                mesh.children.forEach((child) => {
                    if (child instanceof THREE.LineSegments) toRemove.push(child);
                });
                toRemove.forEach((child) => {
                    mesh.remove(child);
                    if (child instanceof THREE.LineSegments) {
                        child.geometry.dispose();
                        (child.material as THREE.Material).dispose();
                    }
                });
            });
        };
    }, [model, selectedPartName]);

    return null;
}