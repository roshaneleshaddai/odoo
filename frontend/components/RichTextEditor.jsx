'use client'

import { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';

const RichTextEditor = ({ value, onChange, placeholder }) => {
  const [mounted, setMounted] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);
  const [quill, setQuill] = useState(null);

  // Emoji categories and data
  const emojiCategories = {
    'Smileys & Emotion': [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
      '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
      '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
      '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
      '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
      '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
      '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😯', '😦', '😧',
      '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢',
      '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '💩', '👻', '💀',
      '☠️', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽',
      '🙀', '😿', '😾', '🙈', '🙉', '🙊'
    ],
    'People & Body': [
      '👶', '👧', '🧒', '👦', '👩', '🧑', '👨', '👵', '🧓', '👴',
      '👮‍♀️', '👮', '👮‍♂️', '🕵️‍♀️', '🕵️', '🕵️‍♂️', '💂‍♀️', '💂', '💂‍♂️', '👷‍♀️',
      '👷', '👷‍♂️', '🤴', '👸', '👳‍♀️', '👳', '👳‍♂️', '👲', '🧕', '🤵‍♀️',
      '🤵', '🤵‍♂️', '👰‍♀️', '👰', '👰‍♂️', '🤰', '🤱', '👼', '🎅', '🤶',
      '🦸‍♀️', '🦸', '🦸‍♂️', '🦹‍♀️', '🦹', '🦹‍♂️', '🧙‍♀️', '🧙', '🧙‍♂️', '🧚‍♀️',
      '🧚', '🧚‍♂️', '🧛‍♀️', '🧛', '🧛‍♂️', '🧜‍♀️', '🧜', '🧜‍♂️', '🧝‍♀️', '🧝',
      '🧝‍♂️', '🧞‍♀️', '🧞', '🧞‍♂️', '🧟‍♀️', '🧟', '🧟‍♂️', '🙍‍♀️', '🙍', '🙍‍♂️',
      '🙎‍♀️', '🙎', '🙎‍♂️', '🙅‍♀️', '🙅', '🙅‍♂️', '🙆‍♀️', '🙆', '🙆‍♂️', '💁‍♀️',
      '💁', '💁‍♂️', '🙋‍♀️', '🙋', '🙋‍♂️', '🙇‍♀️', '🙇', '🙇‍♂️', '🤦‍♀️', '🤦',
      '🤦‍♂️', '🤷‍♀️', '🤷', '🤷‍♂️', '👩‍⚕️', '🧑‍⚕️', '👨‍⚕️', '👩‍🌾', '🧑‍🌾', '👨‍🌾',
      '👩‍🍳', '🧑‍🍳', '👨‍🍳', '👩‍🎓', '🧑‍🎓', '👨‍🎓', '👩‍🎤', '🧑‍🎤', '👨‍🎤', '👩‍🏫',
      '🧑‍🏫', '👨‍🏫', '👩‍🏭', '🧑‍🏭', '👨‍🏭', '👩‍💻', '🧑‍💻', '👨‍💻', '👩‍💼', '🧑‍💼',
      '👨‍💼', '👩‍🔧', '🧑‍🔧', '👨‍🔧', '👩‍🔬', '🧑‍🔬', '👨‍🔬', '👩‍🎨', '🧑‍🎨', '👨‍🎨',
      '👩‍🚒', '🧑‍🚒', '👨‍🚒', '👩‍✈️', '🧑‍✈️', '👨‍✈️', '👩‍🚀', '🧑‍🚀', '👨‍🚀', '👩‍⚖️',
      '🧑‍⚖️', '👨‍⚖️', '👰‍♀️', '👰', '👰‍♂️', '🤵‍♀️', '🤵', '🤵‍♂️', '👸', '🤴',
      '🥷', '🦹‍♀️', '🦹', '🦹‍♂️', '🦸‍♀️', '🦸', '🦸‍♂️', '🤶', '🎅', '👼',
      '🤱', '🤰', '👰‍♂️', '👰', '👰‍♀️', '🤵‍♂️', '🤵', '🤵‍♀️', '👴', '🧓',
      '👵', '👨', '🧑', '👩', '🧒', '👦', '👧', '👶'
    ],
    'Animals & Nature': [
      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
      '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🐣',
      '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛',
      '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️', '🕸️', '🦂', '🐢',
      '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡',
      '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓',
      '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃',
      '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕',
      '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🐓', '🦃', '🦚', '🦜', '🦢',
      '🦩', '🦨', '🦦', '🦥', '🐁', '🐀', '🐇', '🐿️', '🦔', '🐉',
      '🐲', '🌵', '🎄', '🌲', '🌳', '🌴', '🪵', '🌱', '🌿', '☘️',
      '🍀', '🎍', '🪴', '🎋', '🍃', '🍂', '🍁', '🍄', '🌾', '💐',
      '🌷', '🌹', '🥀', '🌺', '🌻', '🌼', '🌸', '🌼', '🌻', '🌺',
      '🌹', '🥀', '🌷', '🌼', '🌸', '🌼', '🌻', '🌺', '🌹', '🥀',
      '🌷', '🌼', '🌸', '🌼', '🌻', '🌺', '🌹', '🥀', '🌷', '🌼'
    ],
    'Food & Drink': [
      '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈',
      '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🥑', '🍆', '🥔',
      '🥕', '🌽', '🌶️', '🫑', '🥒', '🥬', '🥦', '🧄', '🧅', '🥜',
      '🌰', '🫘', '🫒', '🥑', '🥦', '🧄', '🧅', '🥜', '🌰', '🫘',
      '🫒', '🥑', '🥦', '🧄', '🧅', '🥜', '🌰', '🫘', '🫒', '🥑',
      '🥦', '🧄', '🧅', '🥜', '🌰', '🫘', '🫒', '🥑', '🥦', '🧄',
      '🧅', '🥜', '🌰', '🫘', '🫒', '🥑', '🥦', '🧄', '🧅', '🥜',
      '🌰', '🫘', '🫒', '🥑', '🥦', '🧄', '🧅', '🥜', '🌰', '🫘',
      '🫒', '🥑', '🥦', '🧄', '🧅', '🥜', '🌰', '🫘', '🫒', '🥑',
      '🥦', '🧄', '🧅', '🥜', '🌰', '🫘', '🫒', '🥑', '🥦', '🧄',
      '🧅', '🥜', '🌰', '🫘', '🫒', '🥑', '🥦', '🧄', '🧅', '🥜',
      '🌰', '🫘', '🫒', '🥑', '🥦', '🧄', '🧅', '🥜', '🌰', '🫘'
    ],
    'Activities': [
      '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱',
      '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🥅', '⛳', '🪁',
      '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷️', '⛸️', '🥌',
      '🎿', '⛷️', '🏂', '🪂', '🏋️‍♀️', '🏋️', '🏋️‍♂️', '🤼‍♀️', '🤼', '🤼‍♂️',
      '🤸‍♀️', '🤸', '🤸‍♂️', '⛹️‍♀️', '⛹️', '⛹️‍♂️', '🤺', '🤾‍♀️', '🤾', '🤾‍♂️',
      '🏊‍♀️', '🏊', '🏊‍♂️', '🚣‍♀️', '🚣', '🚣‍♂️', '🏄‍♀️', '🏄', '🏄‍♂️', '🚴‍♀️',
      '🚴', '🚴‍♂️', '🚵‍♀️', '🚵', '🚵‍♂️', '🏇', '🧘‍♀️', '🧘', '🧘‍♂️', '🏄‍♀️',
      '🏄', '🏄‍♂️', '🚣‍♀️', '🚣', '🚣‍♂️', '🏊‍♀️', '🏊', '🏊‍♂️', '🤾‍♀️', '🤾',
      '🤾‍♂️', '🤺', '⛹️‍♀️', '⛹️', '⛹️‍♂️', '🤸‍♀️', '🤸', '🤸‍♂️', '🤼‍♀️', '🤼',
      '🤼‍♂️', '🏋️‍♀️', '🏋️', '🏋️‍♂️', '🪂', '🏂', '⛷️', '🎿', '🥌', '⛸️',
      '🛷️', '🛹', '🎽', '🥋', '🥊', '🤿', '🎣', '🏹', '🪁', '⛳',
      '🥅', '🏏', '🥍', '🏑', '🏒', '🏸', '🏓', '🪀', '🎱', '🥏',
      '🏉', '🏐', '🎾', '🥎', '⚾', '🏈', '🏀', '⚽'
    ],
    'Objects': [
      '⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️',
      '🎮', '🎲', '🧩', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹',
      '🥁', '🪘', '🎸', '🪕', '🎺', '🎻', '🪗', '🎷', '🎺', '🎸',
      '🪕', '🎻', '🪗', '🎷', '🎺', '🎸', '🪕', '🎻', '🪗', '🎷',
      '🎺', '🎸', '🪕', '🎻', '🪗', '🎷', '🎺', '🎸', '🪕', '🎻',
      '🪗', '🎷', '🎺', '🎸', '🪕', '🎻', '🪗', '🎷', '🎺', '🎸',
      '🪕', '🎻', '🪗', '🎷', '🎺', '🎸', '🪕', '🎻', '🪗', '🎷',
      '🎺', '🎸', '🪕', '🎻', '🪗', '🎷', '🎺', '🎸', '🪕', '🎻',
      '🪗', '🎷', '🎺', '🎸', '🪕', '🎻', '🪗', '🎷', '🎺', '🎸',
      '🪕', '🎻', '🪗', '🎷', '🎺', '🎸', '🪕', '🎻', '🪗', '🎷',
      '🎺', '🎸', '🪕', '🎻', '🪗', '🎷', '🎺', '🎸'
    ]
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && editorRef.current && !quill) {
      // Dynamically import Quill only on client side
      import('quill').then((Quill) => {
        const QuillClass = Quill.default || Quill;
        
        // Configure Quill with custom toolbar
        const toolbarOptions = [
          [{ 'header': [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          [{ 'indent': '-1'}, { 'indent': '+1' }],
          [{ 'color': [] }, { 'background': [] }],
          [{ 'align': [] }],
          ['link', 'image', 'code-block'],
          ['emoji'], // Custom emoji button
          ['clean']
        ];

        const newQuill = new QuillClass(editorRef.current, {
          theme: 'snow',
          modules: {
            toolbar: {
              container: toolbarOptions,
              handlers: {
                emoji: function() {
                  setShowEmojiPicker(!showEmojiPicker);
                },
                image: function() {
                  setShowImageUpload(!showImageUpload);
                }
              }
            },
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
  }, [mounted, quill, value, onChange, placeholder, showEmojiPicker, showImageUpload]);

  // Update content when value prop changes
  useEffect(() => {
    if (quill && value !== quill.root.innerHTML) {
      quill.root.innerHTML = value || '';
    }
  }, [value, quill]);

  const insertEmoji = (emoji) => {
    if (quill) {
      const range = quill.getSelection();
      if (range) {
        quill.insertText(range.index, emoji);
        quill.setSelection(range.index + emoji.length);
      } else {
        quill.insertText(quill.getLength(), emoji);
      }
    }
    setShowEmojiPicker(false);
  };

  const insertImage = (imageUrl) => {
    if (quill && imageUrl) {
      const range = quill.getSelection();
      if (range) {
        quill.insertEmbed(range.index, 'image', imageUrl);
        quill.setSelection(range.index + 1);
      } else {
        quill.insertEmbed(quill.getLength(), 'image', imageUrl);
      }
    }
    setShowImageUpload(false);
    setImageUrl('');
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('image', file);

      // Upload to our backend API using axios instance
      const response = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
          }
        },
      });

      insertImage(response.data.url);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleUrlSubmit = () => {
    if (imageUrl.trim()) {
      insertImage(imageUrl.trim());
    }
  };

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
    <div className="border border-gray-300 rounded-lg relative">
      <div ref={editorRef} style={{ minHeight: '150px' }} />
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md max-h-96 overflow-y-auto top-full left-0">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">Insert Emoji</h3>
            <button
              onClick={() => setShowEmojiPicker(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            {Object.entries(emojiCategories).map(([category, emojis]) => (
              <div key={category}>
                <h4 className="text-sm font-medium text-gray-700 mb-2">{category}</h4>
                <div className="grid grid-cols-8 gap-1">
                  {emojis.map((emoji, index) => (
                    <button
                      key={`${category}-${index}`}
                      onClick={() => insertEmoji(emoji)}
                      className="p-2 hover:bg-gray-100 rounded text-lg transition-colors"
                      title={emoji}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Upload Modal */}
      {showImageUpload && (
        <div className="absolute z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md top-full left-0">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">Insert Image</h3>
            <button
              onClick={() => setShowImageUpload(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            {/* Upload from file */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Upload Image</h4>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : 'Choose File'}
              </button>
              {uploading && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Uploading... {uploadProgress}%</p>
                </div>
              )}
            </div>

            {/* Or enter URL */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Or enter image URL</h4>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
                />
                <button
                  onClick={handleUrlSubmit}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Insert
                </button>
              </div>
            </div>

            <div className="text-xs text-gray-500">
              Supported formats: JPG, PNG, GIF, WebP (max 5MB)
            </div>
          </div>
        </div>
      )}

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