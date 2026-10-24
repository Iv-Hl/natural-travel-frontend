import TravellersStories from "@/components/profile/TravellersStories";

const STORIES_LIMIT = 6;

export default function SavedStoriesPage() {
  return (
    <TravellersStories
      source={{
        type: "saved",
      }}
      emptyState={{
        text: "У вас ще немає збережених історій, мерщій збережіть вашу першу історію!",
        buttonText: "До історій",
        linkTo: "/stories",
      }}
      limit={STORIES_LIMIT}
    />
  );
}
