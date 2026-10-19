import Image from "next/image";
import styles from "./TravellerInfo.module.css";

interface TravellerInfoProps {
  avatar?: string | null;
  name: string;
  articlesCount: number;
}

export default function TravellerInfo({
  avatar,
  name,
  articlesCount,
}: TravellerInfoProps) {
  // Заглушка аватара
  const defaultAvatar =
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";

  return (
    <div className={styles.travellerCard}>
      <div className={styles.avatarWrapper}>
        <Image
          src={avatar || defaultAvatar}
          alt={name}
          width={80}
          height={80}
          className={styles.avatar}
          unoptimized
        />
      </div>
      <div className={styles.details}>
        <h1 className={styles.name}>{name}</h1>
        <p className={styles.count}>Статей: {articlesCount}</p>
      </div>
    </div>
  );
}
