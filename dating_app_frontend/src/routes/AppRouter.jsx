import React from 'react';
import { Routes, Route } from 'react-router-dom';

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

// Simple, distinct placeholders for each route.
function Card({ title, description }) {
  return (
    <div className="op-card">
      <h1 className="op-title">{title}</h1>
      <p className="op-desc">{description}</p>
      <div className="op-actions">
        <button className="op-btn">Primary</button>
        <button className="op-btn op-btn-secondary">Secondary</button>
      </div>
    </div>
  );
}

function SwipePlaceholder() {
  return (
    <Card
      title="Discover"
      description="Swipe through profiles tailored to your preferences."
    />
  );
}

function MatchesPlaceholder() {
  return (
    <Card
      title="Matches"
      description="See people you’ve matched with and start a conversation."
    />
  );
}

function MessagesPlaceholder() {
  return (
    <Card
      title="Messages"
      description="Your recent conversations appear here."
    />
  );
}

function ChatPlaceholder() {
  return (
    <Card
      title="Chat"
      description="You’re viewing a conversation. Real-time chat coming soon."
    />
  );
}

function ProfilePlaceholder() {
  return (
    <Card
      title="Your Profile"
      description="Manage your details, preferences, and settings."
    />
  );
}

function NotFound() {
  return (
    <div className="op-card">
      <h1 className="op-title">404</h1>
      <p className="op-desc">The page you’re looking for doesn’t exist.</p>
    </div>
  );
}
