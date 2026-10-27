import { notFound } from "next/navigation";
import StoryDetails, {
    type Story,
  } from "@/components/stories/StoryDetails/StoryDetails";
import SaveStory from "@/components/stories/SaveStory/SaveStory";

interface StoryPageProps {
  params: Promise<{
    storyId: string;
  }>;
}
 
  async function getStory(storyId: string): Promise<Story> {
    if (!/^[a-f\d]{24}$/i.test(storyId)) {
      notFound();
    }

    const backendUrl = process.env.BACKEND_API_URL ?? "http://localhost:3000";

    const url = new URL(
      `/api/stories/${encodeURIComponent(storyId)}`,
      backendUrl,
    );

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (response.status === 404) {
      notFound();
    }

    if (!response.ok) {
      throw new Error(
        `Не вдалося завантажити історію. Статус: ${response.status}`,
      );
    }

    return (await response.json()) as Story;
  }
  export default async function StoryPage({ params }: StoryPageProps) {
 
    const { storyId } = await params;
    const story = await getStory(storyId);
    return (
      <>
        <StoryDetails story={story} />

        {/* Тут компонент збереження історії іншого учасника */}
        <SaveStory storyId={storyId}
          initialIsSaved={false} />
        
        {/* Тут компонент рекомендованих історій іншого учасника */}
      </>
    );
  }

