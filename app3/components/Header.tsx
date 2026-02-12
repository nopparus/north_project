
import React from 'react';
import { MergeIcon } from './Icons';

const Header: React.FC = () => {
    return (
        <header className="text-center">
            <div className="flex items-center justify-center gap-4">
                <MergeIcon className="h-12 w-12 text-orange-400" />
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-100">
                    โปรแกรมรวมไฟล์ Excel และ CSV
                </h1>
            </div>
            <p className="mt-2 text-md text-slate-400">
                เลือกไฟล์ที่มีหัวตารางเหมือนกันเพื่อรวมข้อมูลเป็นไฟล์เดียว
            </p>
        </header>
    );
};

export default Header;
