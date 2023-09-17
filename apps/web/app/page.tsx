import { Card } from "ui";

const LINKS = [
  {
    title: "Docs",
    href: "https://turbo.build/repo/docs",
    description: "Find in-depth information about Turborepo features and API.",
  },
  {
    title: "Learn",
    href: "https://turbo.build/repo/docs/handbook",
    description: "Learn more about monorepos with our handbook.",
  }
];

export default function Page(): JSX.Element {
  return (
    <main className="h-screen w-full flex justify-center items-center bg-black">
      <div className="flex flex-col gap-4">
        {LINKS.map(({ title, href, description }) => (
          <Card className="rounded-full bg-white/80 p-2" href={href} key={title} title={title}>
            {description}
          </Card>
        ))}
      </div>
    </main>
  );
}
