
import React, { useState, useRef, useEffect } from 'react';
import { SeasonalTip, SeasonalTipContentType, SeasonalTipInput, TipImage } from '../types';
import { MODULES } from '../constants';
import SectionCard from './SectionCard';
import EditableText from './EditableText';
import {
  LightBulbIcon, XMarkIcon, PencilIcon, CheckIcon, PhotoIcon, LinkIcon, DocumentTextIcon, TagIcon,
  ChevronLeftIcon, ChevronUpIcon, ChevronDownIcon, ArrowPathIcon, InformationCircleIcon, SparklesIcon
} from '@heroicons/react/24/outline';
import { convertFileToBase64 } from '../utils/imageUtils';
import LoadingSpinner from './LoadingSpinner';
import { generateSeasonalTipCoverImageWithAi } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import useImageDragAdjust from '../hooks/useImageDragAdjust'; 
import { useAuth } from '../../../../context/AuthContext';

interface SeasonalTipDetailViewProps {
  tip: SeasonalTip | null;
  onUpdateTip: (tipId: string, updatedData: Partial<SeasonalTipInput>) => void;
  setAppError: (error: string | null) => void;
  moduleConfig: typeof MODULES[0];
  onDeselect?: () => void;
  isCompactView: boolean;
}

const MAX_IMAGES_IN_DETAIL = 8;

