import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Card } from '../components/common';
import SwipeDeck from '../features/swipe/SwipeDeck';
import MatchesList from '../features/matches/MatchesList';
import ConversationsList from '../features/messages/ConversationsList';
import ChatWindow from '../features/messages/ChatWindow';
import ProfileView from '../features/profile/ProfileView';

/**
 * PUBLIC_INTERFACE
 * AppRouter defines the main application routes.
 * Routes:
 * - "/" -> Swipe deck
 * - "/matches" -> Matches list
 * - "/messages" -> Conversations list
 * - "/messages/:id" -> Chat window
 * - "/profile" -> Profile view
 * - "*" -> 404 Not Found
 */
export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<SwipeDeck />} />
      <Route path="/matches" element={<MatchesList />} />
      <Route path="/messages" element={<ConversationsList />} />
      <Route path="/messages/:id" element={<ChatWindow />} />
      <Route path="/profile" element={<ProfileView />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function NotFound() {
  return (
    <Card title="404 - Not found" subtitle="The page you’re looking for doesn’t exist." />
  );
}
