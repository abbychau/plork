import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">About Plork</h1>

      <div className="prose max-w-none">
        <p className="text-lg mb-4">
          Plork is a minimal social network that connects with the wider Fediverse, allowing you to interact with users across many different platforms.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Philosophy</h2>
        <p className="mb-4">
          We believe in a decentralized social web where users have control over their data and can choose where and how they participate online.
        </p>
        <p className="mb-4">
          Plork is built on these core principles:
        </p>
        <ul className="list-disc pl-6 mb-6">
          <li className="mb-2"><strong>Simplicity:</strong> A clean, distraction-free interface that puts content first</li>
          <li className="mb-2"><strong>Connectivity:</strong> Seamless interaction with the wider Fediverse</li>
          <li className="mb-2"><strong>Privacy:</strong> Your data belongs to you</li>
          <li className="mb-2"><strong>Community:</strong> Building meaningful connections across platforms</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">What is the Fediverse?</h2>
        <p className="mb-4">
          The Fediverse (a combination of "federation" and "universe") is a network of interconnected servers that communicate with each other using open protocols like ActivityPub.
        </p>
        <p className="mb-4">
          This means you can follow and interact with users on other platforms like Mastodon, Pleroma, and more - all from your Plork account. It's like being able to follow Instagram users from your Twitter account!
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Features</h2>
        <ul className="list-disc pl-6 mb-6">
          <li className="mb-2">Create and share posts with the entire Fediverse</li>
          <li className="mb-2">Follow users on Plork and other Fediverse platforms</li>
          <li className="mb-2">Like and comment on content across the Fediverse</li>
          <li className="mb-2">Discover trending topics and hashtags</li>
          <li className="mb-2">Simple, clean interface focused on content</li>
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
