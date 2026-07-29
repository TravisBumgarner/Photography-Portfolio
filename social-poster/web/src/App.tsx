import { useState } from 'react';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { CalendarView } from './components/CalendarView';
import { ActivityView } from './components/ActivityView';
import { PostModal } from './components/PostModal';
import { BulkAddModal } from './components/BulkAddModal';
import { TagCheckerModal } from './components/TagCheckerModal';
import { AccountsPanel } from './components/AccountsPanel';
import { SettingsPanel } from './components/SettingsPanel';
import type { Post } from './api/types';

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `tab ${isActive ? 'tab--active' : ''}`;

export default function App() {
  // null = closed; object = open (optional prefilled scheduled time).
  const [newPost, setNewPost] = useState<{ scheduledAt?: string } | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [showAccounts, setShowAccounts] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [showTagChecker, setShowTagChecker] = useState(false);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-dot" />
          Social Poster
        </div>

        <nav className="tabs">
          <NavLink to="/calendar" className={tabClass}>
            Calendar
          </NavLink>
          <NavLink to="/activity" className={tabClass}>
            Activity
          </NavLink>
        </nav>

        <div className="topbar-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setShowAccounts(true)}
          >
            Accounts
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setShowSettings(true)}
            aria-label="Settings"
            title="Settings"
          >
            ⚙
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setShowTagChecker(true)}
          >
            Tag checker
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => setShowBulkAdd(true)}
          >
            ⇪ Bulk add
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setNewPost({})}
          >
            + New post
          </button>
        </div>
      </header>

      <main className="content">
        <Routes>
          <Route path="/" element={<Navigate to="/calendar" replace />} />
          <Route
            path="/calendar"
            element={
              <CalendarView
                onEditPost={setEditingPost}
                onAddPost={(scheduledAt) => setNewPost({ scheduledAt })}
              />
            }
          />
          <Route
            path="/activity"
            element={<ActivityView onEditPost={setEditingPost} />}
          />
          <Route path="*" element={<Navigate to="/calendar" replace />} />
        </Routes>
      </main>

      {newPost && (
        <PostModal
          initialScheduledAt={newPost.scheduledAt}
          onClose={() => setNewPost(null)}
        />
      )}
      {editingPost && (
        <PostModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
        />
      )}
      {showBulkAdd && <BulkAddModal onClose={() => setShowBulkAdd(false)} />}
      {showTagChecker && (
        <TagCheckerModal onClose={() => setShowTagChecker(false)} />
      )}
      {showAccounts && (
        <AccountsPanel onClose={() => setShowAccounts(false)} />
      )}
      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}
