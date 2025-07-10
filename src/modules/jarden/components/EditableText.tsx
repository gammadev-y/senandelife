import React, { useState, useEffect, useCallback } from 'react';

interface EditableTextProps {
  currentValue: string; // Renamed from initialValue
  onSave: (newValue: string) => void;
  labelText?: string; 
  textarea?: boolean; 
  placeholder?: string;
  textClassName?: string;
  inputContainerClassName?: string; 
  inputFieldClass?: string; // Renamed from inputElementClassName
  disabled?: boolean;
  textSize?: 'text-sm' | 'text-base' | 'text-lg';
}

const EditableText: React.FC<EditableTextProps> = ({
  currentValue, // Renamed from initialValue
  onSave,
  labelText, 
  textarea = false,
  placeholder = "Enter value...",
  textClassName = "", 
  inputContainerClassName = "bg-slate-200 dark:bg-slate-700 rounded-lg focus-within:ring-2 focus-within:ring-emerald-500 dark:focus-within:ring-emerald-400",
  inputFieldClass = "w-full p-3 bg-transparent focus:outline-none text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400", // Renamed
  disabled = false,
  textSize = 'text-sm'
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingText, setEditingText] = useState(currentValue); // Renamed from value
  const [originalValue, setOriginalValue] = useState(currentValue); // Renamed from initialValue (internal state)

  useEffect(() => {
    setEditingText(currentValue);
    setOriginalValue(currentValue);
  }, [currentValue]);

  const handleSave = useCallback(() => {
    if (editingText !== originalValue) {
      onSave(editingText);
    }
    setIsEditing(false);
  }, [editingText, originalValue, onSave]);

  const handleCancel = useCallback(() => {
    setEditingText(originalValue);
    setIsEditing(false);
  }, [originalValue]);

  if (disabled) {
    return (
      <div className="w-full py-1">
        {labelText && <label className={`block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1`}>{labelText}</label>}
        <p className={`${textSize} ${textClassName} whitespace-pre-wrap break-words text-slate-500 dark:text-slate-400 py-2`}>{currentValue || placeholder}</p>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="w-full py-1">
        {labelText && <label className={`block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1`}>{labelText}</label>}
        <div className={`${inputContainerClassName} transition-colors`}>
            {textarea ? (
            <textarea
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                autoFocus
                placeholder={placeholder}
                rows={4}
                className={`${textSize} ${inputFieldClass} resize-none leading-relaxed`} // Renamed
                onBlur={(e) => {
                    if (!e.relatedTarget || !['editable-save-button', 'editable-cancel-button'].includes((e.relatedTarget as HTMLElement).dataset.role || '')) {
                        handleSave();
                    }
                }}
            />
            ) : (
            <input
                type="text"
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                autoFocus
                placeholder={placeholder}
                className={`${textSize} ${inputFieldClass} leading-relaxed`} // Renamed
                onBlur={(e) => {
                    if (!e.relatedTarget || !['editable-save-button', 'editable-cancel-button'].includes((e.relatedTarget as HTMLElement).dataset.role || '')) {
                        handleSave();
                    }
                }}
            />
            )}
        </div>
        <div className="mt-2.5 flex justify-end space-x-2">
          <button
            data-role="editable-cancel-button"
            onClick={handleCancel}
            className="px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-800 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            Cancel
          </button>
          <button
            data-role="editable-save-button"
            onClick={handleSave}
            className="px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-800 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full group cursor-pointer py-1" onClick={() => setIsEditing(true)}>
      {labelText && <label className={`block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400`}>{labelText}</label>}
      <div className={`p-3 rounded-lg group-hover:bg-slate-200 dark:group-hover:bg-slate-700/60 transition-colors min-h-[2.5em] flex items-center ${!currentValue && 'italic'}`}>
        <p className={`${textSize} ${textClassName} whitespace-pre-wrap break-words text-slate-800 dark:text-slate-100 group-hover:text-slate-900 dark:group-hover:text-white`}>
            {currentValue || <span className="text-slate-400 dark:text-slate-500">{placeholder}</span>}
        </p>
      </div>
    </div>
  );
};

export default EditableText;