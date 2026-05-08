import { useState, useRef } from "react";
import { uploadImage } from "../api/api";

interface ImageItem {
  id: string;
  preview: string;
  url?: string;
  uploading: boolean;
  error?: string;
}

interface ImageUploadProps {
  onChange: (urls: string[]) => void;
  initialUrls?: string[];
  maxImages?: number;
}

const ImageUpload = ({ onChange, initialUrls, maxImages = 10 }: ImageUploadProps) => {
  const [items, setItems] = useState<ImageItem[]>(() =>
    (initialUrls ?? []).map((url) => ({
      id: crypto.randomUUID(),
      preview: url,
      url,
      uploading: false,
    })),
  );
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const notifyParent = (updated: ImageItem[]) => {
    onChange(updated.filter((i) => i.url).map((i) => i.url!));
  };

  const processFiles = (files: FileList | null) => {
    if (!files) return;

    const remaining = maxImages - items.length;
    const toProcess = Array.from(files).slice(0, remaining);

    toProcess.forEach((file) => {
      if (!file.type.startsWith("image/")) return;

      const id = crypto.randomUUID();
      const preview = URL.createObjectURL(file);

      const newItem: ImageItem = { id, preview, uploading: true };

      setItems((prev) => {
        const updated = [...prev, newItem];
        notifyParent(updated);
        return updated;
      });

      uploadImage(file)
        .then((url) => {
          setItems((prev) => {
            const updated = prev.map((i) =>
              i.id === id ? { ...i, url, uploading: false } : i,
            );
            notifyParent(updated);
            return updated;
          });
        })
        .catch(() => {
          setItems((prev) =>
            prev.map((i) =>
              i.id === id
                ? { ...i, uploading: false, error: "Upload failed" }
                : i,
            ),
          );
        });
    });
  };

  const remove = (id: string) => {
    setItems((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      notifyParent(updated);
      return updated;
    });
  };

  const canAddMore = items.length < maxImages;

  return (
    <div>
      <div className="grid grid-cols-4 gap-3">
        {items.map((item) => (
          <div key={item.id} className="relative group aspect-square">
            <img
              src={item.preview}
              alt=""
              className="w-full h-full object-cover rounded-lg border border-border"
            />
            {item.uploading && (
              <div className="absolute inset-0 bg-surface/70 rounded-lg flex items-center justify-center">
                <span className="text-xs text-ink-secondary">Uploading...</span>
              </div>
            )}
            {item.error && (
              <div className="absolute inset-0 bg-red-50/80 rounded-lg flex items-center justify-center">
                <span className="text-xs text-red-500">Failed</span>
              </div>
            )}
            {!item.uploading && (
              <button
                type="button"
                onClick={() => remove(item.id)}
                className="absolute top-1 right-1 w-5 h-5 bg-surface border border-border rounded-full text-xs text-ink-secondary opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer hover:bg-surface-alt"
              >
                ×
              </button>
            )}
          </div>
        ))}

        {canAddMore && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              processFiles(e.dataTransfer.files);
            }}
            className={`aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
              dragging
                ? "border-sage bg-sage/5"
                : "border-border hover:border-sage hover:bg-surface-alt"
            }`}
          >
            <span className="text-xl text-ink-muted">+</span>
            <span className="text-xs text-ink-muted">Add image</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => processFiles(e.target.files)}
      />
    </div>
  );
};

export default ImageUpload;
