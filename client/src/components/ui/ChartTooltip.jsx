const ChartTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl">
                <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2">{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                        <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-slate-600 dark:text-slate-400">
                            {entry.name === 'hours' ? 'Hours:' : `${entry.name}:`}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                            {entry.value} {entry.name === 'hours' ? 'hrs' : ''}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default ChartTooltip;
