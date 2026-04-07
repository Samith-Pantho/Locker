const { useState, useEffect } = React;
const e = React.createElement;

import { FolderTable } from '../folders/FolderTable.js';
import { LockModal } from '../folders/LockModal.js';
import { UnlockModal } from '../folders/UnlockModal.js';
import { EmptyState } from '../folders/EmptyState.js';

export function HomeView({ showAlert, searchQuery, settings }) {
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showLockModal, setShowLockModal] = useState(false);
    const [showUnlockModal, setShowUnlockModal] = useState(null);
    const [path, setPath] = useState('');

    useEffect(() => {
        refreshFolders();
    }, []);

    const refreshFolders = () => {
        window.pywebview.api.get_folders().then(res => {
            setFolders(res);
            setLoading(false);
        });
    };

    const handleSelectFolder = async () => {
        const res = await window.pywebview.api.select_folder();
        if (res) {
            setPath(res);
            setShowLockModal(true);
        }
    };

    const handleLock = async (password) => {
        setIsProcessing(true);
        try {
            const res = await window.pywebview.api.lock_folder(path, password);
            if (res.success) {
                showAlert({ type: 'success', title: 'Folder Secured', text: 'You have successfully encrypted the folder.' });
                setShowLockModal(false);
                setPath('');
                refreshFolders();
            } else showAlert({ type: 'error', title: 'Lock Failed', text: res.error });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUnlock = async (password) => {
        setIsProcessing(true);
        try {
            const res = await window.pywebview.api.unlock_folder(showUnlockModal.path, password);
            if (res.success) {
                showAlert({ type: 'success', title: 'Folder Unlocked', text: 'Files have been restored to their original state.' });
                setShowUnlockModal(null);
                refreshFolders();
            } else showAlert({ type: 'error', title: 'Unlock Failed', text: res.error });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRevoke = async (folder) => {
        setIsProcessing(true);
        try {
            const res = await window.pywebview.api.revoke_protection(folder.path);
            if (res.success) {
                showAlert({ type: 'success', title: 'Protection Revoked', text: 'Folder is no longer tracked and metadata has been removed.' });
                refreshFolders();
            } else showAlert({ type: 'error', title: 'Revoke Failed', text: res.error });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRelock = async (folder) => {
        setIsProcessing(true);
        try {
            const res = await window.pywebview.api.relock_folder(folder.path);
            if (res.success) {
                showAlert({ type: 'success', title: 'Folder Locked', text: 'Folder has been secured again.' });
                refreshFolders();
            } else showAlert({ type: 'error', title: 'Lock Failed', text: res.error });
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) return e('div', { className: 'loading-container' },
        e('div', { className: 'spinner' }),
        e('div', { className: 'loading-text' }, 'Loading vault...')
    );

    const filteredFolders = folders.filter(f => 
        !searchQuery || 
        (f.name && f.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
        (f.path && f.path.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return e('div', { className: 'view-container' },
        isProcessing && e('div', { className: 'loading-overlay' },
            e('div', { className: 'spinner-container' },
                e('div', { className: 'spinner' }),
                e('div', { className: 'loading-text' }, 'Securing your data... Please wait.')
            )
        ),
        
        e('div', { className: 'view-header', style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
            e('div', null,
                e('h1', { className: 'view-title' }, 'Managed Folders'),
                e('p', { className: 'view-subtitle' }, 'View and manage your secured directories.')
            ),
            e('button', { className: 'btn btn-primary', onClick: handleSelectFolder }, '+ Lock Folder')
        ),
        
        folders.length > 0 
            ? (filteredFolders.length > 0 
                ? e(FolderTable, { folders: filteredFolders, onUnlock: setShowUnlockModal, onRevoke: handleRevoke, onRelock: handleRelock })
                : e('div', { className: 'empty-state card', style: { textAlign: 'center', padding: '60px', color: 'var(--text-muted)' } }, 'No folders match your search query.'))
            : e(EmptyState, { onAction: handleSelectFolder }),

        showLockModal && e(LockModal, { 
            path, 
            settings,
            onLock: handleLock, 
            onCancel: () => setShowLockModal(false),
            onChangeFolder: handleSelectFolder
        }),
        
        showUnlockModal && e(UnlockModal, {
            folder: showUnlockModal,
            onUnlock: handleUnlock,
            onCancel: () => setShowUnlockModal(null)
        })
    );
}
