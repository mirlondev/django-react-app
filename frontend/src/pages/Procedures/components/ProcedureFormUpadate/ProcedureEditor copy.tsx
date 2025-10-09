import React, { useState, useRef, useCallback } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { Upload, X, Save, BookOpen, Eye, Edit, Calendar, Tag, User, Paperclip, Trash2 } from 'lucide-react';
import { proceduresAPI } from '../../../../services/api';
import { Procedure, ProcedureImage, ProcedureAttachment } from '../../../../types';
import axios from 'axios';

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

const ProcedureEditor: React.FC<ProcedureEditorProps> = ({ procedure, onSave, onCancel }) => {
  const [title, setTitle] = useState(procedure?.title || '');
  const [description, setDescription] = useState(procedure?.description || '');
  const [content, setContent] = useState(procedure?.content || '');
  const [category, setCategory] = useState(procedure?.category || 'general');
  const [difficulty, setDifficulty] = useState(procedure?.difficulty || 'intermediate');
  const [estimatedTime, setEstimatedTime] = useState(procedure?.estimated_time || '');
  const [tags, setTags] = useState(procedure?.tags?.map(t => typeof t === 'string' ? t : t.name).join(', ') || '');
  const [status, setStatus] = useState(procedure?.status || 'draft');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const [uploadedImages, setUploadedImages] = useState<ProcedureImage[]>(procedure?.images || []);
  const [uploadedAttachments, setUploadedAttachments] = useState<ProcedureAttachment[]>(procedure?.attachments || []);
  const [pendingImages, setPendingImages] = useState<File[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<any>(null);

  const handlePendingImage = useCallback((file: File) => {
    setPendingImages(prev => [...prev, file]);
  }, []);

  const editorConfig = {
    toolbar: [
      'heading', '|', 'bold','italic','underline','strikethrough','code',
      '|','link','blockQuote','codeBlock','uploadImage','|',
      'bulletedList','numberedList','outdent','indent','|',
      'insertTable','undo','redo'
    ],
    image: { toolbar: ['imageStyle:inline','imageStyle:block','imageStyle:side','|','toggleImageCaption','imageTextAlternative'] },
    table: { contentToolbar: ['tableColumn','tableRow','mergeTableCells'] },
    placeholder: 'Rédigez le contenu détaillé de votre procédure...',
    language: 'fr'
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      await axios.post(`/api/upload/${procedure?.id}`, formData, { headers: {'Content-Type':'multipart/form-data'} });
      handlePendingImage(file);
    } catch (error) { console.error('Upload failed', error); }
  };

  const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !procedure?.id) { alert('Veuillez d\'abord sauvegarder la procédure'); return; }
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('procedure_id', procedure.id);
      formData.append('name', file.name);
      formData.append('file_type', file.type);
      formData.append('file_size', (file.size / 1024 / 1024).toFixed(2) + ' MB');
      const response = await proceduresAPI.uploadAttachment(formData);
      setUploadedAttachments(prev => [...prev, response.data]);
    } catch (error) { console.error(error); alert('Erreur lors du téléchargement'); }
    if (e.target) e.target.value = '';
  };

  const deleteImage = async (imageId: string) => {
    if (imageId.startsWith('temp-')) { setUploadedImages(prev => prev.filter(i => i.id !== imageId)); return; }
    try { await proceduresAPI.deleteImage(imageId); setUploadedImages(prev => prev.filter(i => i.id !== imageId)); }
    catch (err) { console.error(err); alert('Erreur suppression image'); }
  };

  const deleteAttachment = async (attachmentId: string) => {
    try { await proceduresAPI.deleteAttachment(attachmentId); setUploadedAttachments(prev => prev.filter(a => a.id !== attachmentId)); }
    catch (err) { console.error(err); alert('Erreur suppression fichier'); }
  };

  const formatTags = (tagsString: string) => tagsString ? tagsString.split(',').map(t => t.trim()).filter(Boolean) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true);
    try {
      const procedureData: Partial<Procedure> = {
        title, description, content, category, difficulty, estimated_time: estimatedTime,
        status, tags: formatTags(tags), images_ids: uploadedImages.filter(i=>!i.id.startsWith('temp-')).map(i=>i.id)
      };
      onSave(procedureData, pendingImages);
    } catch (err) { console.error(err); alert('Erreur sauvegarde'); }
    finally { setIsSubmitting(false); }
  };

  const togglePreview = () => setIsPreviewMode(prev => !prev);





  if (isPreviewMode) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Aperçu de la procédure
                </h2>
              </div>
              <button
                type="button"
                onClick={togglePreview}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Éditer</span>
              </button>
            </div>
          </div>
        </div>

        {/* Preview Content */}
        <div className="max-w-4xl mx-auto">
          <article className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                <Calendar className="w-4 h-4" />
                <span>{new Date().toLocaleDateString('fr-FR')}</span>
                <span>•</span>
                <User className="w-4 h-4" />
                <span>Auteur</span>
                {status === 'draft' && (
                  <>
                    <span>•</span>
                    <span className="text-orange-500 font-medium">Brouillon</span>
                  </>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {title || 'Titre de la procédure'}
              </h1>
              
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                {description || 'Description de la procédure'}
              </p>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="capitalize">Catégorie: {category}</span>
                <span className="capitalize">Difficulté: {difficulty}</span>
                <span>Temps estimé: {estimatedTime}</span>
              </div>
              
              {tags && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {formatTags(tags).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            {uploadedImages.length > 0 && (
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Images</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {uploadedImages.map((image) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.image_url}
                        alt={image.alt_text || 'Procedure image'}
                        className="w-full h-48 object-cover rounded-lg"
                        loading="lazy"
                      />
                      {image.caption && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{image.caption}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="p-6">
              <div className="prose prose-lg max-w-none dark:prose-invert ck-content">
                {content ? (
                  <div dangerouslySetInnerHTML={{ __html: content }} />
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    Le contenu de la procédure apparaîtra ici...
                  </p>
                )}
              </div>
            </div>
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {procedure ? 'Modifier la procédure' : 'Nouvelle procédure'}
              </h2>
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={togglePreview}
                disabled={!content.trim()}
                className="px-4 py-2 bg-blue-100 hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 text-blue-700 dark:bg-blue-900 dark:hover:bg-blue-800 dark:text-blue-300 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>Aperçu</span>
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                form="procedure-form"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Enregistrement...' : 'Enregistrer'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <form id="procedure-form" onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Titre *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Titre de la procédure"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                placeholder="Description courte de la procédure"
                required
              />
            </div>

            {/* Category and Difficulty Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Catégorie *
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="general">Général</option>
                  <option value="hardware">Hardware</option>
                  <option value="software">Software</option>
                  <option value="network">Réseau</option>
                  <option value="security">Sécurité</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Difficulté *
                </label>
                <select
                  id="difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="beginner">Débutant</option>
                  <option value="intermediate">Intermédiaire</option>
                  <option value="advanced">Avancé</option>
                </select>
              </div>
            </div>

            {/* Estimated Time */}
            <div>
              <label htmlFor="estimatedTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Temps estimé *
              </label>
              <input
                type="text"
                id="estimatedTime"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Ex: 2-4 heures"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contenu de la procédure *
              </label>
              <div 
                className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden min-h-[300px]"
              >
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden" style={{ minHeight: '400px' }}>
                <CKEditor
                  editor={ClassicEditor}
                  data={content}
                  config={editorConfig}
                  onReady={(editor) => {
                    editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) =>
                      new CustomUploadAdapter(loader, procedure?.id, handlePendingImage);
                    editorRef.current = editor;
                  }}
                  onChange={(event, editor) => setContent(editor.getData())}
                />
                </div>
              </div>

              <p className="mt-2 text-sm text-gray-500">
                Utilisez la barre d'outils pour formater votre contenu et ajouter des images, tableaux, etc.
              </p>
            </div>

            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Images supplémentaires
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors"
              >
                <Upload className="w-12 h-12 text-gray-400 mb-2" />
                <p className="text-gray-500 dark:text-gray-400">Cliquez pour ajouter des images</p>
                <p className="text-xs text-gray-400 mt-1">Ou utilisez l'outil d'insertion d'image dans l'éditeur</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  multiple
                />
              </div>

              {uploadedImages.length > 0 && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {uploadedImages.map((image) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.image_url}
                        alt={image.alt_text || 'Procedure image'}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => deleteImage(image.id)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {image.caption && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{image.caption}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Attachment Upload Section */}
            {procedure?.id && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pièces jointes
                </label>
                <div
                  onClick={() => attachmentInputRef.current?.click()}
                  className="w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors"
                >
                  <Paperclip className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">Cliquez pour ajouter des pièces jointes</p>
                  <input
                    ref={attachmentInputRef}
                    type="file"
                    onChange={handleAttachmentUpload}
                    className="hidden"
                  />
                </div>

                {uploadedAttachments.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {uploadedAttachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Paperclip className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{attachment.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{attachment.file_size}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteAttachment(attachment.id)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <input
                type="text"
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="hardware, software, réseau (séparés par des virgules)"
              />
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Statut
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
                <option value="archived">Archivé</option>
              </select>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Enregistrement...' : 'Enregistrer'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProcedureEditor;