import Image from "next/image";

interface UserProfileCardProps {
  schoolName: string;
  location: string;
  avatarUrl?: string;
}

export function UserProfileCard({ 
  schoolName, 
  location, 
  avatarUrl = "/avatar-placeholder.png" 
}: UserProfileCardProps) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-white/40 border border-white/50">
      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
        <Image
          src={avatarUrl}
          alt={schoolName}
          width={40}
          height={40}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="min-w-0">
        <h4 className="text-sm font-semibold text-text-active truncate">
          {schoolName}
        </h4>
        <p className="text-xs text-text-muted truncate">
          {location}
        </p>
      </div>
    </div>
  );
}
