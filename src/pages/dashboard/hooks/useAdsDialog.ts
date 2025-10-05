
import { useState } from 'react';

export function useAdsDialog() {
  const [selectedAd, setSelectedAd] = useState<string | null>(null);
  const [promoteDialogOpen, setPromoteDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  
  return {
    selectedAd,
    setSelectedAd,
    promoteDialogOpen,
    setPromoteDialogOpen,
    deleteConfirmOpen,
    setDeleteConfirmOpen
  };
}
