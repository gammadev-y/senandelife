import React, { useRef, useState, useEffect, useCallback } from 'react';
import { GrowingGround, Plant, GroundLogEntry, GrowingGroundPlant, GroundCalendarTask } from '../types';
import { GROWING_GROUND_LABELS, GROUND_LOG_ACTION_TYPES, MODULES, GROUND_LOG_ACTION_TYPE_ICONS } from '../constants';
import SectionCard from './SectionCard';
import EditableText from './EditableText';
import { MapPinIcon, SunIcon, ArchiveBoxIcon, DocumentTextIcon, UserCircleIcon, ListBulletIcon, PlusIcon, PhotoIcon, CalendarDaysIcon, TagIcon, SquaresPlusIcon, PencilIcon, SparklesIcon as OutlineSparklesIcon, CheckCircleIcon, TrashIcon, CheckIcon, ChevronLeftIcon, ChevronUpIcon, ChevronDownIcon, ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { convertFileToBase64, compressFileBeforeUpload } from '../utils/imageUtils';
import LoadingSpinner from './LoadingSpinner';
import { generateGroundImageWithAi } from '../services/geminiService';
import GroundStockIcon from './icons/GroundStockIcon';
import PlantStockIcon from './icons/PlantStockIcon';
import { produce } from 'https://esm.sh/immer@10.0.3';
import useImageDragAdjust from '../hooks/useImageDragAdjust';

interface GrowingGroundDetailViewProps {
  ground: GrowingGround | null;
  onUpdateGround: (groundId: string, updatedData: Partial<GrowingGround>) => void;
  setAppError: (error: string | null) => void;
  plants: Plant[];
  onOpenAddLogEntryModal: (groundId: string) => void;
  onOpenAddPlantToGroundModal: (groundId: string) => void;
  onOpenAddGroundCalendarTaskModal: (groundId: string) => void;
  onAiGenerateGroundTasks: (groundId: string) => Promise<void>;
  isLoadingAiForGroundTasks: boolean;
  onUpdateGroundTask: (groundId: string, taskId: string, updates: Partial<GroundCalendarTask>) => void;
  onDeleteGroundTask: (groundId: string, taskId: string) => void;
  moduleConfig: typeof MODULES[0];
  onDeselect?: () => void;
  isCompactView: boolean;
}

const GrowingGroundDetailView: React.FC<GrowingGroundDetailViewProps> = ({
  ground: initialGround, onUpdateGround, setAppError, plants,
  onOpenAddLogEntryModal, onOpenAddPlantToGroundModal,
  onOpenAddGroundCalendarTaskModal, onAiGenerateGroundTasks, isLoadingAiForGroundTasks,
  onUpdateGroundTask, onDeleteGroundTask, moduleConfig, onDeselect, isCompactView
}) => {
  const heroImageInputRef = useRef<HTMLInputElement>(null);

  const [isEditingGround, setIsEditingGround] = useState(false);
  const [editedGroundData, setEditedGroundData] = useState<GrowingGround | null>(initialGround ? JSON.parse(JSON.stringify(initialGround)) : null);

  
  const [showStockHeroIcon, setShowStockHeroIcon] = useState(false);
  const [isLoadingAiGroundImage, setIsLoadingAiGroundImage] = useState(false);

  const heroImageContainerRef = useRef<HTMLDivElement>(null);
  
  const [currentImageObjectPositionY, setCurrentImageObjectPositionY] = useState(initialGround?.image_object_position_y || 50);

  const { dragHandlers: heroImageDragHandlers } = useImageDragAdjust({
    initialPosition: currentImageObjectPositionY,
    onPositionChange: (newPosition) => {
        if (isEditingGround && editedGroundData) {
            setCurrentImageObjectPositionY(newPosition);
            setEditedGroundData(produce(draft => {
                if (draft) draft.image_object_position_y = newPosition;
            }));
        }
    },
    imageContainerRef: heroImageContainerRef,
  });


  useEffect(() => {
    if (initialGround) {
        setEditedGroundData(JSON.parse(JSON.stringify(initialGround)));
        setCurrentImageObjectPositionY(initialGround.image_object_position_y || 50);
        setShowStockHeroIcon(!initialGround.imageUrl);
    } else {
        setEditedGroundData(null);
    }
    if (!isEditingGround && initialGround) { 
        setCurrentImageObjectPositionY(initialGround.image_object_position_y || 50);
        setShowStockHeroIcon(!initialGround.imageUrl);
    }
  }, [initialGround, isEditingGround]);


  const handleManualImagePositionChange = (direction: 'up' | 'down' | 'reset') => {
    if (editedGroundData && isEditingGround) {
      let newPosition = currentImageObjectPositionY;
      const step = 5;
      if (direction === 'up') {
          newPosition = Math.max(0, currentImageObjectPositionY - step);
      } else if (direction === 'down') {
          newPosition = Math.min(100, currentImageObjectPositionY + step);
      } else if (direction === 'reset') {
          newPosition = 50;
      }
      setCurrentImageObjectPositionY(newPosition);
      setEditedGroundData(produce(draft => {
          if (draft) draft.image_object_position_y = newPosition;
      }));
    }
  };
  
  const handleDataFieldChange = useCallback((path: string, value: any) => {
    if (!isEditingGround || !editedGroundData) return;

    setEditedGroundData(produce(draft => {
        if (!draft) return;
        let current: any = draft;
        const keys = path.split('.');
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!current[key]) {
                current[key] = {};
            }
            current = current[key];
        }
        current[keys[keys.length - 1]] = value;
    }));
  }, [isEditingGround, editedGroundData]);

  const handleSave = () => {
    if (editedGroundData && initialGround) {
        onUpdateGround(initialGround.id, editedGroundData);
    }
    setIsEditingGround(false);
  };
  
  const handleCancel = () => {
    setIsEditingGround(false);
  };

  if (!initialGround) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">
        <GroundStockIcon className={`w-24 h-24 text-${moduleConfig.baseColorClass}-400 mb-6`} />
        <h2 className="text-3xl font-semibold text-slate-700 dark:text-slate-200 mb-2">{moduleConfig.name}</h2>
        <p className="text-lg">Select a ground from the list to view its details, or create a new one.</p>
      </div>
    );
  }
  
  return null; // Placeholder return, the logic seems incomplete and JSX is missing
};

export default GrowingGroundDetailView;