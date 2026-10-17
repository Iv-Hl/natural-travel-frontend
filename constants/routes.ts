export const routes = {
  home: "/",
  register: "/auth/register",
  login: "/auth/login",
  stories: "/stories",
  story: (storyId: string) => `/stories/${encodeURIComponent(storyId)}`,
  newStory: "/stories/new",
  travellers: "/travellers",
  traveller: (travellerId: string) =>
    `/travellers/${encodeURIComponent(travellerId)}`,
  profile: "/profile",
  ownStories: "/profile/own",
} as const;
