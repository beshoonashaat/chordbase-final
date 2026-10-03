/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useChordbaseStore } from './store/useChordbaseStore';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import CommandMenu from './components/CommandMenu';
import DashboardView from './components/DashboardView';
import ImportView from './components/ImportView';
import LibraryView from './components/LibraryView';
import SettingsView from './components/SettingsView';

// Initialize TanStack Query client for future-proof API data synchronization
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  const { activeView } = useChordbaseStore();

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'import':
        return <ImportView />;
      case 'library':
        return <LibraryView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div id="chordbase-app-root" className="flex h-screen w-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
        {/* Sleek Sidebar Navigation */}
        <Sidebar />

        {/* Main Panel Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full relative">
          {/* Top Bar Utilities & Global Search Launchers */}
          <TopBar />

          {/* Scrolling Panel Body with clean margin bounds */}
          <main className="flex-1 overflow-y-auto px-8 py-8">
            <div className="max-w-6xl mx-auto w-full">
              {renderActiveView()}
            </div>
          </main>
        </div>

        {/* Global Command Palette Trigger Overlay */}
        <CommandMenu />
      </div>
    </QueryClientProvider>
  );
}
