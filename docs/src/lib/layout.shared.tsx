import type { DocsLayoutProps } from "fumadocs-ui/layouts/docs";

export function baseOptions(): Omit<DocsLayoutProps, "tree"> {
  return {
    nav: {
      title: (
        <>
          <img
            src={`${import.meta.env.BASE_URL}logo.svg`.replace(/\/+/g, "/")}
            alt="Privacy Header Logo"
            className="size-6"
          />
          <span className="font-semibold">Privacy Header</span>
        </>
      ),
    },
    sidebar: {
      collapsible: true,
    },
  };
}
