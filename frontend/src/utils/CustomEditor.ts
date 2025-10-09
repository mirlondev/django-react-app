// CustomEditor.ts
// ====================
// Core
import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

// Basic styles
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
//import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code';
import Subscript from '@ckeditor/ckeditor5-basic-styles/src/subscript';
import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript';

// Lists
import List from '@ckeditor/ckeditor5-list/src/list';
import TodoList from '@ckeditor/ckeditor5-list/src/todolist';

// Block quote
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';

// Table
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';

// Image - Add missing dependencies
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';

// Media
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';

// Undo
import Undo from '@ckeditor/ckeditor5-undo/src/undo';

// Fonts
import Font from '@ckeditor/ckeditor5-font/src/font';

// Advanced
import FindAndReplace from '@ckeditor/ckeditor5-find-and-replace/src/findandreplace';
import Highlight from '@ckeditor/ckeditor5-highlight/src/highlight';
import RemoveFormat from '@ckeditor/ckeditor5-remove-format/src/removeformat';
import SpecialCharacters from '@ckeditor/ckeditor5-special-characters/src/specialcharacters';
import SpecialCharactersEssentials from '@ckeditor/ckeditor5-special-characters/src/specialcharactersessentials';

// Indent & alignment
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';

// Insert elements
import Link from '@ckeditor/ckeditor5-link/src/link';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline';
import PageBreak from '@ckeditor/ckeditor5-page-break/src/pagebreak';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';

// Clipboard - Important for proper functionality
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';

// Typing
import Typing from '@ckeditor/ckeditor5-typing/src/typing';

// Enter - Required for proper line breaks
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import ShiftEnter from '@ckeditor/ckeditor5-enter/src/shiftenter';

// Selection - Required for proper text selection
import SelectAll from '@ckeditor/ckeditor5-select-all/src/selectall';

class CustomEditor extends ClassicEditorBase {}

// ====================
// Plugins - Add missing essential plugins
CustomEditor.builtinPlugins = [
  // Essential plugins first
  Essentials,
  Paragraph,
  Clipboard,
  Enter,
  ShiftEnter,
  SelectAll,
  Typing,
  Undo,
  
  // Heading
  Heading,
  
  // Basic styles
  Bold,
  Italic,
  //Underline,
  Strikethrough,
  Code,
  Subscript,
  Superscript,
  
  // Lists
  List,
  TodoList,
  
  // Block elements
  BlockQuote,
  
  // Table with all dependencies
  Table,
  TableToolbar,
  
  // Image with all dependencies
  Image,
  ImageToolbar,
  ImageUpload,
  ImageResize,
  ImageStyle,
  ImageCaption,
  
  // Media
  MediaEmbed,
  
  // Font
  Font,
  
  // Advanced features
  FindAndReplace,
  Highlight,
  RemoveFormat,
  SpecialCharacters,
  SpecialCharactersEssentials,
  
  // Layout
  Indent,
  Alignment,
  
  // Links and elements
  Link,
  HorizontalLine,
  PageBreak,
];

// ====================
// Default configuration - Simplified and safer
CustomEditor.defaultConfig = {
  toolbar: {
    items: [
      'heading', '|',
      'bold', 'italic', '|',
      'fontSize', 'fontColor', 'fontBackgroundColor', '|',
      'bulletedList', 'numberedList', '|',
      'outdent', 'indent', '|',
      'alignment', '|',
      'link', 'blockQuote', 'insertTable', '|',
      'uploadImage', 'mediaEmbed', '|',
      'highlight', 'removeFormat', '|',
      'findAndReplace', '|',
      'undo', 'redo'
    ],
    shouldNotGroupWhenFull: true
  },
  language: 'fr',
  image: {
    toolbar: [
      'imageTextAlternative',
      '|',
      'imageStyle:inline',
      'imageStyle:wrapText',
      'imageStyle:breakText',
      '|',
      'resizeImage'
    ],
    resizeOptions: [
      {
        name: 'resizeImage:original',
        label: 'Original size',
        value: null
      },
      {
        name: 'resizeImage:50',
        label: '50%',
        value: '50'
      },
      {
        name: 'resizeImage:75',
        label: '75%',
        value: '75'
      }
    ]
  },
  table: {
    contentToolbar: [
      'tableColumn',
      'tableRow',
      'mergeTableCells',
      'tableProperties',
      'tableCellProperties'
    ]
  },
  // Add heading configuration
  heading: {
    options: [
      { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
      { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
      { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
      { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
      { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' }
    ]
  },
  // Font configuration
  fontSize: {
    options: [9, 11, 13, 'default', 17, 19, 21, 27, 35]
  },
  fontFamily: {
    options: [
      'default',
      'Arial, Helvetica, sans-serif',
      'Courier New, Courier, monospace',
      'Georgia, serif',
      'Lucida Sans Unicode, Lucida Grande, sans-serif',
      'Tahoma, Geneva, sans-serif',
      'Times New Roman, Times, serif',
      'Trebuchet MS, Helvetica, sans-serif',
      'Verdana, Geneva, sans-serif'
    ]
  }
};

export default CustomEditor;