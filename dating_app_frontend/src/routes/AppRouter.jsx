import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Card, Button } from '../components/common';
import SwipeDeck from '../features/swipe/SwipeDeck';
import MatchesList from '../features/matches/MatchesList';

/**
 * PUBLIC_INTERFACE
 * AppRouter defines the main application routes.
 * Routes:
 * - "/" -> Swipe deck
 * - "/matches" -> Matches list
 * - "/messages" -> Conversations placeholder
 * - "/messages/:id" -> Chat placeholder
 * - "/profile" -> Profile placeholder
 * - "*" -> 404 Not Found
 */
export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<SwipeDeck />} />
      <Route path="/matches" element={<MatchesList />} />
      <Route path="/messages" element={<MessagesPlaceholder />} />
      <Route path="/messages/:id" element={<ChatPlaceholder />} />
      <Route path="/profile" element={<ProfilePlaceholder />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
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
