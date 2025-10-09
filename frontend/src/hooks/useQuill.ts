// hooks/useQuill.ts
import { useEffect, useRef, useState, useCallback } from 'react';

interface UseQuillOptions {
  placeholder?: string;
  readOnly?: boolean;
  onImageUpload?: () => void;
  formats?: string[];
  modules?: any;
}

export const useQuill = (initialValue: string = '', options: UseQuillOptions = {}) => {
  const [value, setValue] = useState(initialValue);
  const [isReady, setIsReady] = useState(false);
  const quillRef = useRef<any>(null);
  const editorRef = useRef<any>(null);

  const {
    placeholder = "Écrivez votre contenu ici...",
    readOnly = false,
    onImageUpload,
    formats = [
      'header', 'bold', 'italic', 'underline', 'strike',
      'color', 'background', 'list', 'bullet', 'indent',
      'align', 'blockquote', 'code-block', 'link', 'image'
    ],
    modules
  } = options;

  // Default modules configuration
  const defaultModules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: onImageUpload || function() {
          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');
          input.click();
          
          input.onchange = () => {
            const file = input.files?.[0];
            if (file && editorRef.current) {
              const reader = new FileReader();
              reader.onload = (e) => {
                const range = editorRef.current.getSelection(true);
                if (range) {
                  editorRef.current.insertEmbed(range.index, 'image', e.target?.result);
                  editorRef.current.setSelection(range.index + 1, 0);
                }
              };
              reader.readAsDataURL(file);
            }
          };
        }
      }
    },
    clipboard: {
      matchVisual: false
    }
  };

  // Initialize editor
  const initializeEditor = useCallback((quillInstance: any) => {
    if (quillInstance) {
      editorRef.current = quillInstance.getEditor();
      setIsReady(true);
    }
  }, []);

  // Handle value changes with debouncing
  const handleChange = useCallback((newValue: string) => {
    setValue(newValue);
  }, []);

  // Get editor instance
  const getEditor = useCallback(() => {
    return editorRef.current;
  }, []);

  // Focus editor
  const focus = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);

  // Blur editor
  const blur = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.blur();
    }
  }, []);

  // Insert text at cursor
  const insertText = useCallback((text: string, retain = false) => {
    if (editorRef.current) {
      const range = editorRef.current.getSelection(true);
      if (range) {
        if (retain) {
          editorRef.current.insertText(range.index, text, 'user');
        } else {
          editorRef.current.deleteText(range.index, range.length);
          editorRef.current.insertText(range.index, text, 'user');
        }
      }
    }
  }, []);

  // Insert embed (image, video, etc.)
  const insertEmbed = useCallback((type: string, value: any) => {
    if (editorRef.current) {
      const range = editorRef.current.getSelection(true);
      if (range) {
        editorRef.current.insertEmbed(range.index, type, value);
        editorRef.current.setSelection(range.index + 1, 0);
      }
    }
  }, []);

  // Get plain text content
  const getText = useCallback(() => {
    if (editorRef.current) {
      return editorRef.current.getText();
    }
    return '';
  }, []);

  // Get content length
  const getLength = useCallback(() => {
    if (editorRef.current) {
      return editorRef.current.getLength();
    }
    return 0;
  }, []);

  // Set selection
  const setSelection = useCallback((index: number, length: number = 0) => {
    if (editorRef.current) {
      editorRef.current.setSelection(index, length);
    }
  }, []);

  // Update value when initialValue changes
  useEffect(() => {
    if (initialValue !== value && !isReady) {
      setValue(initialValue);
    }
  }, [initialValue, value, isReady]);

  return {
    // State
    value,
    setValue: handleChange,
    isReady,
    
    // Refs
    quillRef,
    editorRef,
    
    // Configuration
    modules: modules || defaultModules,
    formats,
    placeholder,
    readOnly,
    
    // Methods
    initializeEditor,
    getEditor,
    focus,
    blur,
    insertText,
    insertEmbed,
    getText,
    getLength,
    setSelection,
  };
};

export default useQuill;