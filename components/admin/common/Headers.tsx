"use client"

import { Download, RefreshCw } from "lucide-react";

export default function Headers({
    title,
    description,
    buttonOneIcon= <Download className="w-4 h-4" />,
    buttonOneText= "Export",
    buttonOneAction,
    buttonTwoIcon= <RefreshCw className="w-4 h-4" />,
    buttonTwoText= "Refresh",
    buttonTwoAction
}: {
    title: string,
    description: string,
    buttonOneIcon: React.ReactNode,
    buttonOneText: string,
    buttonOneAction: () => void,
    buttonTwoIcon: React.ReactNode,
    buttonTwoText: string,
    buttonTwoAction: () => void,
}) {
    return (
        <div className="flex flex-col gap-3 md:flex-row items-start md:items-center justify-between shrink-0 mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-[#1E1E1E]">{title}</h1>
          <p className="text-[14px] text-gray-500 mt-1">{description}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={buttonOneAction} className="cursor-pointer flex items-center gap-2 bg-[#F3F4F6] border border-gray-200 px-4 py-[10px] rounded-[6px] text-gray-600 text-[14px] font-medium hover:bg-gray-200 transition-colors">
            {buttonOneIcon}
            {buttonOneText}
          </button>
          <button onClick={buttonTwoAction} className="cursor-pointer flex items-center gap-[6px] bg-[#D95C30] border border-[#D95C30] px-4 py-[10px] rounded-[6px] text-white text-[14px] font-medium hover:bg-[#C24D25] transition-colors">
            {buttonTwoIcon}
            {buttonTwoText}
          </button>
        </div>
      </div>
    );
}