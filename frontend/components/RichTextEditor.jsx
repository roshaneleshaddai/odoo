'use client'

import { useState, useRef, useEffect } from 'react';

const RichTextEditor = ({ value, onChange, placeholder }) => {
  const editorRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showImageInput, setShowImageInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const execCommand = (command, value = null) => {
    // Focus the editor first
    editorRef.current.focus();
    
    // Execute the command
    document.execCommand(command, false, value);
    
    // Update the value
    if (onChange) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (onChange) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertLink = () => {
    if (linkUrl.trim()) {
      editorRef.current.focus();
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const link = document.createElement('a');
        link.href = linkUrl;
        link.textContent = linkUrl;
        range.insertNode(link);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      setLinkUrl('');
      setShowLinkInput(false);
      if (onChange) {
        onChange(editorRef.current.innerHTML);
      }
    }
  };

  const insertImage = () => {
    if (imageUrl.trim()) {
      editorRef.current.focus();
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = 'Inserted image';
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        range.insertNode(img);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      setImageUrl('');
      setShowImageInput(false);
      if (onChange) {
        onChange(editorRef.current.innerHTML);
      }
    }
  };

  const insertEmoji = (emoji) => {
    editorRef.current.focus();
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const textNode = document.createTextNode(emoji);
      range.insertNode(textNode);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    if (onChange) {
      onChange(editorRef.current.innerHTML);
    }
    setShowEmojiPicker(false);
  };

  const emojis = [
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
    '🙀', '😿', '😾', '🙈', '🙉', '🙊', '👶', '👧', '🧒', '👦',
    '👩', '🧑', '👨', '👵', '🧓', '👴', '👮‍♀️', '👮', '👮‍♂️', '🕵️‍♀️',
    '🕵️', '🕵️‍♂️', '💂‍♀️', '💂', '💂‍♂️', '👷‍♀️', '👷', '👷‍♂️', '🤴', '👸',
    '👳‍♀️', '👳', '👳‍♂️', '👲', '🧕', '🤵‍♀️', '🤵', '🤵‍♂️', '👰‍♀️', '👰',
    '👰‍♂️', '🤰', '🤱', '👼', '🎅', '🤶', '🦸‍♀️', '🦸', '🦸‍♂️', '🦹‍♀️',
    '🦹', '🦹‍♂️', '🧙‍♀️', '🧙', '🧙‍♂️', '🧚‍♀️', '🧚', '🧚‍♂️', '🧛‍♀️', '🧛',
    '🧛‍♂️', '🧜‍♀️', '🧜', '🧜‍♂️', '🧝‍♀️', '🧝', '🧝‍♂️', '🧞‍♀️', '🧞', '🧞‍♂️',
    '🧟‍♀️', '🧟', '🧟‍♂️', '🙍‍♀️', '🙍', '🙍‍♂️', '🙎‍♀️', '🙎', '🙎‍♂️', '🙅‍♀️',
    '🙅', '🙅‍♂️', '🙆‍♀️', '🙆', '🙆‍♂️', '💁‍♀️', '💁', '💁‍♂️', '🙋‍♀️', '🙋',
    '🙋‍♂️', '🙇‍♀️', '🙇', '🙇‍♂️', '🤦‍♀️', '🤦', '🤦‍♂️', '🤷‍♀️', '🤷', '🤷‍♂️',
    '👩‍⚕️', '🧑‍⚕️', '👨‍⚕️', '👩‍🌾', '🧑‍🌾', '👨‍🌾', '👩‍🍳', '🧑‍🍳', '👨‍🍳', '👩‍🎓',
    '🧑‍🎓', '👨‍🎓', '👩‍🎤', '🧑‍🎤', '👨‍🎤', '👩‍🏫', '🧑‍🏫', '👨‍🏫', '👩‍🏭', '🧑‍🏭',
    '👨‍🏭', '👩‍💻', '🧑‍💻', '👨‍💻', '👩‍💼', '🧑‍💼', '👨‍💼', '👩‍🔧', '🧑‍🔧', '👨‍🔧',
    '👩‍🔬', '🧑‍🔬', '👨‍🔬', '👩‍🎨', '🧑‍🎨', '👨‍🎨', '👩‍🚒', '🧑‍🚒', '👨‍🚒', '👩‍✈️',
    '🧑‍✈️', '👨‍✈️', '👩‍🚀', '🧑‍🚀', '👨‍🚀', '👩‍⚖️', '🧑‍⚖️', '👨‍⚖️', '👰‍♀️', '👰',
    '👰‍♂️', '🤵‍♀️', '🤵', '🤵‍♂️', '👸', '🤴', '🥷', '🦹‍♀️', '🦹', '🦹‍♂️',
    '🦸‍♀️', '🦸', '🦸‍♂️', '🤶', '🎅', '👼', '🤱', '🤰', '👰‍♂️', '👰',
    '👰‍♀️', '🤵‍♂️', '🤵', '🤵‍♀️', '👴', '🧓', '👵', '👨', '🧑', '👩',
    '🧒', '👦', '👧', '👶', '🙊', '🙉', '🙈', '😾', '😿', '🙀',
    '😽', '😼', '😻', '😹', '😸', '😺', '🤖', '👾', '👽', '💀',
    '👻', '💩', '🤠', '🤑', '🤕', '🤒', '😷', '🤧', '🤮', '🤢',
    '🥴', '🤐', '😵', '😪', '🤤', '🥱', '😲', '😮', '😧', '😦',
    '😯', '😐', '😶', '🤥', '🤫', '🤭', '🤔', '🤗', '🤓', '🧐',
    '🤨', '🤪', '😜', '😝', '😛', '😋', '😚', '😙', '😗', '😘',
    '🥰', '😍', '😌', '😉', '🙃', '🙂', '😇', '😊', '🤣', '😂',
    '😅', '😆', '😁', '😄', '😃', '😀'
  ];

  // Focus the editor when component mounts
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);

  // Handle keydown to prevent reverse text
  const handleKeyDown = (e) => {
    // Allow normal typing behavior for all keys
    // Only handle Enter specially
    if (e.key === 'Enter') {
      e.preventDefault();
      document.execCommand('insertLineBreak', false, null);
      if (onChange) {
        onChange(editorRef.current.innerHTML);
      }
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg">
      {/* Toolbar */}
      <div className="border-b border-gray-300 p-3 flex flex-wrap items-center gap-1 bg-gray-50">
        <button
          type="button"
          onClick={() => execCommand('bold')}
          className="p-2 rounded hover:bg-gray-200 font-bold text-gray-700"
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          className="p-2 rounded hover:bg-gray-200 italic text-gray-700"
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => execCommand('strikeThrough')}
          className="p-2 rounded hover:bg-gray-200 text-gray-700"
          title="Strikethrough"
        >
          S̶
        </button>
        
        <div className="border-l border-gray-400 h-6 mx-1"></div>
        
        <button
          type="button"
          onClick={() => execCommand('insertOrderedList')}
          className="p-2 rounded hover:bg-gray-200 text-gray-700"
          title="Numbered List"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
          </svg>
        </button>
        <button
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          className="p-2 rounded hover:bg-gray-200 text-gray-700"
          title="Bullet List"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
          </svg>
        </button>
        
        <div className="border-l border-gray-400 h-6 mx-1"></div>
        
        <button
          type="button"
          onClick={() => execCommand('indent')}
          className="p-2 rounded hover:bg-gray-200 text-gray-700"
          title="Indent"
        >
          ¶
        </button>
        
        <div className="border-l border-gray-400 h-6 mx-1"></div>
        
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 rounded hover:bg-gray-200 text-gray-700"
          title="Insert Emoji"
        >
          😀
        </button>
        
        <div className="border-l border-gray-400 h-6 mx-1"></div>
        
        <button
          type="button"
          onClick={() => setShowLinkInput(!showLinkInput)}
          className="p-2 rounded hover:bg-gray-200 text-gray-700"
          title="Insert Link"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd"/>
          </svg>
        </button>
        
        <div className="border-l border-gray-400 h-6 mx-1"></div>
        
        <button
          type="button"
          onClick={() => setShowImageInput(!showImageInput)}
          className="p-2 rounded hover:bg-gray-200 text-gray-700"
          title="Insert Image"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
          </svg>
        </button>
        
        <div className="border-l border-gray-400 h-6 mx-1"></div>
        
        <button
          type="button"
          onClick={() => execCommand('justifyLeft')}
          className="p-2 rounded hover:bg-gray-200 text-gray-700"
          title="Align Left"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 8a1 1 0 011-1h8a1 1 0 110 2H4a1 1 0 01-1-1zM3 12a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h8a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
          </svg>
        </button>
        <button
          type="button"
          onClick={() => execCommand('justifyCenter')}
          className="p-2 rounded hover:bg-gray-200 text-gray-700"
          title="Align Center"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM5 8a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zM3 12a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM5 16a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd"/>
          </svg>
        </button>
        <button
          type="button"
          onClick={() => execCommand('justifyRight')}
          className="p-2 rounded hover:bg-gray-200 text-gray-700"
          title="Align Right"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM7 8a1 1 0 011-1h8a1 1 0 110 2H8a1 1 0 01-1-1zM3 12a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM7 16a1 1 0 011-1h8a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd"/>
          </svg>
        </button>
      </div>

      {/* Input Modals */}
      {showEmojiPicker && (
        <div className="absolute z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md max-h-64 overflow-y-auto">
          <div className="grid grid-cols-8 gap-1">
            {emojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => insertEmoji(emoji)}
                className="p-2 hover:bg-gray-100 rounded text-lg"
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowEmojiPicker(false)}
            className="mt-2 w-full px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      )}

      {showLinkInput && (
        <div className="absolute z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
          <h3 className="text-lg font-medium mb-2">Insert Link</h3>
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="Enter URL"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && insertLink()}
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={insertLink}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Insert
            </button>
            <button
              onClick={() => {
                setShowLinkInput(false);
                setLinkUrl('');
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showImageInput && (
        <div className="absolute z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
          <h3 className="text-lg font-medium mb-2">Insert Image</h3>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Enter image URL"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && insertImage()}
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={insertImage}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Insert
            </button>
            <button
              onClick={() => {
                setShowImageInput(false);
                setImageUrl('');
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="p-4 min-h-32 focus:outline-none bg-white prose max-w-none"
        dangerouslySetInnerHTML={{ __html: value }}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={{ minHeight: '150px' }}
      />
    </div>
  );
};

export default RichTextEditor;