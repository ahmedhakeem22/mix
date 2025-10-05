
import { ProfileTab } from './tabs/ProfileTab';
import { AdsTab } from './tabs/AdsTab';
import { FavoritesTab } from './tabs/FavoritesTab';
import { SimpleMessagesTab } from './tabs/SimpleMessagesTab';
import { NotificationsTab } from './tabs/NotificationsTab';
import { PromoteTab } from './tabs/PromoteTab';
import { StatisticsTab } from './tabs/StatisticsTab';
import Settings from './tabs/Settings'; 
import { PlaceholderTab } from './tabs/PlaceholderTab';

interface DashboardContentProps {
  activePage: string;
  selectedAd: string | null;
  setSelectedAd: (id: string | null) => void;
  promoteDialogOpen: boolean;
  setPromoteDialogOpen: (open: boolean) => void;
  deleteConfirmOpen: boolean;
  setDeleteConfirmOpen: (open: boolean) => void;
}

export function DashboardContent({
  activePage,
  selectedAd,
  setSelectedAd,
  promoteDialogOpen,
  setPromoteDialogOpen,
  deleteConfirmOpen,
  setDeleteConfirmOpen,
}: DashboardContentProps) {
  switch (activePage) {
    case 'profile':
      return <ProfileTab />;
    case 'ads':
      return (
        <AdsTab 
          onPromote={(id: number) => {
            setSelectedAd(id.toString());
            setPromoteDialogOpen(true);
          }}
          onDelete={(id: number) => {
            setSelectedAd(id.toString());
            setDeleteConfirmOpen(true);
          }}
        />
      );
    case 'favorites':
      return <FavoritesTab />;
    case 'messages':
      return <SimpleMessagesTab />;
    // case 'notifications':
    //   return <NotificationsTab />;
    case 'promote':
      return <PromoteTab />;
    // case 'statistics':
    //   return <StatisticsTab />;
    case 'settings':
      return <Settings title="الإعدادات" description="إعدادات الحساب" />;
    default:
      return <StatisticsTab />;
  }
}
