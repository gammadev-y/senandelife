
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { UserCircleIcon, PencilIcon, CameraIcon, SparklesIcon as AiSparklesIcon, ShieldCheckIcon, ArrowPathIcon as RefreshIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from './LoadingSpinner';
import { generateAvatarImageWithAi } from '../services/geminiService';
import { uploadBase64Image } from '../services/supabaseService'; // Not directly used here, but for context
import { convertFileToBase64, compressFileBeforeUpload } from '../utils/imageUtils';

const ProfilePage: React.FC = () => {
  const { user, profile, updateProfileData, updateUserPassword, loading: authLoading } = useAuth();
  
  const [fullName, setFullName] = useState('');
  const [isEditingFullName, setIsEditingFullName] = useState(false);
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null); // Stores the selected file object for re-compression if needed
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null); // Stores base64 for preview and for sending to Supabase
  const [newAvatarGenerated, setNewAvatarGenerated] = useState(false); // Tracks if preview is from new upload/AI

  const [isLoading, setIsLoading] = useState(false); // General loading for profile updates
  const [isAvatarLoading, setIsAvatarLoading] = useState(false); // Specific loading for avatar operations

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setAvatarPreview(profile.avatar_url || null);
      setNewAvatarGenerated(false); 
    }
  }, [profile]);

  const handleFullNameSave = async () => {
    if (!fullName.trim()) {
      setError("Full name cannot be empty.");
      return;
    }
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);
    try {
      await updateProfileData({ full_name: fullName.trim() });
      setSuccessMessage("Full name updated successfully!");
      setIsEditingFullName(false);
    } catch (err: any) {
      setError(err.message || "Failed to update full name.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setError(null);
      setIsAvatarLoading(true);
      try {
        const compressedFile = await compressFileBeforeUpload(file, 0.5); // Compress to 0.5MB for avatars
        const base64 = await convertFileToBase64(compressedFile);
        setAvatarFile(compressedFile); // Store the (potentially compressed) file
        setAvatarPreview(base64);
        setNewAvatarGenerated(true);
      } catch (err) {
        console.error("Error processing avatar file:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to process image.";
        setError(errorMessage);
        setAvatarFile(null);
        setAvatarPreview(profile?.avatar_url || null); // Revert preview
        setNewAvatarGenerated(false);
      } finally {
        setIsAvatarLoading(false);
      }
    }
  };

  const handleGenerateAIAvatar = async () => {
    setError(null);
    setSuccessMessage(null);
    setIsAvatarLoading(true);
    try {
        const generatedBase64 = await generateAvatarImageWithAi(fullName || user?.email || "User");
        if (generatedBase64) {
            setAvatarPreview(generatedBase64); // This is already base64
            setAvatarFile(null); // Clear any selected file
            setNewAvatarGenerated(true);
            setSuccessMessage("AI avatar generated. Click 'Save Avatar' to apply.");
        } else {
            setError("AI avatar generation failed to return an image.");
        }
    } catch (err: any) {
        setError(err.message || "Failed to generate AI avatar.");
    } finally {
        setIsAvatarLoading(false);
    }
  };
  
  const handleSaveAvatar = async () => {
    if (!newAvatarGenerated || !avatarPreview) { // avatarPreview will be base64
      setError("No new avatar to save. Select a file or generate an AI avatar first.");
      return;
    }
    
    setError(null);
    setSuccessMessage(null);
    setIsAvatarLoading(true);
    
    try {
      // avatarPreview is already the base64 string (either from file conversion or AI)
      // The `updateProfileData` and subsequently `updateSupabaseUserProfile` will handle
      // detecting this base64 string and uploading it.
      await updateProfileData({ avatar_url: avatarPreview }); 
      
      setSuccessMessage("Avatar updated successfully!");
      setAvatarFile(null); 
      setNewAvatarGenerated(false);
    } catch (err: any) {
      setError(err.message || "Failed to save avatar.");
    } finally {
      setIsAvatarLoading(false);
    }
  };


  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    }
    setIsChangingPassword(true);
    try {
      await updateUserPassword(newPassword);
      setPasswordSuccess("Password updated successfully!");
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setPasswordError(err.message || "Failed to update password.");
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  const inputBaseClass = "w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none sm:text-sm bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400";
  const inputFocusClass = "focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 dark:focus:ring-emerald-400 dark:focus:border-emerald-400";
  const buttonClass = "px-4 py-2 text-sm font-medium rounded-lg shadow-sm transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70";
  const primaryButtonClass = `${buttonClass} text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600`;
  const secondaryButtonClass = `${buttonClass} text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500`;


  if (authLoading || !profile || !user) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner size="lg"/></div>;
  }

  const isEmailProvider = user.app_metadata.provider === 'email';

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-8 text-slate-800 dark:text-slate-100">
      <h1 className="text-3xl font-bold text-center">Your Profile</h1>

      {error && <p className="text-red-600 bg-red-100 dark:bg-red-900/30 p-3 rounded-lg text-sm text-center animate-pulse">{error}</p>}
      {successMessage && <p className="text-green-600 bg-green-50 dark:bg-green-900/30 p-3 rounded-lg text-sm text-center animate-pulse">{successMessage}</p>}
      
      {/* Avatar Section */}
      <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg text-center space-y-4">
        <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden ring-4 ring-emerald-500/30 dark:ring-emerald-400/30">
          {isAvatarLoading && !avatarPreview && <div className="w-full h-full flex items-center justify-center"><LoadingSpinner size="md"/></div> }
          {avatarPreview && !isAvatarLoading && (
            <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
          )}
          {!avatarPreview && !isAvatarLoading && (
            <UserCircleIcon className="w-full h-full text-slate-400 dark:text-slate-500 p-1" />
          )}
        </div>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
            <button onClick={() => fileInputRef.current?.click()} disabled={isAvatarLoading} className={`${secondaryButtonClass} flex items-center`}>
                {isAvatarLoading && avatarFile ? <LoadingSpinner size="sm"/> : <ArrowUpTrayIcon className="w-5 h-5 mr-2" />} Upload Image
            </button>
            <input type="file" id="avatarUpload" ref={fileInputRef} onChange={handleAvatarFileChange} accept="image/*" className="hidden" />
            
            <button onClick={handleGenerateAIAvatar} disabled={isAvatarLoading} className={`${secondaryButtonClass} flex items-center`}>
                {isAvatarLoading && !avatarFile ? <LoadingSpinner size="sm" /> : <AiSparklesIcon className="w-5 h-5 mr-2" />}
                AI Avatar
            </button>
        </div>
        {newAvatarGenerated && (
             <button onClick={handleSaveAvatar} disabled={isAvatarLoading} className={`${primaryButtonClass} flex items-center mx-auto`}>
                {isAvatarLoading ? <LoadingSpinner size="sm" /> : <RefreshIcon className="w-5 h-5 mr-2" />}
                Save Avatar
            </button>
        )}
      </div>

      {/* Full Name Section */}
      <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg space-y-3">
        <h2 className="text-xl font-semibold">Personal Information</h2>
        <div className="flex items-center justify-between">
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-slate-500 dark:text-slate-400">Email</label>
            <p className="text-sm">{user.email}</p>
          </div>
        </div>
        <div>
          <label htmlFor="fullNameDisplay" className="block text-xs font-medium text-slate-500 dark:text-slate-400">Full Name</label>
          {isEditingFullName ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                id="fullNameEdit"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`${inputBaseClass} ${inputFocusClass} flex-grow`}
              />
              <button onClick={handleFullNameSave} disabled={isLoading} className={primaryButtonClass}>
                {isLoading ? <LoadingSpinner size="sm" /> : 'Save'}
              </button>
              <button onClick={() => { setIsEditingFullName(false); setFullName(profile.full_name || ''); setError(null);}} className={secondaryButtonClass}>Cancel</button>
            </div>
          ) : (
            <div className="flex items-center justify-between mt-1">
              <p id="fullNameDisplay" className="text-sm">{profile.full_name || <span className="italic text-slate-500 dark:text-slate-400">Not set</span>}</p>
              <button onClick={() => setIsEditingFullName(true)} className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-700/50 rounded-full">
                <PencilIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {isEmailProvider && (
        <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg space-y-4">
          <h2 className="text-xl font-semibold flex items-center"><ShieldCheckIcon className="w-6 h-6 mr-2 text-emerald-600 dark:text-emerald-400"/> Change Password</h2>
           {passwordError && <p className="text-red-500 bg-red-100 dark:bg-red-900/30 p-2 rounded-lg text-xs">{passwordError}</p>}
           {passwordSuccess && <p className="text-green-600 bg-green-50 dark:bg-green-900/30 p-2 rounded-lg text-xs">{passwordSuccess}</p>}
          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <label htmlFor="newPassword" className="block text-xs font-medium text-slate-500 dark:text-slate-400">New Password</label>
              <input type="password" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={`${inputBaseClass} ${inputFocusClass} mt-1`} required />
            </div>
            <div>
              <label htmlFor="confirmNewPassword" className="block text-xs font-medium text-slate-500 dark:text-slate-400">Confirm New Password</label>
              <input type="password" id="confirmNewPassword" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className={`${inputBaseClass} ${inputFocusClass} mt-1`} required />
            </div>
            <button type="submit" disabled={isChangingPassword} className={`${primaryButtonClass} w-full sm:w-auto`}>
              {isChangingPassword ? <LoadingSpinner size="sm" /> : 'Update Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
