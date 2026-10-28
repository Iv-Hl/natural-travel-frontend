import MessageNoStories from "@/components/shared/MessageNoStories";
import { routes } from "@/constants/routes";
import styles from "./page.module.css";
import TravellerInfo from "@/components/profile/TravellerInfo/TravellerInfo";
import TravellersStories from "@/components/profile/TravellersStories";
import PageTitle from "@/components/PageTitle/PageTitle";

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

type TravellerResult =
  | { status: "success"; data: TravellerResponse }
  | { status: "not-found"; message: string }
  | { status: "error"; message: string };

const NOT_FOUND_MESSAGE = "Такий користувач відсутній";
const ERROR_MESSAGE =
  "Не вдалося завантажити профіль мандрівника. Спробуйте пізніше.";

async function getTraveller(travellerId: string): Promise<TravellerResult> {
  try {
    const backendUrl = (
      process.env.BACKEND_API_URL ?? "http://localhost:3000"
    ).replace(/\/+$/, "");

    const apiUrl = backendUrl.endsWith("/api")
      ? backendUrl
      : `${backendUrl}/api`;

    const response = await fetch(
      `${apiUrl}/users/${encodeURIComponent(travellerId)}`,
      {
        cache: "no-store",
      },
    );

    let responseData: Partial<TravellerResponse> = {};

    try {
      responseData = await response.json();
    } catch {}

    const backendMessage =
      typeof responseData.message === "string" && responseData.message.trim()
        ? responseData.message
        : null;

    if (response.status === 404) {
      return {
        status: "not-found",
        message: backendMessage ?? NOT_FOUND_MESSAGE,
      };
    }

    if (!response.ok) {
      return {
        status: "error",
        message: backendMessage ?? ERROR_MESSAGE,
      };
    }

    if (!responseData.user) {
      return {
        status: "error",
        message: ERROR_MESSAGE,
      };
    }

    const data = responseData as TravellerResponse;

    return {
      status: "success",
      data: {
        ...data,
        stories: Array.isArray(data.stories) ? data.stories : [],
      },
    };
  } catch {
    return {
      status: "error",
      message: ERROR_MESSAGE,
    };
  }
}

export default async function TravellerPage({ params }: TravellerPageProps) {
  const { travellerId } = await params;
  const result = await getTraveller(travellerId);

  if (result.status !== "success") {
    return (
      <div className={styles.page}>
        <MessageNoStories
          text={result.message}
          buttonText="Назад до історій"
          buttonVariant="back"
          linkTo={routes.stories}
        />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <TravellerInfo userId={travellerId} />

      <section className={styles.storiesSection}>
        <h2 className={styles.sectionTitle}>Статті Мандрівника</h2>

        <TravellersStories travellerId={travellerId} />
      </section>
    </div>
  );
}
