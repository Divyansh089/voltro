import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, Loader2, Tag, X } from "lucide-react";
import {
  useProductOptions,
  useCreateOption,
  useDeleteOption,
  useCreateOptionValue,
  useDeleteOptionValue,
} from "@/modules/products/hooks/useProductOptions";

interface Props {
  productId: string;
  productBasePrice: number;
}

const SUGGESTED_OPTIONS = ["Color", "RAM", "Storage", "Size", "Connectivity"];

export function ProductOptionsPanel({ productId, productBasePrice }: Props) {
  const { data: options = [], isLoading } = useProductOptions(productId);
  const createOption = useCreateOption(productId);
  const deleteOption = useDeleteOption(productId);
  const createValue = useCreateOptionValue(productId);
  const deleteValue = useDeleteOptionValue(productId);

  const [expandedOptionId, setExpandedOptionId] = useState<string | null>(null);
  const [newOptionName, setNewOptionName] = useState("");
  const [showOptionInput, setShowOptionInput] = useState(false);

  // Per-option new value state
  const [newValueInputs, setNewValueInputs] = useState<
    Record<string, { value: string; priceDelta: string }>
  >({});

  const handleAddOption = async () => {
    if (!newOptionName.trim()) return;
    await createOption.mutateAsync({ name: newOptionName.trim() });
    setNewOptionName("");
    setShowOptionInput(false);
  };

  const handleAddValue = async (optionId: string) => {
    const input = newValueInputs[optionId];
    if (!input?.value?.trim()) return;
    await createValue.mutateAsync({
      optionId,
      value: input.value.trim(),
      priceDelta: parseFloat(input.priceDelta || "0") || 0,
    });
    setNewValueInputs((prev) => ({ ...prev, [optionId]: { value: "", priceDelta: "" } }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-6 text-ink-soft text-sm">
        <Loader2 size={14} className="animate-spin" /> Loading options...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-ink">Variant Options</h3>
          <p className="text-xs text-ink-soft">Define the dimensions that make each variant unique (e.g. Color, RAM)</p>
        </div>
        {!showOptionInput && (
          <button
            onClick={() => setShowOptionInput(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-neon/10 px-3 py-1.5 text-xs font-semibold text-ink hover:bg-neon/20 transition"
          >
            <Plus size={12} /> Add Option
          </button>
        )}
      </div>

      {/* Add option input */}
      {showOptionInput && (
        <div className="rounded-xl border border-dashed border-neon/40 bg-neon/5 p-4">
          <p className="mb-2 text-xs font-semibold text-ink">Option Name</p>
          <div className="flex gap-2 flex-wrap mb-2">
            {SUGGESTED_OPTIONS.filter(
              (s) => !options.some((o) => o.name.toLowerCase() === s.toLowerCase())
            ).map((s) => (
              <button
                key={s}
                onClick={() => setNewOptionName(s)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  newOptionName === s
                    ? "border-neon bg-neon text-ink"
                    : "border-ink/15 text-ink-soft hover:border-neon hover:text-ink"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newOptionName}
              onChange={(e) => setNewOptionName(e.target.value)}
              placeholder="or type custom name..."
              className="h-9 flex-1 rounded-xl border border-ink/10 bg-white px-3 text-sm text-ink outline-none focus:border-neon focus:ring-2 focus:ring-neon/20"
              onKeyDown={(e) => e.key === "Enter" && handleAddOption()}
            />
            <button
              onClick={handleAddOption}
              disabled={createOption.isPending || !newOptionName.trim()}
              className="h-9 rounded-xl bg-ink px-4 text-xs font-semibold text-white hover:bg-ink/80 disabled:opacity-50 transition"
            >
              {createOption.isPending ? <Loader2 size={12} className="animate-spin" /> : "Add"}
            </button>
            <button
              onClick={() => { setShowOptionInput(false); setNewOptionName(""); }}
              className="h-9 rounded-xl border border-ink/10 px-3 text-xs text-ink-soft hover:bg-ink/5 transition"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Existing options */}
      {options.length === 0 && !showOptionInput && (
        <div className="rounded-xl border border-dashed border-ink/15 py-8 text-center">
          <Tag size={24} className="mx-auto mb-2 text-ink-muted" />
          <p className="text-sm font-semibold text-ink">No options yet</p>
          <p className="text-xs text-ink-soft mt-1">Add options like Color, RAM, Storage to create variants</p>
        </div>
      )}

      {options.map((option) => {
        const isExpanded = expandedOptionId === option.id;
        const valueInput = newValueInputs[option.id] || { value: "", priceDelta: "" };

        return (
          <div key={option.id} className="overflow-hidden rounded-xl border border-ink/10 bg-white">
            {/* Option header */}
            <div
              className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-ink/[0.02] transition"
              onClick={() => setExpandedOptionId(isExpanded ? null : option.id)}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-ink">{option.name}</span>
                <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[10px] text-ink-soft font-medium">
                  {option.values.length} values
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete option "${option.name}" and all its values?`)) {
                      deleteOption.mutate(option.id);
                    }
                  }}
                  className="rounded-lg p-1 text-rose-400 hover:bg-rose-50 transition"
                >
                  <Trash2 size={13} />
                </button>
                {isExpanded ? <ChevronUp size={14} className="text-ink-soft" /> : <ChevronDown size={14} className="text-ink-soft" />}
              </div>
            </div>

            {/* Values list */}
            {isExpanded && (
              <div className="border-t border-ink/5 px-4 pb-4 pt-3 space-y-2">
                {option.values.map((val) => (
                  <div
                    key={val.id}
                    className="flex items-center justify-between rounded-lg bg-ink/[0.02] px-3 py-2"
                  >
                    <span className="text-sm text-ink font-medium">{val.value}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-ink-soft">
                        {Number(val.priceDelta) === 0
                          ? "Included"
                          : `+$${Number(val.priceDelta).toFixed(2)}`}
                      </span>
                      <span className="text-[10px] text-ink-muted">
                        = ${(productBasePrice + Number(val.priceDelta)).toFixed(2)}
                      </span>
                      <button
                        onClick={() => {
                          if (confirm(`Remove value "${val.value}"?`))
                            deleteValue.mutate({ optionId: option.id, valueId: val.id });
                        }}
                        className="text-rose-400 hover:text-rose-600 transition"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add new value */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder={`New ${option.name} value...`}
                    value={valueInput.value}
                    onChange={(e) =>
                      setNewValueInputs((prev) => ({
                        ...prev,
                        [option.id]: { ...valueInput, value: e.target.value },
                      }))
                    }
                    className="h-9 flex-1 rounded-xl border border-ink/10 bg-white px-3 text-sm text-ink outline-none focus:border-neon focus:ring-2 focus:ring-neon/20"
                  />
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ink-muted">+$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0"
                      value={valueInput.priceDelta}
                      onChange={(e) =>
                        setNewValueInputs((prev) => ({
                          ...prev,
                          [option.id]: { ...valueInput, priceDelta: e.target.value },
                        }))
                      }
                      className="h-9 w-24 rounded-xl border border-ink/10 bg-white pl-7 pr-2 text-sm text-ink outline-none focus:border-neon focus:ring-2 focus:ring-neon/20"
                    />
                  </div>
                  <button
                    onClick={() => handleAddValue(option.id)}
                    disabled={createValue.isPending || !valueInput.value.trim()}
                    className="h-9 rounded-xl bg-ink px-4 text-xs font-semibold text-white hover:bg-ink/80 disabled:opacity-50 transition"
                  >
                    {createValue.isPending ? <Loader2 size={12} className="animate-spin" /> : "Add"}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
