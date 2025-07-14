

import React, { useState, useRef } from 'react';
import { SeasonalTipInput, SeasonalTipContentType, TipImage } from '../types';
import { XMarkIcon, PhotoIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { convertFileToBase64 } from '../utils/imageUtils';
import { MODULES } from '../constants';
import LoadingSpinner from './LoadingSpinner';

interface AddNewSeasonalTipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tipInput: SeasonalTipInput) => Promise<any>;
  moduleConfig: typeof MODULES[0];
}

const MAX_IMAGES = 5;

const AddNewSeasonalTipModal: React.FC<AddNewSeasonalTipModalProps> = ({ isOpen, onClose, onSave, moduleConfig }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentType, setContentType] = useState<SeasonalTipContentType>('url');
  const [sourceUrl, setSourceUrl] = useState('');
  const [articleMarkdownContent, setArticleMarkdownContent] = useState('');
  const [images, setImages] = useState<TipImage[]>([]);
  const [tags, setTags] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && images.length < MAX_IMAGES) {
      try {
        const base64 = await convertFileToBase64(file);
        setImages(prev => [...prev, { url: base64, object_position_y: 50 }]);
        setError(null); 
      } catch (err) {
        console.error("Error converting file to base64:", err);
        setError("Failed to load image. Please try another file.");
      }
    } else if (images.length >= MAX_IMAGES) {
        setError(`You can upload a maximum of ${MAX_IMAGES} images.`);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const clearForm = () => {
    setTitle('');
    setDescription('');
    setContentType('url');
    setSourceUrl('');
    setArticleMarkdownContent('');
    setImages([]);
    setTags('');
    setAuthorName('');
    setError(null);
    setIsSaving(false);
    if(fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    clearForm();
    onClose();
  };
  
  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (contentType === 'url' && !sourceUrl.trim()) {
        setError("Source URL is required for URL type tips.");
        return;
    }
     try {
        if (contentType === 'url' && sourceUrl.trim()) new URL(sourceUrl.trim());
    } catch (_) {
        setError("Invalid Source URL format.");
        return;
    }

    setError(null);
    setIsSaving(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        content_type: contentType,
        source_url: contentType === 'url' ? sourceUrl.trim() : undefined,
        article_markdown_content: contentType === 'article' ? articleMarkdownContent.trim() : undefined,
        images: images,
        tags: tags.split(',').map(t => t.trim()).filter(t => t) || undefined,
        author_name: authorName.trim() || undefined,
      });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };
  
  const inputBaseClass = "w-full px-3 py-2.5 border-0 border-b-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none sm:text-sm transition-colors";
  const inputFocusClass = `focus:border-${moduleConfig.baseColorClass}-500 dark:focus:border-${moduleConfig.baseColorClass}-400 focus:ring-0 focus:bg-slate-50 dark:focus:bg-slate-600/50`;
  const inputErrorClass = "border-red-500 dark:border-red-400";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:hidden" aria-modal="true" role="dialog">
      <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl shadow-xl w-full max-w-lg transform transition-all max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-medium text-slate-800 dark:text-slate-100">Add New Seasonal Tip</h2>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {error && <p className="text-red-600 dark:text-red-400 text-sm mb-3 p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">{error}</p>}

        <div className="space-y-4 flex-grow overflow-y-auto custom-scrollbar pr-2">
          <div>
            <label htmlFor="tipTitle" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input type="text" id="tipTitle" value={title} onChange={(e) => setTitle(e.target.value)} className={`${inputBaseClass} ${title.trim() || !error ? inputFocusClass : inputErrorClass} rounded-t-lg`} required />
          </div>
          <div>
            <label htmlFor="tipDescription" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Description (Short Summary)</label>
            <textarea id="tipDescription" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={`${inputBaseClass} ${inputFocusClass} rounded-t-lg leading-relaxed`} />
          </div>
          <div>
            <label htmlFor="tipContentType" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Content Type</label>
            <select id="tipContentType" value={contentType} onChange={(e) => setContentType(e.target.value as SeasonalTipContentType)} className={`${inputBaseClass} ${inputFocusClass} rounded-lg appearance-none`}>
              <option value="url">External URL</option>
              <option value="article">Jarden Article (Markdown)</option>
            </select>
          </div>

          {contentType === 'url' && (
            <div>
              <label htmlFor="tipSourceUrl" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Source URL <span className="text-red-500">*</span>
              </label>
              <input type="url" id="tipSourceUrl" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} className={`${inputBaseClass} ${sourceUrl.trim() || !error ? inputFocusClass : inputErrorClass} rounded-t-lg`} placeholder="https://example.com/tip" required={contentType === 'url'}/>
            </div>
          )}

          {contentType === 'article' && (
            <div>
              <label htmlFor="tipArticleContent" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Article Content (Markdown)</label>
              <textarea id="tipArticleContent" value={articleMarkdownContent} onChange={(e) => setArticleMarkdownContent(e.target.value)} rows={6} className={`${inputBaseClass} ${inputFocusClass} rounded-t-lg leading-relaxed`} placeholder="Write your article here using Markdown..." />
            </div>
          )}
          
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Images (up to {MAX_IMAGES})</label>
            <div className="mt-1 p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-2">
                    {images.map((image, index) => (
                        <div key={index} className="relative group aspect-square">
                            <img src={image.url} alt={`Preview ${index+1}`} className="w-full h-full rounded-lg object-cover shadow-sm" />
                            <button
                                onClick={() => handleRemoveImage(index)}
                                className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label={`Remove image ${index+1}`}
                            >
                                <XMarkIcon className="w-3 h-3"/>
                            </button>
                        </div>
                    ))}
                    {images.length < MAX_IMAGES && (
                         <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className={`aspect-square w-full rounded-lg bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors`}
                            aria-label="Add new image"
                         >
                            <ArrowUpTrayIcon className="w-8 h-8" />
                        </button>
                    )}
                </div>
                 <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="hidden"
                    id="tipCoverImageUploadModal"
                />
            </div>
          </div>

          <div>
            <label htmlFor="tipTags" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Tags (comma-separated)</label>
            <input type="text" id="tipTags" value={tags} onChange={(e) => setTags(e.target.value)} className={`${inputBaseClass} ${inputFocusClass} rounded-t-lg`} placeholder="e.g., spring, soil, beginner tips" />
          </div>
          <div>
            <label htmlFor="tipAuthor" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Author Name (Optional)</label>
            <input type="text" id="tipAuthor" value={authorName} onChange={(e) => setAuthorName(e.target.value)} className={`${inputBaseClass} ${inputFocusClass} rounded-t-lg`} placeholder="Jarden Contributor" />
          </div>

        </div>

        <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSaving}
            className={`px-4 py-2 text-sm font-medium text-${moduleConfig.baseColorClass}-700 dark:text-${moduleConfig.baseColorClass}-300 hover:bg-${moduleConfig.baseColorClass}-100 dark:hover:bg-${moduleConfig.baseColorClass}-700/30 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-${moduleConfig.baseColorClass}-400 disabled:opacity-70`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className={`min-w-[110px] px-6 py-2 text-sm font-medium text-white bg-${moduleConfig.baseColorClass}-600 hover:bg-${moduleConfig.baseColorClass}-700 dark:bg-${moduleConfig.baseColorClass}-500 dark:hover:bg-${moduleConfig.baseColorClass}-600 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-800 focus:ring-${moduleConfig.baseColorClass}-500 disabled:opacity-70 flex justify-center items-center`}
          >
            {isSaving ? <LoadingSpinner size="sm" color="text-white" /> : 'Save Tip'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNewSeasonalTipModal;
