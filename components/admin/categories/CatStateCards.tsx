import { Store } from "lucide-react";

export interface ICatStateCards {
    title: string;
    data: string;
    icon: React.ReactNode;
    iconBgColor: string;
    valueColor?: string;
}

export default function CatStateCards({
    title,
    data,
    icon,
    iconBgColor,
    valueColor="text-black",
}: ICatStateCards) {
    return (
        <div className="bg-[#F0F1F3] rounded-[12px] p-5 border border-[#F0F1F3] flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <p className="text-[12px] text-gray-500 font-bold tracking-wider uppercase">{title}</p>
            <p className={`text-[26px] font-bold ${valueColor} leading-none`}>{data}</p>
          </div>
          <div className={`w-[36px] h-[36px] rounded-[8px] ${iconBgColor} flex items-center justify-center`}>
            {icon}
          </div>
        </div>
    );
}