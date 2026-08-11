export default function AnalyticStateCard({title,value,change,isError,positive}:{
    title:string,
    value:string,
    change:string,
    isError:boolean,
    positive:boolean
}) {
    return (
        <div className="bg-[#F0F1F3] rounded-[8px] p-5 h-35 shadow border border-[#F0F1F3] flex justify-between items-start">
              <div className="flex flex-col justify-between h-full">
                <p className="text-[14px] text-gray-500 font-medium">{title}</p>
                <p className="text-[28px] font-bold text-gray-900 leading-none">{value}</p>
                <p className={`text-[12px] font-medium ${isError ? "text-[#E11D48]" : "text-[#3BB515]"}`}>
                  {positive ? "↗ " : "↘ "}{change}
                </p>
              </div>
            </div>
    );
}