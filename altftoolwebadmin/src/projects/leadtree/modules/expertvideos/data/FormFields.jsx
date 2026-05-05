export const FormField = ({ field, register, errors }) => {
    const Icon = field.icon;

    return (
        <div className="flex flex-col gap-2 text-gray-700">
            {/* LABEL */}
            <label className="text-gray-600 font-semibold text-[13px] flex items-center gap-1">
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {field.label}
            </label>

            {/* INPUT TYPES */}
            {field.type === "select" ? (
                <div className="bg-white rounded-md p-2 flex justify-between border border-gray-300 text-gray-700">
                    <select
                        className="w-full bg-transparent outline-none"
                        {...register(field.name, field.rules)}
                    >
                        <option value="">Select</option>
                        {field.options?.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>

                    <ChevronDown className="h-5 w-5 text-gray-500" />
                </div>
            ) : field.type === "textarea" ? (
                <textarea placeholder={field.placeholder}
                    rows={field.rows || 4}
                    className="p-2 border border-gray-200 outline-none focus:ring-1 focus:ring-blue-400 text-gray-700 rounded-md text-[14px] placeholder:text-[14px] resize-none "
                    {...register(field.name, field.rules)}
                />

            ) :



                (
                    <input
                        placeholder={field.placeholder}
                        className="p-2 border border-gray-200 outline-none focus:ring-1 focus:ring-blue-400 text-gray-700 rounded-md text-[14px]  placeholder:text-[14px]"
                        {...register(field.name, field.rules)}
                    />

                )}

            {/* ERROR */}
            {errors[field.name] && (
                <span className="text-red-500 text-xs">
                    {errors[field.name].message}
                </span>
            )}
        </div>
    );
};