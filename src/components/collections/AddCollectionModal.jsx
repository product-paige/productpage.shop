import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, ImageIcon, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AddCollectionModal({ open, onOpenChange, onCollectionAdded, editingCollection }) {
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState(editingCollection || {
    name: '',
    description: '',
    image_url: '',
  });

  React.useEffect(() => {
    if (editingCollection) {
      setFormData(editingCollection);
    } else {
      setFormData({
        name: '',
        description: '',
        image_url: '',
      });
    }
  }, [editingCollection, open]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, image_url: file_url }));
      toast.success('Image uploaded!');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Collection name is required');
      return;
    }

    setLoading(true);
    try {
      if (editingCollection) {
        await base44.entities.Collection.update(editingCollection.id, formData);
        toast.success('Collection updated!');
      } else {
        await base44.entities.Collection.create(formData);
        toast.success('Collection created!');
      }
      onCollectionAdded();
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to save collection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {editingCollection ? 'Edit Collection' : 'Create New Collection'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Image */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-stone-700">Cover Image (Optional)</Label>
            {formData.image_url ? (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-stone-100">
                <img 
                  src={formData.image_url} 
                  alt="Collection" 
                  className="w-full h-full object-cover"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/90 hover:bg-white"
                  onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-stone-200 rounded-lg cursor-pointer hover:bg-stone-50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {uploadingImage ? (
                  <Loader2 className="h-8 w-8 text-stone-400 animate-spin" />
                ) : (
                  <>
                    <ImageIcon className="h-8 w-8 text-stone-400 mb-2" />
                    <span className="text-sm text-stone-500">Click to upload image</span>
                  </>
                )}
              </label>
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-stone-700">Collection Name *</Label>
            <Input
              placeholder="e.g., Summer Essentials, Holiday Gifts"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="h-10 rounded-lg border-stone-200"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-stone-700">Description</Label>
            <Textarea
              placeholder="Describe this collection..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="min-h-[80px] rounded-lg border-stone-200 resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-11 rounded-lg border-stone-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 h-11 rounded-lg bg-black hover:bg-stone-900 text-white border-0"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : editingCollection ? (
                'Save Changes'
              ) : (
                'Create Collection'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}