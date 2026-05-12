import { ChevronDown } from "lucide-react";
import { useState } from "react";
import CategoryDropdown from "../../components/VideoModal";


export const FormField = ({ field, register, errors, watch, setValue }) => {
  const Icon = field.icon;
  const [openField, setOpenField] = useState(null);
  const value = watch(field.name);

  return (
    <div className="flex flex-col gap-2 text-gray-700 relative">
      {/* LABEL */}
      <label className="text-gray-600 font-semibold text-[14px] flex items-center gap-1">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {field.label}
      </label>

      {field.type === "category" ? (
        <>
          <input
            type="hidden"
            {...register(field.name, field.rules)}
            className="px-2 py-2.5 border border-gray-200 outline-none focus:ring-1 focus:ring-blue-400 text-gray-700 rounded-md text-[14px] placeholder:text-[14px]"
          />
          <CategoryDropdown
            value={value}
            onChange={(val) =>
              setValue(field.name, val, { shouldValidate: true })
            }
          />
        </>
      ) : field.type === "select" ? (
        <div className="relative">
          <input type="hidden" {...register(field.name, field.rules)} />
          <div
            onClick={() =>
              setOpenField(openField === field.name ? null : field.name)
            }
            className="bg-white rounded-md p-2 flex justify-between border border-gray-300 text-gray-700 cursor-pointer"
          >
            <span className={value ? "" : "text-gray-400"}>
              {value || "Select"}
            </span>
            <ChevronDown className="h-5 w-5 text-gray-500" />
          </div>

          {openField === field.name && (
            <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-md shadow-md mt-1 z-10">
              {field.options?.map((opt) => (
                <div
                  key={opt}
                  onClick={() => {
                    setValue(field.name, opt, { shouldValidate: true });
                    setOpenField(null);
                  }}
                  className="px-2 py-2.5 hover:bg-gray-100 cursor-pointer text-sm"
                >
                  {opt}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : field.type === "textarea" ? (
        <textarea
          placeholder={field.placeholder}
          rows={field.rows || 4}
          className="p-2 border border-gray-200 outline-none focus:ring-1 focus:ring-blue-400 text-gray-700 rounded-md text-[14px] placeholder:text-[14px] resize-none"
          {...register(field.name, field.rules)}
        />
      ) : field.type === "date" ? (
        <input
          type="date"
          className="px-2 py-2.5 border border-gray-200 outline-none focus:ring-1 focus:ring-blue-400 text-gray-700 rounded-md text-[14px]"
          {...register(field.name, field.rules)}
        />
      ) : (
        <input
          placeholder={field.placeholder}
          className="px-2 py-2.5 border border-gray-200 outline-none focus:ring-1 focus:ring-blue-400 text-gray-700 rounded-md text-[14px] placeholder:text-[14px]"
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
