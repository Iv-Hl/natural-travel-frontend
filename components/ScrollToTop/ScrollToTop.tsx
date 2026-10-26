"use client";

import { useEffect } from "react";

interface ScrollToTopProps {
  trigger: unknown;
}

const ScrollToTop = ({ trigger }: ScrollToTopProps) => {
  useEffect(() => {
    if (trigger === null || trigger === undefined) return;

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [trigger]);

  return null;
};

export default ScrollToTop;

{
  /* <>
  <ScrollToTop trigger={stories} />

  <div>
    {stories.map((story) => (
      <StoryCard
        key={story._id}
        {...story}
      />
    ))}
  </div>
</> */
}
