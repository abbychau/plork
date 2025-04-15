import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">About Plork</h1>
      
      <div className="prose max-w-none">
        <p className="text-lg mb-4">
          Plork is a minimal ActivityPub-compatible social network that connects with the Fediverse.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">What is ActivityPub?</h2>
        <p className="mb-4">
          ActivityPub is a decentralized social networking protocol that provides a client-to-server API for creating, updating, and deleting content, as well as a server-to-server API for delivering notifications and content.
        </p>
        <p className="mb-4">
          It&apos;s the protocol that powers the Fediverse, a network of interconnected servers that can communicate with each other, allowing users on different servers to interact with each other.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Features</h2>
        <ul className="list-disc pl-6 mb-6">
          <li className="mb-2">Create and share posts with the Fediverse</li>
          <li className="mb-2">Follow users on Plork and other Fediverse platforms</li>
          <li className="mb-2">Like and interact with content across the Fediverse</li>
          <li className="mb-2">Simple, clean interface focused on content</li>
          <li className="mb-2">Built with modern web technologies</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Technology Stack</h2>
        <ul className="list-disc pl-6 mb-6">
          <li className="mb-2">Next.js for the frontend and API routes</li>
          <li className="mb-2">React for the user interface</li>
          <li className="mb-2">Shadcn UI for the component library</li>
          <li className="mb-2">SQLite for the database</li>
          <li className="mb-2">Prisma as the ORM</li>
        </ul>
        
        <div className="mt-8">
          <Link href="/register">
            <Button size="lg">Join Plork Today</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
