import React from 'react';

import { IDashboardWasteRow } from '@/screens/main/types/IDashboard';
import { Badge } from '@/ui/shadcn/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/shadcn/table';

interface WasteTableProps {
    rows: IDashboardWasteRow[];
}

/** Понад цю частку відходу рядок підсвічуємо — далі вже дорого. */
const WARN_PERCENT = 25;

const WasteTable: React.FC<WasteTableProps> = ({ rows }) => {
    if (!rows.length) {
        return <p className="text-sm text-muted-foreground">Розкрою ще не було.</p>;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Артикул</TableHead>
                    <TableHead className="text-right">Балок</TableHead>
                    <TableHead className="text-right">У діло, мп</TableHead>
                    <TableHead className="text-right">Відхід, мп</TableHead>
                    <TableHead className="text-right">Відхід</TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                {rows.map(row => (
                    <TableRow key={`${row.articleCode}|${row.color ?? ''}`}>
                        <TableCell>
                            <span className="block font-mono text-xs text-card-foreground">
                                {row.articleCode}
                            </span>
                            {row.color && (
                                <span className="block text-[11px] text-muted-foreground">
                                    {row.color}
                                </span>
                            )}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                            {row.beamsUsed}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                            {row.usedMeters}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                            {row.wasteMeters}
                        </TableCell>
                        <TableCell className="text-right">
                            <Badge variant={row.wastePercent >= WARN_PERCENT ? 'destructive' : 'secondary'}>
                                {row.wastePercent}%
                            </Badge>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default WasteTable;
