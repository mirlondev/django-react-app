import React, { useRef } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import {
  Upload,
  Save,
  BookOpen,
  Eye,
  Calendar,
  Tag,
  User,
  Paperclip,
  Trash2,
} from "lucide-react";
import { proceduresAPI } from "../../../../services/api";
import {
  Procedure,
  ProcedureImage,
  ProcedureAttachment,
} from "../../../../types";
// import CustomEditor from '../../../../utils/CustomEditor'; // toujours commenté
import Font from "@ckeditor/ckeditor5-font/src/font";
import Button from "../../../../components/ui/Button";
import toast from "react-hot-toast";

interface ProcedureFormProps {
  procedure?: Procedure | null;
  title: string;
  description: string;
  content: string;
  category: string;
  difficulty: string;
  estimatedTime: string;
  tags: string;
  status: string;
  uploadedImages: ProcedureImage[];
  uploadedAttachments: ProcedureAttachment[];
  pendingImages: File[];
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onPreview: () => void;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onDifficultyChange: (value: string) => void;
  onEstimatedTimeChange: (value: string) => void;
  onTagsChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onImagesChange: (images: ProcedureImage[]) => void;
  onAttachmentsChange: (attachments: ProcedureAttachment[]) => void;
  onPendingImagesChange: (images: File[]) => void;
  onDeleteImage: (imageId: string) => void;
  onDeleteAttachment: (attachmentId: string) => void;
  onPendingImage: (file: File) => void;
  CustomUploadAdapter: any;
}

