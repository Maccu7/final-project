import { NavItem } from '@/types/interfaces/interface';
import { 
  DashboardIcon,
  TicketIcon,
  ClientsIcon,
  ProductIcon,
  ReportIcon,
  SettingsIcon 
} from '@/components/icons';


export const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: DashboardIcon },
  { name: 'Tickets', href: '/dashboard/tickets', icon: TicketIcon },
  { name: 'Clients', href: '/dashboard/clients', icon: ClientsIcon, adminOnly: true },
  { name: 'Products', href: '/dashboard/products', icon: ProductIcon, adminOnly: true },
  { name: 'Reports', href: '/dashboard/reports', icon: ReportIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: SettingsIcon },
];