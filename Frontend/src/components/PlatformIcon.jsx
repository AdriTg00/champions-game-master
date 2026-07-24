import { Gamepad2, Monitor, Smartphone } from "lucide-react";

export default function PlatformIcon({ name }) {
  const label = name.toLowerCase();
  let Icon = Gamepad2;
  if (label.includes("pc")) Icon = Monitor;
  else if (label.includes("mobile")) Icon = Smartphone;

  return (
    <span className="platform-icon" title={name}>
      <Icon size={12} />
      {name}
    </span>
  );
}
