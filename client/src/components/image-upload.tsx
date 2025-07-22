import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImageUpload({ images, onImagesChange, maxImages = 5 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setUploading(true);
    
    try {
      // For demo purposes, we'll use placeholder URLs
      // In a real app, you would upload to a service like Uploadcare, Cloudinary, or AWS S3
      const newImageUrls = files.map((file, index) => {
        // Create object URL for preview (this is temporary and for demo only)
        return URL.createObjectURL(file);
      });

      const updatedImages = [...images, ...newImageUrls].slice(0, maxImages);
      onImagesChange(updatedImages);
    } catch (error) {
      console.error("Error uploading images:", error);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    onImagesChange(updatedImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div className="flex items-center gap-4">
        <label className="cursor-pointer">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading || images.length >= maxImages}
          />
          <Button 
            type="button" 
            variant="outline" 
            disabled={uploading || images.length >= maxImages}
            className="border-dashed border-2"
          >
            {uploading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Uploading...
              </>
            ) : (
              <>
                <i className="fas fa-cloud-upload-alt mr-2"></i>
                Upload Images
              </>
            )}
          </Button>
        </label>
        <span className="text-sm text-slate-600">
          {images.length}/{maxImages} images uploaded
        </span>
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {images.map((imageUrl, index) => (
            <Card key={index} className="relative group">
              <CardContent className="p-2">
                <img
                  src={imageUrl}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-24 object-cover rounded"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 p-0"
                  onClick={() => removeImage(index)}
                >
                  <i className="fas fa-times text-xs"></i>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Instructions */}
      {images.length === 0 && (
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
          <div className="text-slate-500 mb-4">
            <i className="fas fa-images text-4xl"></i>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Add photos of your room</h3>
          <p className="text-slate-600 mb-4">
            Upload up to {maxImages} high-quality photos to attract more potential roommates.
          </p>
          <p className="text-sm text-slate-500">
            Supported formats: JPG, PNG, WebP (Max 5MB each)
          </p>
        </div>
      )}
    </div>
  );
}
