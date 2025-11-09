import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Card, Button, Modal, Icon } from '../components/common';

/**
 * PUBLIC_INTERFACE
 * AppRouter defines the main application routes.
 * Routes:
 * - "/" -> Swipe placeholder
 * - "/matches" -> Matches placeholder
 * - "/messages" -> Conversations placeholder
 * - "/messages/:id" -> Chat placeholder
 * - "/profile" -> Profile placeholder
 * - "*" -> 404 Not Found
 */
export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<SwipePlaceholder />} />
      <Route path="/matches" element={<MatchesPlaceholder />} />
      <Route path="/messages" element={<MessagesPlaceholder />} />
      <Route path="/messages/:id" element={<ChatPlaceholder />} />
      <Route path="/profile" element={<ProfilePlaceholder />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

// Simple, distinct placeholders for each route integrated with common components.
function SwipePlaceholder() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Card
        title="Discover"
        subtitle="Swipe through profiles tailored to your preferences."
        actions={<Button variant="secondary" size="sm" onClick={() => setOpen(true)}>Learn more</Button>}
      >
        <p className="op-desc" style={{ marginTop: 4 }}>
          Use the like or pass buttons to curate your recommendations.
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <Button variant="ghost" iconLeft="close">Pass</Button>
          <Button variant="primary" iconLeft="heart">Like</Button>
        </div>
      </Card>
      <Modal open={open} onClose={() => setOpen(false)} title="How Discover works">
        <p>
          We use your preferences and interactions to show the most relevant profiles.
          Tap the heart <Icon name="heart" aria-hidden /> to like or the close <Icon name="close" aria-hidden /> to pass.
        </p>
      </Modal>
    </>
  );
}

function MatchesPlaceholder() {
  return (
    <Card
      title="Matches"
      subtitle="See people you’ve matched with and start a conversation."
    >
      <div style={{ display: 'flex', gap: 10 }}>
        <Button variant="primary" iconRight="arrow-right">View Matches</Button>
        <Button variant="secondary">Filters</Button>
      </div>
    </Card>
  );
}

function MessagesPlaceholder() {
  return (
    <Card
      title="Messages"
      subtitle="Your recent conversations appear here."
    >
      <div style={{ display: 'flex', gap: 10 }}>
        <Button variant="primary" iconLeft="message">New Message</Button>
        <Button variant="ghost">Inbox Settings</Button>
      </div>
    </Card>
  );
}

function ChatPlaceholder() {
  return (
    <Card
      title="Chat"
      subtitle="You’re viewing a conversation. Real-time chat coming soon."
    >
      <div style={{ display: 'flex', gap: 10 }}>
        <Button variant="secondary" iconLeft="settings">Chat Settings</Button>
      </div>
    </Card>
  );
}

function ProfilePlaceholder() {
  return (
    <Card
      title="Your Profile"
      subtitle="Manage your details, preferences, and settings."
    >
      <div style={{ display: 'flex', gap: 10 }}>
        <Button variant="primary">Edit Profile</Button>
        <Button variant="ghost">Preview</Button>
      </div>
    </Card>
  );
}

function NotFound() {
  return (
    <Card title="404 - Not found" subtitle="The page you’re looking for doesn’t exist." />
  );
}
