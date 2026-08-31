import { useState, type ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
}

export default function Tabs({ tabs, defaultTab, className = '' }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div className={className}>
      {/* Tab list */}
      <div className="flex border-b border-border overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-terracotta text-terracotta'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
            }`}
          >
            {tab.icon && <span>{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-4">{activeContent}</div>
    </div>
  );
}

// Simpler tabs for code examples
interface CodeTab {
  lang: string;
  label: string;
  code: string;
}

interface CodeTabsProps {
  tabs: CodeTab[];
  className?: string;
}

export function CodeTabs({ tabs, className = '' }: CodeTabsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.lang);

  const activeCode = tabs.find((tab) => tab.lang === activeTab)?.code;

  return (
    <div className={`rounded-xl overflow-hidden border border-border ${className}`}>
      {/* Tab header */}
      <div className="flex items-center justify-between bg-gray-800 px-4 py-2">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.lang}
              onClick={() => setActiveTab(tab.lang)}
              className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                activeTab === tab.lang
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            if (activeCode) {
              navigator.clipboard.writeText(activeCode);
            }
          }}
          className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          Copy
        </button>
      </div>

      {/* Code content */}
      <pre className="p-4 bg-gray-900 overflow-x-auto">
        <code className="text-sm font-mono text-gray-100">{activeCode}</code>
      </pre>
    </div>
  );
}
