import browserCollections from "fumadocs-mdx:collections/browser";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useFumadocsLoader } from "fumadocs-core/source/client";
import type { DocsLayoutProps } from "fumadocs-ui/layouts/docs";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/layouts/docs/page";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { Suspense } from "react";
import { NotFound } from "@/components/not-found";
import { baseOptions } from "@/lib/layout.shared";

export const Route = createFileRoute("/$")({
  component: Page,
  loader: async ({ params }) => {
    const slugs = params._splat?.split("/") ?? [];
    const data = await serverLoader({ data: slugs });
    if (data.path) {
      await clientLoader.preload(data.path);
    }
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData?.frontmatter) {
      return {
        meta: [{ title: "Privacy Header Docs" }],
      };
    }
    return {
      meta: [
        { title: `${loaderData.frontmatter.title} - Privacy Header Docs` },
        { name: "description", content: loaderData.frontmatter.description },
      ],
    };
  },
});

const serverLoader = createServerFn({
  method: "GET",
})
  .inputValidator((slugs: string[]) => slugs)
  .handler(async ({ data: slugs }) => {
    const { source } = await import("@/lib/source");
    const page = source.getPage(slugs);

    return {
      path: page?.path,
      frontmatter: page
        ? {
            title: page.data.title,
            description: page.data.description,
          }
        : undefined,
      pageTree: await source.serializePageTree(source.getPageTree()),
    };
  });

const clientLoader = browserCollections.docs.createClientLoader({
  component(
    { toc, frontmatter, default: MDX },
    // you can define props for the component
    props: {
      className?: string;
    },
  ) {
    return (
      <DocsPage toc={toc} {...props}>
        <DocsTitle>{frontmatter.title}</DocsTitle>
        <DocsDescription>{frontmatter.description}</DocsDescription>
        <DocsBody>
          <MDX
            components={{
              ...defaultMdxComponents,
            }}
          />
        </DocsBody>
      </DocsPage>
    );
  },
});

function Content({
  data,
}: {
  data: { path: string; pageTree: DocsLayoutProps["tree"] };
}) {
  return (
    <DocsLayout {...baseOptions()} tree={data.pageTree}>
      <Suspense>
        {clientLoader.useContent(data.path, {
          className: "",
        })}
      </Suspense>
    </DocsLayout>
  );
}

function Page() {
  const data = useFumadocsLoader(Route.useLoaderData());

  if (!data.path) {
    return <NotFound pageTree={data.pageTree} />;
  }

  return (
    <Content
      data={data as { path: string; pageTree: DocsLayoutProps["tree"] }}
    />
  );
}
