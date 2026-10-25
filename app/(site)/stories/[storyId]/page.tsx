import SaveStory from "@/components/stories/SaveStory/SaveStory";

interface StoryPageProps {
  params: Promise<{
    storyId: string;
  }>;
}

export default async function StoryPage({ params }: StoryPageProps) {
const { storyId } = await params;
  return (
    <>
      <h1>Історія подорожі</h1>
      <p>Тут буде історія, обрана за storyId. Дані ще не підключено.</p>
     <SaveStory storyId={storyId} />
    </>
  );
}

