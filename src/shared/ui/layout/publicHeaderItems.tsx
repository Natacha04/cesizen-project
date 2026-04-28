import type { SvgIconComponent } from "@mui/icons-material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import HomeIcon from "@mui/icons-material/Home";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import MenuBookIcon from "@mui/icons-material/MenuBook";

export type PublicHeaderItem = {
  label: string;
  icon: SvgIconComponent;
  href: string;
};

export const publicHeaderItems: PublicHeaderItem[] = [
  { label: "Accueil", icon: HomeIcon, href: "/" },
  { label: "Emotion", icon: InsertEmoticonIcon, href: "/emotions/tracker" },
  { label: "Articles", icon: MenuBookIcon, href: "/articles" },
  { label: "Compte", icon: AccountCircleIcon, href: "/profil" },
];
