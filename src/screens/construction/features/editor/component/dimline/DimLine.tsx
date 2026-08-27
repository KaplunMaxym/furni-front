interface DimLineProps {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    label: string;
    vertical?: boolean;
    tickFromY1?: number;
    tickFromY2?: number;
    tickFromX1?: number;
    tickFromX2?: number;
    color: string;
    markerId: string;
    markerIdR: string;
}

export function DimLine({x1, y1, x2, y2, label, vertical = false, tickFromY1, tickFromY2, tickFromX1, tickFromX2, color, markerId, markerIdR}: DimLineProps) {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const tickLen = 7;

    return (
        <g>
            {!vertical && tickFromY1 !== undefined && (
                <>
                    <line x1={x1} y1={tickFromY1} x2={x1} y2={y1} stroke={color} strokeWidth={1} strokeDasharray="3,3"
                          opacity={0.4}/>
                    <line x1={x2} y1={tickFromY2} x2={x2} y2={y2} stroke={color} strokeWidth={1} strokeDasharray="3,3"
                          opacity={0.4}/>
                </>
            )}
            {vertical && tickFromX1 !== undefined && (
                <>
                    <line x1={tickFromX1} y1={y1} x2={x1} y2={y1} stroke={color} strokeWidth={1} strokeDasharray="3,3"
                          opacity={0.4}/>
                    <line x1={tickFromX2} y1={y2} x2={x2} y2={y2} stroke={color} strokeWidth={1} strokeDasharray="3,3"
                          opacity={0.4}/>
                </>
            )}

            <line
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={color} strokeWidth={1.5}
                markerStart={`url(#${markerIdR})`}
                markerEnd={`url(#${markerId})`}
            />

            {!vertical ? (
                <>
                    <line x1={x1} y1={y1 - tickLen} x2={x1} y2={y1 + tickLen} stroke={color} strokeWidth={1.5}/>
                    <line x1={x2} y1={y2 - tickLen} x2={x2} y2={y2 + tickLen} stroke={color} strokeWidth={1.5}/>
                </>
            ) : (
                <>
                    <line x1={x1 - tickLen} y1={y1} x2={x1 + tickLen} y2={y1} stroke={color} strokeWidth={1.5}/>
                    <line x1={x2 - tickLen} y1={y2} x2={x2 + tickLen} y2={y2} stroke={color} strokeWidth={1.5}/>
                </>
            )}

            <rect x={mx - 30} y={my - 11} width={60} height={20} rx={4} fill="rgba(10,15,30,0.88)"/>
            <text
                x={mx} y={my + 4}
                textAnchor="middle"
                fill={color}
                fontSize={11}
                fontFamily="monospace"
                fontWeight="700"
            >
                {label}
            </text>
        </g>
    );
}