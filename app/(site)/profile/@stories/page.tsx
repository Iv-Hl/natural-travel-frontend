import TravellersStories from "@/components/profile/TravellersStories";

export default function SavedStoriesPage() {
  return (
    <TravellersStories
      source={{ type: "saved" }}
      emptyState={{
        text: "У вас ще немає збережених історій, мерщій збережіть вашу першу історію!",
        buttonText: "До історій",
        linkTo: "/stories",
      }}
      limit={6}
    />
  );
}