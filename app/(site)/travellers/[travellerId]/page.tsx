import MessageNoStories from "@/components/shared/MessageNoStories";
import { routes } from "@/constants/routes";
import styles from "./page.module.css";

interface TravellerPageProps {
  params: Promise<{
    travellerId: string;
  }>;
}

interface Traveller {
  _id: string;
  name: string;
  avatarUrl: string | null;
  articlesAmount: number;
}

interface TravellerResponse {
  user: Traveller;
  stories: unknown[];
  pagination: {
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
  };
  message?: string;
}

async function getTraveller(
  travellerId: string,
): Promise<TravellerResponse | null> {
  try {
    const backendUrl = process.env.BACKEND_API_URL ?? "http://localhost:3000";

    const response = await fetch(
      `${backendUrl.replace(/\/+$/, "")}/api/users/${encodeURIComponent(travellerId)}`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as TravellerResponse;
  } catch {
    return null;
  }
}

export default async function TravellerPage({ params }: TravellerPageProps) {
  const { travellerId } = await params;
  const data = await getTraveller(travellerId);

  if (!data?.user) {
    return (
      <div className={styles.page}>
        <MessageNoStories
          text="Не вдалося знайти цього мандрівника"
          buttonText="Назад до історій"
          linkTo={routes.stories}
        />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <section className={styles.storiesSection}>
        <h2 className={styles.sectionTitle}>Історії Мандрівника</h2>

        {data.stories.length === 0 && (
          <MessageNoStories
            text="Цей користувач ще не публікував історій"
            buttonText="Назад до історій"
            linkTo={routes.stories}
          />
        )}
      </section>
    </div>
  );
}
