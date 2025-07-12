'use client'

import { useState, useEffect, useRef } from 'react';

const RichTextEditor = ({ value, onChange, placeholder }) => {
  const [mounted, setMounted] = useState(false);
  const editorRef = useRef(null);
  const [quill, setQuill] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && editorRef.current && !quill) {
      // Dynamically import Quill only on client side
      import('quill').then((Quill) => {
        const QuillClass = Quill.default || Quill;
        
        // Configure Quill
        const toolbarOptions = [
          [{ 'header': [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          [{ 'indent': '-1'}, { 'indent': '+1' }],
          [{ 'color': [] }, { 'background': [] }],
          [{ 'align': [] }],
          ['link', 'image', 'code-block'],
          ['clean']
        ];

        const newQuill = new QuillClass(editorRef.current, {
          theme: 'snow',
          modules: {
            toolbar: toolbarOptions,
            clipboard: {
              matchVisual: false
            }
          },
          placeholder: placeholder,
          formats: [
            'header',
            'bold', 'italic', 'underline', 'strike',
            'list', 'bullet',
            'indent',
            'color', 'background',
            'align',
            'link', 'image', 'code-block'
          ]
        });

        // Set initial value
        if (value) {
          newQuill.root.innerHTML = value;
        }

        // Handle text changes
        newQuill.on('text-change', () => {
          if (onChange) {
            onChange(newQuill.root.innerHTML);
          }
        });

        setQuill(newQuill);
      }).catch(console.error);
    }
  }, [mounted, quill, value, onChange, placeholder]);

  // Update content when value prop changes
  useEffect(() => {
    if (quill && value !== quill.root.innerHTML) {
      quill.root.innerHTML = value || '';
    }
  }, [value, quill]);

  if (!mounted) {
    return (
      <div className="border border-gray-300 rounded-lg">
        <div className="border-b border-gray-300 p-3 bg-gray-50">
          <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="p-4 min-h-32 bg-gray-100 animate-pulse rounded">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-300 rounded-lg">
      <div ref={editorRef} style={{ minHeight: '150px' }} />
      <style jsx global>{`
        .ql-editor {
          min-height: 150px;
          font-size: 14px;
          line-height: 1.6;
        }
        
        .ql-toolbar {
          border-top: none;
          border-left: none;
          border-right: none;
          border-bottom: 1px solid #d1d5db;
          background-color: #f9fafb;
          padding: 12px;
        }
        
        .ql-container {
          border: none;
          font-family: inherit;
        }
        
        .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: italic;
        }
        
        .ql-editor {
          padding: 16px;
        }
        
        .ql-editor p {
          margin-bottom: 8px;
        }
        
        .ql-editor h1,
        .ql-editor h2,
        .ql-editor h3 {
          margin-top: 16px;
          margin-bottom: 8px;
          font-weight: 600;
        }
        
        .ql-editor h1 {
          font-size: 1.5rem;
        }
        
        .ql-editor h2 {
          font-size: 1.25rem;
        }
        
        .ql-editor h3 {
          font-size: 1.125rem;
        }
        
        .ql-editor ul,
        .ql-editor ol {
          padding-left: 20px;
          margin-bottom: 8px;
        }
        
        .ql-editor li {
          margin-bottom: 4px;
        }
        
        .ql-editor a {
          color: #2563eb;
          text-decoration: underline;
        }
        
        .ql-editor a:hover {
          color: #1d4ed8;
        }
        
        .ql-editor img {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
          margin: 8px 0;
        }
        
        .ql-editor blockquote {
          border-left: 4px solid #d1d5db;
          padding-left: 16px;
          margin: 16px 0;
          font-style: italic;
          color: #6b7280;
        }
        
        .ql-editor code {
          background-color: #f3f4f6;
          padding: 2px 4px;
          border-radius: 3px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.875em;
        }
        
        .ql-editor pre {
          background-color: #f3f4f6;
          padding: 12px;
          border-radius: 4px;
          overflow-x: auto;
          margin: 8px 0;
        }
        
        .ql-editor pre code {
          background: none;
          padding: 0;
        }
        
        /* Toolbar button hover effects */
        .ql-toolbar button:hover,
        .ql-toolbar .ql-picker-label:hover {
          color: #2563eb !important;
        }
        
        .ql-toolbar button:hover .ql-stroke,
        .ql-toolbar .ql-picker-label:hover .ql-stroke {
          stroke: #2563eb !important;
        }
        
        .ql-toolbar button:hover .ql-fill,
        .ql-toolbar .ql-picker-label:hover .ql-fill {
          fill: #2563eb !important;
        }
        
        /* Active state for toolbar buttons */
        .ql-toolbar .ql-active {
          color: #2563eb !important;
        }
        
        .ql-toolbar .ql-active .ql-stroke {
          stroke: #2563eb !important;
        }
        
        .ql-toolbar .ql-active .ql-fill {
          fill: #2563eb !important;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;