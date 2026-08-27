export interface ProjectionBridge {
    project: (x: number, y: number, z?: number) => { x: number; y: number };
    size: { width: number; height: number };
}

export const projectionRef = { current: null as ProjectionBridge | null };