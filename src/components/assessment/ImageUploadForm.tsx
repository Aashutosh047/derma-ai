import { useCallback } from "react";
import { motion } from "framer-motion";
import { X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UploadedImage } from "@/types/assessment";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadFormProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
}

export function ImageUploadForm({ images, onChange }: ImageUploadFormProps) {
  const { toast } = useToast();
  const existingImage = images[0];

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (JPG, PNG, etc.)",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 10MB",
          variant: "destructive",
        });
        return;
      }

      const preview = URL.createObjectURL(file);
      const newImage: UploadedImage = {
        id: `image-${Date.now()}`,
        file,
        preview,
        label: "scalp_closeup",
      };

      // Clean up old preview URL if exists
      if (existingImage) {
        URL.revokeObjectURL(existingImage.preview);
      }

      onChange([newImage]);
    },
    [existingImage, onChange, toast]
  );

  const removeImage = useCallback(() => {
    if (existingImage) {
      URL.revokeObjectURL(existingImage.preview);
    }
    onChange([]);
  }, [existingImage, onChange]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-foreground mb-2">Upload Image</h3>
        <p className="text-muted-foreground">
          Upload a photo of your hair and scalp for visual assessment
        </p>
      </div>

      <div className="bg-secondary/30 rounded-xl p-4 mb-6">
        <p className="text-sm text-muted-foreground">
          <strong>Tips for best results:</strong> Take photos in good lighting, ensure the area is 
          clearly visible, and keep images in focus.
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <Label className="text-sm font-medium mb-2 block">Hair/Scalp Image</Label>
        <div
          className={`relative border-2 border-dashed rounded-xl transition-all duration-200 ${
            existingImage
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-secondary/30"
          }`}
        >
          {existingImage ? (
            <div className="relative aspect-video">
              <img
                src={existingImage.preview}
                alt="Hair and scalp"
                className="w-full h-full object-cover rounded-xl"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 w-8 h-8"
                onClick={removeImage}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center aspect-video cursor-pointer p-8">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <span className="text-base font-medium">Click to upload image</span>
                <span className="text-sm">JPG, PNG up to 10MB</span>
              </div>
            </label>
          )}
        </div>
      </div>

      {existingImage && (
        <div className="text-center text-sm text-muted-foreground">
          Image uploaded successfully ✓
        </div>
      )}
    </motion.div>
  );
}