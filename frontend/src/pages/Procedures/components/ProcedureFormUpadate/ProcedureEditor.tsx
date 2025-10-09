import React, { useState } from 'react';

import { X, ZoomIn, Download } from 'lucide-react';
import { proceduresAPI } from '../../../../services/api';
import { Procedure, ProcedureImage, ProcedureAttachment } from '../../../../types';
import ProcedureForm from './ProcedureForm';
import ProcedurePreview from './ProcedurePreview';
import toast from 'react-hot-toast';

interface ProcedureEditorProps {
  procedure?: Procedure | null;
  onSave: (procedure: Partial<Procedure>, pendingImages?: File[]) => void;
  onCancel: () => void;
}

// === Custom upload adapter for CKEditor 5 ===
class CustomUploadAdapter {
  loader: any;
  procedureId?: string;
  onPendingImage?: (file: File) => void;

  constructor(loader: any, procedureId?: string, onPendingImage?: (file: File) => void) {
    this.loader = loader;
    this.procedureId = procedureId;
    this.onPendingImage = onPendingImage;
  }

  upload() {
    return this.loader.file.then((file: File) => {
      return new Promise((resolve, reject) => {
        if (this.procedureId) {
          const formData = new FormData();
          formData.append('image', file);
          formData.append('procedure_id', this.procedureId);
          proceduresAPI.uploadImage(formData)
            .then(res => resolve({ default: res.data.image_url }))
            .catch(err => reject(err));
        } else {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({ default: reader.result });
            if (this.onPendingImage) this.onPendingImage(file);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        }
      });
    });
  }

  abort() {}
}

// Modal component for image display
const ImageModal: React.FC<{ imageUrl: string; alt: string; onClose: () => void }> = ({ imageUrl, alt, onClose }) => {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className="relative max-w-4xl max-h-full">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
        >
          <X className="w-8 h-8" />
        </button>
        <img
          src={imageUrl}
          alt={alt}
          className="max-w-full max-h-full object-contain rounded-lg"
        />
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
          <span className="text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
            {alt}
          </span>
          <a
            href={imageUrl}
            download
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger</span>
          </a>
        </div>
      </div>
    </div>
  );
};

const ProcedureEditor= ({ procedure, onSave, onCancel }:ProcedureEditorProps) => {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState(procedure?.title || '');
  const [description, setDescription] = useState(procedure?.description || '');
  const [content, setContent] = useState(procedure?.content || '');
  const [category, setCategory] = useState(procedure?.category || 'general');
  const [difficulty, setDifficulty] = useState(procedure?.difficulty || 'intermediate');
  const [estimatedTime, setEstimatedTime] = useState(procedure?.estimated_time || '');
  const [tags, setTags] = useState(procedure?.tags?.map(t => typeof t === 'string' ? t : t.name).join(', ') || '');
  const [status, setStatus] = useState(procedure?.status || 'draft');
  
  const [uploadedImages, setUploadedImages] = useState<ProcedureImage[]>(procedure?.images || []);
  const [uploadedAttachments, setUploadedAttachments] = useState<ProcedureAttachment[]>(procedure?.attachments || []);
  const [pendingImages, setPendingImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePendingImage = React.useCallback((file: File) => {
    setPendingImages(prev => [...prev, file]);
  }, []);

  const formatTags = (tagsString: string) => tagsString ? tagsString.split(',').map(t => t.trim()).filter(Boolean) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setIsSubmitting(true);
    try {
      const procedureData: Partial<Procedure> = {
        title, 
        description, 
        content, 
        category, 
        difficulty, 
        estimated_time: estimatedTime,
        status, 
        tags: formatTags(tags), 
        images_ids: uploadedImages.filter(i => !i.id.startsWith('temp-')).map(i => i.id)
      };
      onSave(procedureData, pendingImages);
    } catch (err) { 
      console.error(err); 
      toast.error('Erreur sauvegarde'); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const togglePreview = () => setIsPreviewMode(prev => !prev);

  const deleteImage = async (imageId: string) => {
    if (imageId.startsWith('temp-')) { 
      setUploadedImages(prev => prev.filter(i => i.id !== imageId)); 
      return; 
    }
    try { 
      await proceduresAPI.deleteImage(imageId); 
      setUploadedImages(prev => prev.filter(i => i.id !== imageId)); 
    } catch (err) { 
      console.error(err); 
      toast.error('Erreur suppression image'); 
    }
  };

  const deleteAttachment = async (attachmentId: string) => {
    try { 
      await proceduresAPI.deleteAttachment(attachmentId); 
      setUploadedAttachments(prev => prev.filter(a => a.id !== attachmentId)); 
    } catch (err) { 
      console.error(err); 
      toast.error('Erreur suppression fichier'); 
    }
  };

  const commonProps = {
    title,
    description,
    content,
    category,
    difficulty,
    estimatedTime,
    tags,
    status,
    uploadedImages,
    uploadedAttachments,
    formatTags,
    setSelectedImage
  };

  if (isPreviewMode) {
    return (
      <>
        <ProcedurePreview
          {...commonProps}
          onEdit={togglePreview}
        />
        {selectedImage && (
          <ImageModal 
            imageUrl={selectedImage} 
            alt="Image de la procédure" 
            onClose={() => setSelectedImage(null)} 
          />
        )}
      </>
    );
  }

  return (
    <>
      <ProcedureForm
        {...commonProps}
        procedure={procedure}
        isSubmitting={isSubmitting}
        pendingImages={pendingImages}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        onPreview={togglePreview}
        onTitleChange={setTitle}
        onDescriptionChange={setDescription}
        onContentChange={setContent}
        onCategoryChange={setCategory}
        onDifficultyChange={setDifficulty}
        onEstimatedTimeChange={setEstimatedTime}
        onTagsChange={setTags}
        onStatusChange={setStatus}
        onImagesChange={setUploadedImages}
        onAttachmentsChange={setUploadedAttachments}
        onPendingImagesChange={setPendingImages}
        onDeleteImage={deleteImage}
        onDeleteAttachment={deleteAttachment}
        onPendingImage={handlePendingImage}
        CustomUploadAdapter={CustomUploadAdapter}
      />
      {selectedImage && (
        <ImageModal 
          imageUrl={selectedImage} 
          alt="Image de la procédure" 
          onClose={() => setSelectedImage(null)} 
        />
      )}
    </>
  );
};

export default ProcedureEditor;