import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProcedureEditor from './components/ProcedureFormUpadate/ProcedureEditor';
import { proceduresAPI } from '../../services/api';
import { Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { Procedure } from '../../types';
import AuthenticatedLayout from '../../components/Auth/AuthenticatedLayout';

const ParentProcedureComponent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [procedure, setProcedure] = useState<Procedure | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      fetchProcedure();
    } else {
      setIsLoading(false);
    }
  }, [id]);

  const fetchProcedure = async () => {
    try {
      setIsLoading(true);
      const response = await proceduresAPI.getById(id!);
      setProcedure(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement de la procédure');
      console.error('Error fetching procedure:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (savedProcedure: Partial<Procedure>, pendingImages: File[] = []) => {
    try {
      setIsSaving(true);
      setError(null);
      let procedureId = id;
      let createdProcedure: Procedure | null = null;

      // === Étape 1 : Créer ou mettre à jour la procédure ===
      if (id) {
        // Update existing procedure
        const response = await proceduresAPI.update(id, savedProcedure);
        createdProcedure = response.data;
        procedureId = id;
        navigate(`/procedures/${ procedureId}`);
      } else {
        // Create new procedure
        const response = await proceduresAPI.create(savedProcedure);
        createdProcedure = response.data;
        setProcedure(createdProcedure);
        procedureId = createdProcedure.id;

        // Redirect to edit page for new procedures
        navigate(`/procedures/edit/${procedureId}`, { replace: true });
      }

      // === Étape 2 : Upload les images en attente ===
      if (pendingImages.length > 0 && procedureId) {
        try {
          const uploadPromises = pendingImages.map(async (file) => {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('procedure_id', procedureId!);
            
            return await proceduresAPI.uploadImage(formData);
          });

          await Promise.all(uploadPromises);
          
          // Refresh procedure data to get updated images
          if (procedureId) {
            const refreshedResponse = await proceduresAPI.getById(procedureId);
            setProcedure(refreshedResponse.data);
          }
        } catch (imageError) {
          console.error('Error uploading pending images:', imageError);
          // Don't fail the entire save if just images fail
        }
      }

      // === Étape 3 : Traiter le contenu pour remplacer les data URLs ===
      if (savedProcedure.content && pendingImages.length > 0 && createdProcedure) {
        try {
          // This would require additional logic to replace data URLs in content
          // with actual image URLs from the uploaded images
          // For now, we'll refresh the procedure to get the updated content
          await fetchProcedure();
        } catch (contentError) {
          console.error('Error processing content images:', contentError);
        }
      }

      // Show success message
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
      console.error('Error saving procedure:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/procedures');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mb-4" />
          <span className="text-gray-600">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error && !procedure) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-600 mr-2" />
            <h3 className="text-lg font-medium text-red-800">Erreur</h3>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setError(null);
                if (id) fetchProcedure();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Réessayer
            </button>
            <button
              onClick={() => navigate('/procedures')}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Retour
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto py-8">
        {/* Header with status messages */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {id ? 'Modifier la procédure' : 'Créer une nouvelle procédure'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {id 
                  ? 'Modifiez les détails de votre procédure existante.' 
                  : 'Remplissez les informations pour créer une nouvelle procédure.'
                }
              </p>
            </div>
            
            {/* Status indicators */}
            <div className="flex items-center space-x-2">
              {isSaving && (
                <div className="flex items-center text-blue-600">
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  <span className="text-sm">Sauvegarde...</span>
                </div>
              )}
              
              {saveSuccess && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm">Sauvegardé!</span>
                </div>
              )}
            </div>
          </div>

          {/* Error message banner */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-red-700">{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>
        
        <ProcedureEditor
          procedure={procedure}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </AuthenticatedLayout>
  );
};

export default ParentProcedureComponent;