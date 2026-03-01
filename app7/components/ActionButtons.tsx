import React from 'react';
import { DownloadIcon, TrashIcon } from './Icons';

interface ActionButtonsProps {
    onMerge: () => void;
    onClear: () => void;
    canMerge: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onMerge, onClear, canMerge }) => {
    return (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
                onClick={onClear}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-md shadow-sm hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-600 transition-colors"
            >
                <TrashIcon className="h-5 w-5" />
                ล้างข้อมูล
            </button>
            <button
                onClick={onMerge}
                disabled={!canMerge}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 text-sm font-medium text-white bg-orange-500 border border-transparent rounded-md shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
            >
                <DownloadIcon className="h-5 w-5" />
                รวมไฟล์และดาวน์โหลด (XLSX)
            </button>
        </div>
    );
};

export default ActionButtons;