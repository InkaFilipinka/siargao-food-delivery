"use client";

import { X, Share2, Plus } from "lucide-react";
import type { NotificationPlatform } from "@/lib/platform";

interface AddToAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: NotificationPlatform;
}

const IOS_STEPS = [
  "Tap the Share button (square with arrow) at the bottom of Safari",
  'Tap "Add to Home Screen"',
  "Tap Add, then open the app from your home screen",
  "Return here and tap 'Get push notifications' again to allow notifications",
];

const MACOS_STEPS = [
  "In the Safari menu bar, click File → Add to Dock",
  "Or click the Share button in the toolbar and choose Add to Dock",
  "Open the app from your Dock",
  "Return here and tap 'Get push notifications' again to allow notifications",
];

export function AddToAppModal({ isOpen, onClose, platform }: AddToAppModalProps) {
  if (!isOpen) return null;

  const isIOS = platform === "ios";
  const steps = isIOS ? IOS_STEPS : MACOS_STEPS;
  const title = isIOS ? "Add to Home Screen" : "Add to Dock";
  const subtext = isIOS
    ? "To receive push notifications on iPhone or iPad, add this website to your home screen first."
    : "To receive push notifications on Mac, add this website to your Dock first.";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">{subtext}</p>
        <ol className="space-y-3">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary font-medium flex items-center justify-center text-xs">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
        {isIOS && (
          <div className="mt-6 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Share2 className="w-4 h-4 flex-shrink-0" />
            <span>The Share button looks like a square with an arrow pointing up</span>
          </div>
        )}
        {!isIOS && (
          <div className="mt-6 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Plus className="w-4 h-4 flex-shrink-0" />
            <span>File → Add to Dock adds this site as an app in your Dock</span>
          </div>
        )}
        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