const ProcedureForm = ({
  procedure,
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
  isSubmitting,
  onSubmit,
  onCancel,
  onPreview,
  onTitleChange,
  onDescriptionChange,
  onContentChange,
  onCategoryChange,
  onDifficultyChange,
  onEstimatedTimeChange,
  onTagsChange,
  onStatusChange,
  onImagesChange,
  onAttachmentsChange,
  onDeleteImage,
  onDeleteAttachment,
  onPendingImage,
  CustomUploadAdapter,
}: ProcedureFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<any>(null);

  const editorConfiguration = {
    toolbar: {
      items: [
        "heading",
        "|",
        "bold",
        "italic",
        "|",
        "bulletedList",
        "numberedList",
        "|",
        "blockQuote",
        "insertTable",
        "|",
        "uploadImage",
        "mediaEmbed",
        "|",
        "undo",
        "redo",
      ],
      shouldNotGroupWhenFull: true,
    },
    fontSize: {
      options: [10, 12, 14, 16, 18, 20, 22, 24],
      supportAllValues: true,
    },
    language: "fr",
    image: {
      toolbar: [
        "imageTextAlternative",
        "imageStyle:inline",
        "imageStyle:block",
        "imageStyle:side",
      ],
    },
    table: {
      contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
    },
    initialData: content || "",
    placeholder: "Rédigez le contenu détaillé de votre procédure...",
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const uploadPromises = Array.from(files).map(async (file) => {
      if (!procedure?.id) {
        onPendingImage(file);
        const tempImageUrl = URL.createObjectURL(file);
        const tempImage: ProcedureImage = {
          id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          image_url: tempImageUrl,
          alt_text: file.name,
          caption: "",
          created_at: new Date().toISOString(),
        };
        return tempImage;
      } else {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("procedure_id", procedure.id);
        try {
          const response = await proceduresAPI.uploadImage(formData);
          return response.data;
        } catch (error) {
          console.error("Upload failed", error);
          return null;
        }
      }
    });

    const results = await Promise.all(uploadPromises);
    const successfulUploads = results.filter(
      (result): result is ProcedureImage => result !== null
    );

    onImagesChange([...uploadedImages, ...successfulUploads]);
  };

  const handleAttachmentUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !procedure?.id) {
      toast.error("Veuillez d'abord sauvegarder la procédure");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("procedure_id", procedure.id);
      formData.append("name", file.name);
      formData.append("file_type", file.type);
      formData.append(
        "file_size",
        (file.size / 1024 / 1024).toFixed(2) + " MB"
      );
      const response = await proceduresAPI.uploadAttachment(formData);
      onAttachmentsChange([...uploadedAttachments, response.data]);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors du téléchargement");
    }
    if (e.target) e.target.value = "";
  };

  const handleEditorReady = (editor: any) => {
    try {
      if (CustomUploadAdapter && editor.plugins.get("FileRepository")) {
        editor.plugins.get("FileRepository").createUploadAdapter = (
          loader: any
        ) => new CustomUploadAdapter(loader, procedure?.id, onPendingImage);
      }
      editorRef.current = editor;
      console.log("CKEditor initialized successfully");
    } catch (error) {
      console.error("Error initializing CKEditor:", error);
    }
  };

  const handleEditorError = (
    error: any,
    { willEditorRestart }: { willEditorRestart: boolean }
  ) => {
    if (!willEditorRestart) {
      console.warn(
        "CKEditor failed to initialize. Consider using a fallback textarea."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 transition-all duration-300">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transform transition-transform duration-300 hover:shadow-2xl">
          <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700 sm:flex sm:flex-row space-y-2 sm:items-center sm:justify-between flex flex-col">
            <div className="flex flex-col md:flex-row gap-4 md:space-x-4">
              <div>
                <BookOpen className="w-6 h-6 text-white" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {procedure
                    ? "Modifier la procédure"
                    : "Créer une nouvelle procédure"}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {procedure
                    ? "Modifiez les détails de votre procédure"
                    : "Remplissez les informations pour créer une nouvelle procédure"}
                </p>
              </div>
            </div>
            <div className="mb-1 sm:flex sm:flex-row justify-between space-x-2 dark:text-white">
              <Button
                type="button"
                variant="success"
                onClick={onPreview}
                disabled={!content.trim()}
                className="px-6 py-3 m-2 w-full bg-blue-500"
              >
                <Eye className="w-5 h-5" />
                <span className="font-semibold text-white ">Aperçu</span>
              </Button>

              <Button
                type="button"
                variant="danger"
                onClick={onCancel}
                className="px-6 py-3 m-2  w-full"
              >
                Annuler
              </Button>

              <Button
                type="submit"
                form="procedure-form"
                variant="primary"
                disabled={isSubmitting}
                className="px-6 m-2  py-3 w-full"
              >
                <Save className="w-5 h-5" />
                <span className="font-semibold">
                  {isSubmitting ? "Enregistrement..." : "Enregistrer"}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
          <form
            id="procedure-form"
            onSubmit={onSubmit}
            className="p-8 space-y-8"
          >
            {/* Section Informations de base */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Titre */}
              <div className="lg:col-span-2">
                <label
                  htmlFor="title"
                  className="block text-lg font-semibold text-gray-900 dark:text-white mb-3"
                >
                  Titre de la procédure *
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => onTitleChange(e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-300"
                  placeholder="Donnez un titre clair et descriptif à votre procédure"
                  required
                />
              </div>

              {/* Description */}
              <div className="lg:col-span-2">
                <label
                  htmlFor="description"
                  className="block text-lg font-semibold text-gray-900 dark:text-white mb-3"
                >
                  Description *
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => onDescriptionChange(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none transition-all duration-300"
                  placeholder="Décrivez brièvement l'objectif et le contexte de cette procédure"
                  required
                />
              </div>

              {/* Catégorie et Difficulté */}
              <div>
                <label
                  htmlFor="category"
                  className="block text-lg font-semibold text-gray-900 dark:text-white mb-3"
                >
                  Catégorie *
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => onCategoryChange(e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-300"
                  required
                >
                  <option value="general">📋 Général</option>
                  <option value="hardware">💻 Hardware</option>
                  <option value="software">🔧 Software</option>
                  <option value="network">🌐 Réseau</option>
                  <option value="security">🔒 Sécurité</option>
                  <option value="maintenance">⚙️ Maintenance</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="difficulty"
                  className="block text-lg font-semibold text-gray-900 dark:text-white mb-3"
                >
                  Niveau de difficulté *
                </label>
                <select
                  id="difficulty"
                  value={difficulty}
                  onChange={(e) => onDifficultyChange(e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-300"
                  required
                >
                  <option value="beginner">🟢 Débutant</option>
                  <option value="intermediate">🟡 Intermédiaire</option>
                  <option value="advanced">🔴 Avancé</option>
                </select>
              </div>

              {/* Temps estimé */}
              <div>
                <label
                  htmlFor="estimatedTime"
                  className="block text-lg font-semibold text-gray-900 dark:text-white mb-3"
                >
                  ⏱️ Temps estimé *
                </label>
                <input
                  type="text"
                  id="estimatedTime"
                  value={estimatedTime}
                  onChange={(e) => onEstimatedTimeChange(e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-300"
                  placeholder="Ex: 2-4 heures, 30 minutes, 1 jour"
                  required
                />
              </div>

              {/* Statut */}
              <div>
                <label
                  htmlFor="status"
                  className="block text-lg font-semibold text-gray-900 dark:text-white mb-3"
                >
                  📊 Statut
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => onStatusChange(e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-300"
                >
                  <option value="draft">Brouillon</option>
                  <option value="published"> Publié</option>
                  <option value="archived"> Archivé</option>
                </select>
              </div>
            </div>

            {/* Éditeur de contenu */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-3">
                 Contenu détaillé de la procédure *
              </label>
              <div className="border-2 border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden transition-all duration-300 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-200">
                <div style={{ minHeight: "500px" }}>
                  <CKEditor
                    editor={ClassicEditor}
                    config={editorConfiguration}
                    data={content}
                    onReady={handleEditorReady}
                    onError={handleEditorError}
                    onChange={(event, editor) => {
                      try {
                        const data = editor.getData();
                        onContentChange(data);
                      } catch (error) {
                        console.error("Error getting editor data:", error);
                      }
                    }}
                  />
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                 Utilisez la barre d'outils pour formater votre contenu,
                ajouter des liens, listes, etc.
              </p>
            </div>

            {/* Section Images */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-3">
                 Images supplémentaires
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 group"
              >
                <Upload className="w-16 h-16 text-gray-400 mb-4 group-hover:text-blue-500 transition-colors" />
                <p className="text-lg text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Cliquez pour ajouter des images ou glissez-déposez les ici
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Formats supportés: JPG, PNG, GIF • Max: 10MB par image
                </p>
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
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {uploadedImages.map((image) => (
                    <div key={image.id} className="relative group">
                      <div className="relative overflow-hidden rounded-lg shadow-lg">
                        <img
                          src={image.image_url}
                          alt={image.alt_text || "Procedure image"}
                          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <button
                          type="button"
                          onClick={() => onDeleteImage(image.id)}
                          className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 shadow-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <p className="text-sm truncate">{image.alt_text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section Pièces jointes */}
            {procedure?.id && (
              <div>
                <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-3">
                   Pièces jointes
                </label>
                <div
                  onClick={() => attachmentInputRef.current?.click()}
                  className="w-full p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-300 group"
                >
                  <Paperclip className="w-16 h-16 text-gray-400 mb-4 group-hover:text-green-500 transition-colors" />
                  <p className="text-lg text-gray-600 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    Ajouter des documents complémentaires
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    PDF, Word, Excel, PowerPoint • Max: 25MB par fichier
                  </p>
                  <input
                    ref={attachmentInputRef}
                    type="file"
                    onChange={handleAttachmentUpload}
                    className="hidden"
                  />
                </div>

                {uploadedAttachments.length > 0 && (
                  <div className="mt-6 space-y-4">
                    {uploadedAttachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
                      >
                        <div className="flex items-center space-x-4">
                          <Paperclip className="w-8 h-8 text-gray-400" />
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {attachment.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {attachment.file_size} • {attachment.file_type}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onDeleteAttachment(attachment.id)}
                          className="p-2 text-red-500 hover:text-red-700 transition-colors duration-300"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tags */}
            <div>
              <label
                htmlFor="tags"
                className="block text-lg font-semibold text-gray-900 dark:text-white mb-3"
              >
                🏷️ Mots-clés
              </label>
              <input
                type="text"
                id="tags"
                value={tags}
                onChange={(e) => onTagsChange(e.target.value)}
                className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-300"
                placeholder="hardware, software, réseau, sécurité (séparés par des virgules)"
              />
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Ajoutez des mots-clés pertinents pour améliorer la recherche de
                votre procédure
              </p>
            </div>

            {/* Actions du formulaire */}
            <div className="sm:flex sm:flex-row sm:justify-end flex flex-col   space-x-4 pt-8 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="danger"
                onClick={onCancel}
                className="px-8 py-4 text-gray-600 w-full m-2"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="px-8 py-4 font-semibold w-full m-2"
              >
                <Save className="w-5 h-5" />
                <span>
                  {isSubmitting
                    ? "Enregistrement en cours..."
                    : "Enregistrer la procédure"}
                </span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProcedureForm;