import React from 'react';
import { BookOpen, Edit, Calendar, Tag, User, ZoomIn, Download } from 'lucide-react';
import { ProcedureImage, ProcedureAttachment } from '../../../../types';

interface ProcedurePreviewProps {
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
  formatTags: (tagsString: string) => string[];
  setSelectedImage: (url: string) => void;
  onEdit: () => void;
}

// Composant icône image pour la galerie
const ImageIcon: React.FC = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ProcedurePreview: React.FC<ProcedurePreviewProps> = ({
  title,
  description,
  content,
  category,
  difficulty,
  estimatedTime,
  tags,
  status,
  uploadedImages,
  formatTags,
  setSelectedImage,
  onEdit
}) => {
  // Fonction pour rendre le contenu HTML avec les images cliquables
  const renderContentWithClickableImages = (htmlContent: string) => {
    if (!htmlContent) return '<p class="text-gray-500 dark:text-gray-400 italic">Le contenu de la procédure apparaîtra ici...</p>';
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const images = doc.querySelectorAll('img');
    
    images.forEach(img => {
      const src = img.getAttribute('src');
      const alt = img.getAttribute('alt') || 'Image de la procédure';
      if (src) {
        const wrapper = doc.createElement('div');
        wrapper.className = 'clickable-image-wrapper relative group cursor-pointer';
        wrapper.innerHTML = `
          <div class="relative overflow-hidden rounded-lg">
            <img src="${src}" alt="${alt}" class="w-full h-auto transition-transform duration-300 group-hover:scale-105" />
            <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
              <div class="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex space-x-2">
                <span class="bg-white bg-opacity-90 rounded-full p-2">
                <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.65 3.65a7.5 7.5 0 0012.99 12.99zM10 7v6m3-3H7" />
              </svg>                </span>
              </div>
            </div>
          </div>
        `;
        wrapper.onclick = () => setSelectedImage(src);
        img.replaceWith(wrapper);
      }
    });
    
    return doc.body.innerHTML;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 transition-all duration-300">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transform transition-transform duration-300 hover:shadow-2xl">
          <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Aperçu de la procédure
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Visualisez votre procédure avant publication
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onEdit}
              className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl flex items-center space-x-3 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <Edit className="w-5 h-5" />
              <span className="font-semibold">Éditer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="max-w-6xl mx-auto">
        <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
          {/* En-tête de l'article */}
          <div className="p-8 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-750 dark:to-gray-700">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
              <Calendar className="w-4 h-4" />
              <span>{new Date().toLocaleDateString('fr-FR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
              <span>•</span>
              <User className="w-4 h-4" />
              <span>Auteur</span>
              <span className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold ${
                status === 'draft' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
              }`}>
                {status === 'draft' ? 'Brouillon' : status === 'published' ? 'Publié' : 'Archivé'}
              </span>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              {title || 'Titre de la procédure'}
            </h1>
            
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              {description || 'Description de la procédure'}
            </p>
            
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center space-x-2 bg-white dark:bg-gray-600 px-4 py-2 rounded-lg shadow-sm">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Catégorie:</span>
                <span className="capitalize text-blue-600 dark:text-blue-400">{category}</span>
              </div>
              <div className="flex items-center space-x-2 bg-white dark:bg-gray-600 px-4 py-2 rounded-lg shadow-sm">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Difficulté:</span>
                <span className="capitalize text-green-600 dark:text-green-400">{difficulty}</span>
              </div>
              <div className="flex items-center space-x-2 bg-white dark:bg-gray-600 px-4 py-2 rounded-lg shadow-sm">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Temps estimé:</span>
                <span className="text-purple-600 dark:text-purple-400">{estimatedTime}</span>
              </div>
            </div>
            
            {tags && (
              <div className="flex flex-wrap gap-2 mt-6">
                {formatTags(tags).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 dark:from-blue-900 dark:to-blue-800 dark:text-blue-200 shadow-sm"
                  >
                    <Tag className="w-3 h-3 mr-2" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* Images gallery */}
          {uploadedImages.length > 0 && (
            <div className="p-8 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white flex items-center">
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-2 rounded-lg mr-3">
                  <ImageIcon />
                </span>
                Galerie d'images
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {uploadedImages.map((image) => (
                  <div 
                    key={image.id} 
                    className="relative group cursor-pointer transform transition-all duration-300 hover:scale-105"
                    onClick={() => setSelectedImage(image.image_url)}
                  >
                    <div className="relative overflow-hidden rounded-xl shadow-lg">
                      <img
                        src={image.image_url}
                        alt={image.alt_text || 'Procedure image'}
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex space-x-2">
                          <span className="bg-white bg-opacity-90 rounded-full p-3 shadow-lg">
                            <ZoomIn className="w-5 h-5 text-gray-700" />
                          </span>
                          <a 
                            href={image.image_url} 
                            download 
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white bg-opacity-90 rounded-full p-3 shadow-lg"
                          >
                            <Download className="w-5 h-5 text-gray-700" />
                          </a>
                        </div>
                      </div>
                    </div>
                    {image.caption && (
                      <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 text-center">{image.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Contenu principal */}
          <div className="p-8">
            <div 
              className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-strong:text-gray-900 dark:prose-strong:text-white prose-code:bg-gray-100 dark:prose-code:bg-gray-700 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100"
              dangerouslySetInnerHTML={{ __html: renderContentWithClickableImages(content) }}
            />
          </div>
        </article>
      </div>
    </div>
  );
};

export default ProcedurePreview;