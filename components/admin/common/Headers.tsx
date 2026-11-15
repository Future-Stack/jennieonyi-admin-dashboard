"use client"

import { Download, RefreshCw } from "lucide-react";

export default function Headers({
    title,
    description,
    buttonOneIcon= <Download className="w-4 h-4" />,
    buttonOneText= "Export",
    buttonOneAction,
    buttonOneDisabled = false,
    buttonTwoIcon= <RefreshCw className="w-4 h-4" />,
    buttonTwoText= "Refresh",
    buttonTwoAction,
    buttonTwoDisabled = false,
}: {
    title: string,
    description: string,
    buttonOneIcon: React.ReactNode,
    buttonOneText: string,
    buttonOneAction: () => void,
    buttonOneDisabled?: boolean,
    buttonTwoIcon: React.ReactNode,
    buttonTwoText: string,
    buttonTwoAction: () => void,
    buttonTwoDisabled?: boolean,
}) {
    return (
        <div className="flex flex-col gap-3 md:flex-row items-start md:items-center justify-between shrink-0 mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-[#1E1E1E]">{title}</h1>
          <p className="text-[14px] text-gray-500 mt-1">{description}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            disabled={buttonOneDisabled}
            onClick={buttonOneAction}
            type="button"
            className="flex items-center gap-2 rounded-[6px] border border-gray-200 bg-[#F3F4F6] px-4 py-[10px] text-[14px] font-medium text-gray-600 transition-colors hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {buttonOneIcon}
            {buttonOneText}
          </button>
          <button
            disabled={buttonTwoDisabled}
            onClick={buttonTwoAction}
            type="button"
            className="flex items-center gap-[6px] rounded-[6px] border border-[#D95C30] bg-[#D95C30] px-4 py-[10px] text-[14px] font-medium text-white transition-colors hover:bg-[#C24D25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {buttonTwoIcon}
            {buttonTwoText}
          </button>
        </div>
      </div>
    );
}