const SeasonalTipDetailView: React.FC<SeasonalTipDetailViewProps> = ({
  tip: initialTip, onUpdateTip, setAppError, moduleConfig, onDeselect, isCompactView
}) => {
  const { user } = useAuth();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTipData, setEditedTipData] = useState<SeasonalTipInput | null>(null);
  const [isLoadingAiImage, setIsLoadingAiImage] = useState(false);
  const [showStockIcon, setShowStockIcon] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const imageContainerRef = useRef<HTMLDivElement>(null);

  const heroImageObjectPositionY = (isEditing ? editedTipData?.images?.[selectedImageIndex]?.object_position_y : initialTip?.images?.[selectedImageIndex]?.object_position_y) ?? 50;
  
  const { dragHandlers } = useImageDragAdjust({
    initialPosition: heroImageObjectPositionY,
    onPositionChange: (newPosition) => {
      if (isEditing && editedTipData?.images?.[selectedImageIndex]) {
        const newImages = [...editedTipData.images];
        newImages[selectedImageIndex] = { ...newImages[selectedImageIndex], object_position_y: newPosition };
        setEditedTipData(prev => ({ ...prev, images: newImages }) as SeasonalTipInput);
      }
    },
    imageContainerRef,
  });

  useEffect(() => {
    if (initialTip) {
        setEditedTipData({
            title: initialTip.title,
            description: initialTip.description,
            content_type: initialTip.content_type,
            source_url: initialTip.source_url,
            article_markdown_content: initialTip.article_markdown_content,
            images: initialTip.images || [],
            tags: initialTip.tags,
            author_name: initialTip.author_name,
        });
        setShowStockIcon(!initialTip.images || initialTip.images.length === 0);
        setSelectedImageIndex(0);
    } else {
        setEditedTipData(null);
    }
    if (!isEditing) {
        setShowStockIcon(!initialTip?.images || initialTip.images.length === 0);
        setSelectedImageIndex(0);
    }
    setIsEditing(false);
  }, [initialTip]);


  const currentDisplayTip = isEditing && editedTipData 
    ? { ...initialTip, ...editedTipData, id: initialTip?.id || '', created_at: initialTip?.created_at || '', updated_at: initialTip?.updated_at || '' } as SeasonalTip 
    : initialTip;
  
  const heroImageUrl = currentDisplayTip?.images?.[selectedImageIndex]?.url;

  const handleSaveField = (field: keyof SeasonalTipInput, value: any) => {
    if (!isEditing || !editedTipData) return;
    setEditedTipData(prev => ({ ...prev, [field]: value }) as SeasonalTipInput);
  };
  
  const handleImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && editedTipData && isEditing && editedTipData.images.length < MAX_IMAGES_IN_DETAIL) {
      try {
        setAppError(null);
        const base64 = await convertFileToBase64(file);
        const newImage: TipImage = { url: base64, object_position_y: 50 };
        setEditedTipData(prev => ({ ...prev, images: [...(prev?.images || []), newImage] }) as SeasonalTipInput);
        setShowStockIcon(false);
      } catch (err) {
        console.error("Error converting file to base64:", err);
        setAppError("Failed to update image. Please try another file.");
      }
    }
  };

  const handleAiGenerateCoverImage = async () => {
    if (!editedTipData || !isEditing) return;
    if (editedTipData.images.length >= MAX_IMAGES_IN_DETAIL) {
        setAppError(`You can have a maximum of ${MAX_IMAGES_IN_DETAIL} images.`);
        return;
    }
    const tipTitleForPrompt = editedTipData.title || 'Gardening Tip';
    setIsLoadingAiImage(true);
    setAppError(null);
    try {
      const generatedBase64Image = await generateSeasonalTipCoverImageWithAi(tipTitleForPrompt);
      if (generatedBase64Image) {
        const newImage: TipImage = { url: generatedBase64Image, object_position_y: 50 };
        setEditedTipData(prev => ({ ...prev, images: [...(prev?.images || []), newImage] }) as SeasonalTipInput);
        setShowStockIcon(false);
      } else {
        setAppError("AI image generation did not return an image for the tip.");
      }
    } catch (err) {
      console.error("Error generating tip cover image with AI:", err);
      setAppError(err instanceof Error ? err.message : "Failed to generate cover image with AI.");
    } finally {
      setIsLoadingAiImage(false);
    }
  };
  
  const handleManualImagePositionChange = (direction: 'up' | 'down' | 'reset') => {
    if (!isEditing || !editedTipData?.images?.[selectedImageIndex]) return;
    let newPosition = heroImageObjectPositionY;
    const step = 5;
    if (direction === 'up') newPosition = Math.max(0, newPosition - step);
    else if (direction === 'down') newPosition = Math.min(100, newPosition + step);
    else if (direction === 'reset') newPosition = 50;
    
    const newImages = [...editedTipData.images];
    newImages[selectedImageIndex] = { ...newImages[selectedImageIndex], object_position_y: newPosition };
    setEditedTipData(prev => ({ ...prev, images: newImages }) as SeasonalTipInput);
  };
  
  const handleRemoveImage = (indexToRemove: number) => {
    if (!isEditing || !editedTipData) return;
    const newImages = editedTipData.images.filter((_, index) => index !== indexToRemove);
    setEditedTipData(prev => ({ ...prev, images: newImages }) as SeasonalTipInput);
    if (selectedImageIndex >= newImages.length) {
        setSelectedImageIndex(Math.max(0, newImages.length - 1));
    }
  };
  
  const handleSaveChanges = () => {
    if (initialTip && editedTipData) {
      onUpdateTip(initialTip.id, editedTipData);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  if (!currentDisplayTip) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-white dark:bg-slate-800">
        <LightBulbIcon className={`w-24 h-24 text-${moduleConfig.baseColorClass}-400 mb-6`} />
        <h2 className="text-3xl font-semibold text-slate-700 dark:text-slate-200 mb-2">Seasonal Tips</h2>
        <p className="text-lg text-slate-500 dark:text-slate-400">Select a tip from the list or add a new one.</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-white dark:bg-slate-800 overflow-y-auto custom-scrollbar">
      {isCompactView && currentDisplayTip && onDeselect && !isEditing && (
        <button
          onClick={onDeselect}
          className={`absolute top-4 left-4 z-20 flex items-center px-3 py-1.5 text-xs font-medium bg-black/40 hover:bg-black/60 text-white rounded-full shadow-sm transition-colors focus:outline-none focus:ring-2 ring-white/50`}
          aria-label="Back to seasonal tips list"
        >
          <ChevronLeftIcon className="w-4 h-4 mr-1" />
          Back
        </button>
      )}

      <div className="relative">
        <div 
          ref={imageContainerRef} 
          className={`w-full h-64 md:h-80 relative group/imgcontrol bg-slate-200 dark:bg-slate-700 ${user && isEditing && heroImageUrl && !showStockIcon ? 'cursor-grab active:cursor-grabbing' : ''}`}
          {...(user && isEditing && heroImageUrl && !showStockIcon ? dragHandlers : {})}
        >
          {!showStockIcon && heroImageUrl && (
            <img
              src={heroImageUrl}
              alt={currentDisplayTip.title}
              className="w-full h-full object-cover pointer-events-none" 
              style={{ objectPosition: `50% ${heroImageObjectPositionY}%` }}
              onError={() => setShowStockIcon(true)}
            />
          )}
          {showStockIcon && (
            <div className="w-full h-full flex items-center justify-center">
              <LightBulbIcon className={`w-32 h-32 text-${moduleConfig.baseColorClass}-300 dark:text-${moduleConfig.baseColorClass}-600`} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

          {user && isEditing && heroImageUrl && !showStockIcon && (
             <div className="absolute top-1/2 -translate-y-1/2 right-4 z-10 flex flex-col space-y-2 opacity-0 group-hover/imgcontrol:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
                <button onClick={() => handleManualImagePositionChange('up')} title="Move image up" className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full shadow-md"><ChevronUpIcon className="w-5 h-5"/></button>
                <button onClick={() => handleManualImagePositionChange('reset')} title="Reset image position" className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full shadow-md"><ArrowPathIcon className="w-5 h-5"/></button>
                <button onClick={() => handleManualImagePositionChange('down')} title="Move image down" className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full shadow-md"><ChevronDownIcon className="w-5 h-5"/></button>
             </div>
          )}
        </div>
        
        {user && (
            <div className="absolute top-4 right-4 z-20">
            {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="p-2.5 bg-black/50 hover:bg-black/70 text-white rounded-full shadow-lg transition-all" aria-label="Edit tip">
                <PencilIcon className="w-5 h-5" />
                </button>
            ) : (
                <div className="flex space-x-2">
                <button onClick={handleSaveChanges} className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg transition-all" aria-label="Save changes">
                    <CheckIcon className="w-5 h-5" />
                </button>
                <button onClick={handleCancelEdit} className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-all" aria-label="Cancel edit">
                    <XMarkIcon className="w-5 h-5" />
                </button>
                </div>
            )}
            </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
          <EditableText 
            currentValue={currentDisplayTip.title} 
            onSave={val => handleSaveField('title', val)} 
            labelText="" 
            textClassName="text-3xl md:text-4xl font-bold text-white shadow-lg" 
            inputFieldClass="text-3xl md:text-4xl font-bold" 
            disabled={!isEditing || !user}
          />
          <EditableText 
            currentValue={currentDisplayTip.description || ''}
            onSave={val => handleSaveField('description', val)}
            labelText=""
            textarea
            textClassName="text-md text-slate-200 mt-1 line-clamp-2"
            inputFieldClass="text-md"
            disabled={!isEditing || !user}
            placeholder="Short summary..."
          />
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-5 max-w-4xl mx-auto pb-24">
        <SectionCard title="Images" icon={PhotoIcon}>
            <div className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 ${isEditing ? 'p-2 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg' : ''}`}>
                {currentDisplayTip.images?.map((image, index) => (
                    <div key={image.url + index} className="relative group aspect-square">
                        <img 
                            src={image.url} 
                            alt={`Tip image ${index+1}`} 
                            className={`w-full h-full object-cover rounded-lg cursor-pointer transition-all duration-200 ${selectedImageIndex === index ? 'ring-2 ring-offset-2 ring-emerald-500' : 'opacity-70 hover:opacity-100'}`}
                            onClick={() => setSelectedImageIndex(index)}
                        />
                        {user && isEditing && (
                            <button
                                onClick={() => handleRemoveImage(index)}
                                className="absolute -top-1.5 -right-1.5 p-1 bg-red-600 text-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label={`Remove image ${index+1}`}
                            >
                                <XMarkIcon className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                ))}
                {user && isEditing && (currentDisplayTip.images?.length || 0) < MAX_IMAGES_IN_DETAIL && (
                    <div className="flex flex-col gap-2 items-center justify-center aspect-square border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg">
                         <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImageFileChange} className="hidden" id={`tipCoverImageUpload-${currentDisplayTip.id}`} />
                        <button onClick={() => imageInputRef.current?.click()} className="p-2 text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors" title="Upload Image">
                           <PhotoIcon className="w-6 h-6"/>
                        </button>
                         <button onClick={handleAiGenerateCoverImage} disabled={isLoadingAiImage} className="p-2 text-slate-500 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors" title="Generate with AI">
                           {isLoadingAiImage ? <LoadingSpinner size="sm"/> : <SparklesIcon className="w-6 h-6"/>}
                        </button>
                    </div>
                )}
            </div>
        </SectionCard>

        <SectionCard title="Tip Details" icon={InformationCircleIcon}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
            <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Content Type</label>
                {isEditing ? (
                    <select 
                        value={editedTipData?.content_type || 'url'}
                        onChange={e => handleSaveField('content_type', e.target.value as SeasonalTipContentType)}
                        className={`w-full p-3 bg-slate-100 dark:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-${moduleConfig.baseColorClass}-500 dark:focus:ring-${moduleConfig.baseColorClass}-400 focus:border-${moduleConfig.baseColorClass}-500 dark:focus:border-${moduleConfig.baseColorClass}-400 text-sm`}
                        disabled={!user}
                    >
                        <option value="url">External URL</option>
                        <option value="article">Jarden Article</option>
                    </select>
                ) : (
                    <p className="text-sm p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg min-h-[2.5em] flex items-center">{currentDisplayTip.content_type === 'url' ? 'External URL' : 'Jarden Article'}</p>
                )}
            </div>
            {currentDisplayTip.content_type === 'url' && (
              <EditableText 
                currentValue={currentDisplayTip.source_url || ''} 
                onSave={val => handleSaveField('source_url', val)} 
                labelText="Source URL" 
                disabled={!isEditing || !user}
                textSize="text-sm"
                placeholder="https://example.com/gardening-tip"
              />
            )}
          </div>
           <EditableText 
            currentValue={currentDisplayTip.tags?.join(', ') || ''}
            onSave={val => handleSaveField('tags', val.split(',').map(t => t.trim()).filter(t => t))}
            labelText="Tags (comma-separated)"
            disabled={!isEditing || !user}
            textSize="text-sm"
            placeholder="e.g., spring, pruning, tomatoes"
          />
          <EditableText 
            currentValue={currentDisplayTip.author_name || ''}
            onSave={val => handleSaveField('author_name', val)}
            labelText="Author"
            disabled={!isEditing || !user}
            textSize="text-sm"
            placeholder="Jarden Team"
          />
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Published At</label>
            <p className="text-sm p-2">{new Date(currentDisplayTip.published_at || currentDisplayTip.created_at).toLocaleString()}</p>
          </div>
        </SectionCard>

        {currentDisplayTip.content_type === 'url' && currentDisplayTip.source_url && (
          <SectionCard title="External Resource" icon={LinkIcon}>
            <a 
              href={currentDisplayTip.source_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`text-${moduleConfig.baseColorClass}-600 dark:text-${moduleConfig.baseColorClass}-400 hover:underline break-all text-sm font-medium`}
            >
              {currentDisplayTip.source_url}
            </a>
            <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">Click the link to view the external content.</p>
          </SectionCard>
        )}

        {currentDisplayTip.content_type === 'article' && (
          <SectionCard title="Article Content" icon={DocumentTextIcon}>
            {isEditing ? (
              <EditableText 
                currentValue={editedTipData?.article_markdown_content || ''}
                onSave={val => handleSaveField('article_markdown_content', val)}
                labelText=""
                textarea
                disabled={!isEditing || !user}
                textSize="text-sm"
                placeholder="Write your article content here using Markdown..."
                inputContainerClassName={`bg-slate-100 dark:bg-slate-700/50 rounded-lg focus-within:ring-2 focus-within:ring-${moduleConfig.baseColorClass}-500`}
                inputFieldClass="w-full p-3 bg-transparent focus:outline-none min-h-[200px]"
              />
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none p-2 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                {currentDisplayTip.article_markdown_content ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {currentDisplayTip.article_markdown_content}
                  </ReactMarkdown>
                ) : (
                  <p className="italic text-slate-500 dark:text-slate-400">No article content yet.</p>
                )}
              </div>
            )}
          </SectionCard>
        )}
      </div>
    </div>
  );
};

export default SeasonalTipDetailView;