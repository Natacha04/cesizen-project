import type { SvgIconComponent } from "@mui/icons-material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import HomeIcon from "@mui/icons-material/Home";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import MenuBookIcon from "@mui/icons-material/MenuBook";

export type PublicHeaderItem = {
  label: string;
  icon: SvgIconComponent;
};

export const publicHeaderItems: PublicHeaderItem[] = [
  { label: "Accueil", icon: HomeIcon },
  { label: "Emotion", icon: InsertEmoticonIcon },
  { label: "Articles", icon: MenuBookIcon },
  { label: "Compte", icon: AccountCircleIcon },
];
