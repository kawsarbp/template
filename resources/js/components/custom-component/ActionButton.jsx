const ActionButton = ({ icon: Icon, label }) => (
    <button className="flex w-full items-center justify-between rounded-lg bg-[#f1f8f9] p-3 text-sm font-bold text-gray-700 transition-colors hover:bg-[#e0f2f1]">
        <span>{label}</span>
        <div className="flex h-8 w-8 items-center justify-center rounded bg-[#dbeafe] text-blue-600">
            <Icon size={16} />
        </div>
    </button>
);

export default ActionButton;
