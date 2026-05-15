'use client';

import React from 'react';
import { Settings, Shield, User, Bell } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in">
      <header className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight text-on-surface uppercase">Core Settings</h1>
        <p className="text-sm font-bold text-outline-variant tracking-widest uppercase">Manage your intelligence dashboard preferences.</p>
      </header>

      <div className="grid gap-6">
        {/* Profile Section */}
        <section className="bg-surface-container-low border border-outline-variant/30 p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-3 border-b border-outline-variant/20 pb-4">
            <User className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-black tracking-widest text-on-surface uppercase">Profile & Accounts</h2>
          </div>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-on-surface-variant">Connected Accounts settings will be populated here.</p>
          </div>
        </section>

        {/* Intelligence Section */}
        <section className="bg-surface-container-low border border-outline-variant/30 p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-3 border-b border-outline-variant/20 pb-4">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-black tracking-widest text-on-surface uppercase">AI Intelligence & Privacy</h2>
          </div>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-on-surface-variant">Configure AI processing rules and token usage limits.</p>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="bg-surface-container-low border border-outline-variant/30 p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-3 border-b border-outline-variant/20 pb-4">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-black tracking-widest text-on-surface uppercase">Notifications</h2>
          </div>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-on-surface-variant">Manage push notifications and priority alerts.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
