import { useState, useRef } from "react";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { X, Upload, Plus, Image as ImageIcon, Loader2 } from "lucide-react";
import {
  useCategories,
  useCreateProduct,
  useUploadProductImage,
} from "@/modules/products/hooks/useManageProducts";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProductFormModal({ isOpen, onClose }: ProductFormModalProps) {
  const { data: categories = [], isLoading: catLoading } = useCategories();
  const createProduct = useCreateProduct();
  const uploadProductImage = useUploadProductImage();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brand, setBrand] = useState("Voltra");
  const [status, setStatus] = useState<"DRAFT" | "ACTIVE">("ACTIVE");
  const [altText, setAltText] = useState("");

  const [primaryFile, setPrimaryFile] = useState<File | null>(null);
  const [primaryPreview, setPrimaryPreview] = useState<string | null>(null);
  const [altFiles, setAltFiles] = useState<File[]>([]);
  const [altPreviews, setAltPreviews] = useState<string[]>([]);

  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const primaryInputRef = useRef<HTMLInputElement>(null);
  const altInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handlePrimaryFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPrimaryFile(file);
      setPrimaryPreview(URL.createObjectURL(file));
    }
  };

  const handleAltFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArr = Array.from(e.target.files);
      setAltFiles((prev) => [...prev, ...filesArr]);
      const previewsArr = filesArr.map((f) => URL.createObjectURL(f));
      setAltPreviews((prev) => [...prev, ...previewsArr]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name || !description || !basePrice || !categoryId) {
      setErrorMsg("Please fill out all required fields.");
      return;
    }

    if (name.trim().length < 2) {
      setErrorMsg("Product name must be at least 2 characters long.");
      return;
    }

    if (description.trim().length < 10) {
      setErrorMsg("Description must be at least 10 characters long.");
      return;
    }

    const priceNum = Number(basePrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorMsg("Please enter a valid positive base price.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create Product in DB
      const newProduct = await createProduct.mutateAsync({
        name: name.trim(),
        description: description.trim(),
        basePrice: priceNum,
        categoryId,
        brand: brand.trim() || "Voltra",
        status,
      });

      // 2. Upload Primary Image if selected
      if (primaryFile && newProduct?.id) {
        await uploadProductImage.mutateAsync({
          productId: newProduct.id,
          file: primaryFile,
          altText: altText || name,
          isPrimary: true,
        });
      }

      // 3. Upload Alt Images if selected
      if (altFiles.length > 0 && newProduct?.id) {
        for (const file of altFiles) {
          await uploadProductImage.mutateAsync({
            productId: newProduct.id,
            file,
            altText: `${name} gallery`,
            isPrimary: false,
          });
        }
      }

      // Reset and close
      onClose();
    } catch (err: any) {
      const data = err?.response?.data;
      if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        const details = data.errors.map((e: any) => `${e.field ? `${e.field}: ` : ''}${e.message}`).join(' | ');
        setErrorMsg(`Validation error: ${details}`);
      } else {
        setErrorMsg(data?.message || err.message || "Failed to create product");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-md">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-ink/10 bg-white p-6 shadow-2xl md:p-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink/10 pb-4">
          <div>
            <h2 className="font-display text-xl font-bold text-ink">Add New Product</h2>
            <p className="text-xs text-ink-soft">Create a new product listing and upload Cloudinary media.</p>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full bg-ink/5 text-ink-soft hover:bg-ink/10 hover:text-ink transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink">
                Product Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Voltra Cyber Headphones"
                className="h-11 w-full rounded-xl border border-ink/10 bg-white px-4 text-sm text-ink outline-none transition focus:border-neon focus:ring-2 focus:ring-neon/30"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink">
                Category <span className="text-rose-500">*</span>
              </label>
              <CustomSelect
                options={categories.map((c) => ({ value: c.id, label: c.name }))}
                value={categoryId}
                onChange={setCategoryId}
                placeholder="Select a category"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink">
                Base Price ($) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                placeholder="199.99"
                className="h-11 w-full rounded-xl border border-ink/10 bg-white px-4 text-sm text-ink outline-none transition focus:border-neon focus:ring-2 focus:ring-neon/30"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink">Brand</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Voltra"
                className="h-11 w-full rounded-xl border border-ink/10 bg-white px-4 text-sm text-ink outline-none transition focus:border-neon focus:ring-2 focus:ring-neon/30"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink">Listing Status</label>
              <CustomSelect
                options={[
                  { value: "ACTIVE", label: "ACTIVE" },
                  { value: "DRAFT", label: "DRAFT" },
                ]}
                value={status}
                onChange={(val) => setStatus(val as any)}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-ink">
                Description <span className="text-rose-500">*</span> <span className="text-[10px] font-normal text-ink-muted">(Supports ## Heading, **Bold**, * Bullets)</span>
              </label>

              <div className="flex items-center gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setDescription((prev) => `${prev}\n\n## HEADING NAME\n`)}
                  className="rounded-md bg-ink/5 px-2 py-0.5 font-semibold text-ink-soft hover:bg-neon/20 hover:text-ink transition"
                >
                  + Heading (##)
                </button>
                <button
                  type="button"
                  onClick={() => setDescription((prev) => `${prev} **bold text** `)}
                  className="rounded-md bg-ink/5 px-2 py-0.5 font-bold text-ink-soft hover:bg-neon/20 hover:text-ink transition"
                >
                  + Bold (**text**)
                </button>
                <button
                  type="button"
                  onClick={() => setDescription((prev) => `${prev}\n* Bullet feature item`)}
                  className="rounded-md bg-ink/5 px-2 py-0.5 font-medium text-ink-soft hover:bg-neon/20 hover:text-ink transition"
                >
                  + Bullet (*)
                </button>
              </div>
            </div>

            <textarea
              required
              rows={7}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={`## PRODUCT OVERVIEW\nEngineered for everyday performance, the **Voltra Vortex X1** combines a sleek design, vibrant display, and powerful processing.\n\n## KEY FEATURES\n* High-resolution immersive display\n* Fast and responsive octa-core processor\n* All-day battery with fast charging\n\n## IDEAL FOR\nEveryday communication, streaming, gaming, and productivity.`}
              className="w-full rounded-xl border border-ink/10 bg-white p-4 text-sm text-ink outline-none transition focus:border-neon focus:ring-2 focus:ring-neon/30 font-mono text-xs leading-relaxed"
            />
          </div>

          {/* Cloudinary Primary Image Upload */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink">
              Primary Product Image (Cloudinary)
            </label>
            <input
              ref={primaryInputRef}
              type="file"
              accept="image/*"
              onChange={handlePrimaryFileSelect}
              className="hidden"
            />
            {primaryPreview ? (
              <div className="relative inline-block overflow-hidden rounded-2xl border border-ink/10">
                <img src={primaryPreview} alt="Primary Preview" className="h-32 w-32 object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setPrimaryFile(null);
                    setPrimaryPreview(null);
                  }}
                  className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-ink text-white"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => primaryInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink/15 bg-ink/[0.02] p-6 text-center transition hover:border-neon hover:bg-white"
              >
                <Upload size={24} className="text-ink-muted mb-2" />
                <span className="text-xs font-semibold text-ink">Click to upload Primary Image</span>
                <span className="text-[10px] text-ink-muted mt-0.5">JPEG, PNG, WebP (Max 5MB)</span>
              </button>
            )}
          </div>

          {/* Alt / Gallery Images Upload */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink">
              Gallery & Alt Images (Cloudinary)
            </label>
            <input
              ref={altInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleAltFilesSelect}
              className="hidden"
            />
            <div className="flex flex-wrap items-center gap-3">
              {altPreviews.map((src, idx) => (
                <div key={idx} className="relative overflow-hidden rounded-xl border border-ink/10">
                  <img src={src} alt={`Alt ${idx}`} className="h-20 w-20 object-cover" />
                </div>
              ))}
              <button
                type="button"
                onClick={() => altInputRef.current?.click()}
                className="flex h-20 w-20 flex-col items-center justify-center rounded-xl border-2 border-dashed border-ink/15 bg-ink/[0.02] text-ink-soft transition hover:border-neon hover:bg-white"
              >
                <Plus size={18} />
                <span className="text-[10px] font-semibold">Add Alt</span>
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="rounded-xl bg-rose-500/10 p-3 text-xs font-semibold text-rose-700">
              {errorMsg}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-ink/10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-ink/10 px-5 py-2.5 text-xs font-semibold text-ink-soft transition hover:bg-ink/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-neon inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Creating & Uploading...
                </>
              ) : (
                "Save & Publish Product"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
