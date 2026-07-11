import { useState } from 'react';

const installMethods = [
  {
    id: 'pip',
    label: 'Python',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z"/>
      </svg>
    ),
    command: 'pip install stratadb',
  },
  {
    id: 'npm',
    label: 'Node.js',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    command: 'npm install @stratadb/core',
  },
  {
    id: 'cargo',
    label: 'Rust',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.687 11.709l-.995-.616a13.559 13.559 0 0 0-.028-.29l.855-.797a.344.344 0 0 0-.114-.521l-1.084-.535a11.882 11.882 0 0 0-.086-.282l.682-.944a.344.344 0 0 0-.208-.483l-1.142-.368a11.094 11.094 0 0 0-.14-.268l.485-1.058a.344.344 0 0 0-.293-.437l-1.17-.185a9.903 9.903 0 0 0-.19-.244l.274-1.138a.344.344 0 0 0-.366-.382l-1.17.011a10.643 10.643 0 0 0-.234-.213l.055-1.183a.344.344 0 0 0-.43-.317l-1.14.206a11.593 11.593 0 0 0-.27-.178l-.161-1.193a.344.344 0 0 0-.481-.243l-1.078.396c-.102-.05-.204-.1-.307-.148l-.367-1.164a.344.344 0 0 0-.52-.158l-.986.58a12.368 12.368 0 0 0-.332-.112l-.559-1.102a.344.344 0 0 0-.544-.064l-.867.748a14.143 14.143 0 0 0-.347-.071l-.731-1.003a.344.344 0 0 0-.551.031l-.723.889c-.123-.015-.245-.03-.369-.041l-.877-.877a.344.344 0 0 0-.539.124l-.561 1.004c-.124.002-.247.007-.37.015l-.999-.725a.344.344 0 0 0-.51.214l-.386 1.092a13.477 13.477 0 0 0-.358.058l-1.091-.551a.344.344 0 0 0-.463.295l-.202 1.147c-.115.037-.23.076-.344.118l-1.151-.362a.344.344 0 0 0-.402.363l-.008 1.168c-.109.055-.216.112-.322.171l-1.177-.165a.344.344 0 0 0-.327.416l.186 1.155a12.05 12.05 0 0 0-.288.219l-1.168.036a.344.344 0 0 0-.241.454l.375 1.113a10.44 10.44 0 0 0-.243.261l-1.123.236a.344.344 0 0 0-.148.476l.553 1.04c-.064.099-.127.199-.188.3l-1.044.43a.344.344 0 0 0-.05.483l.717.935c-.046.105-.091.21-.134.317l-.934.614a.344.344 0 0 0 .047.478l.857.81c-.027.11-.05.222-.072.333l-.795.784a.344.344 0 0 0 .142.462l.969.666c-.005.111-.009.222-.009.333l.009.333-.97.666a.344.344 0 0 0-.141.462l.795.784c.021.111.045.222.072.333l-.858.81a.344.344 0 0 0-.046.478l.934.614c.043.106.088.212.134.317l-.717.935a.344.344 0 0 0 .05.483l1.044.43c.06.101.124.202.188.3l-.554 1.04a.344.344 0 0 0 .149.476l1.123.236c.079.088.16.175.243.261l-.375 1.113a.344.344 0 0 0 .24.454l1.169.036c.106.073.213.145.322.171l-.186 1.155a.344.344 0 0 0 .327.416l1.177-.165c.106.059.213.116.322.171l.008 1.168a.344.344 0 0 0 .402.363l1.151-.362c.114.042.229.081.344.118l.202 1.147a.344.344 0 0 0 .463.295l1.091-.551c.118.021.238.04.358.058l.386 1.092a.344.344 0 0 0 .51.214l.999-.725c.123.008.246.013.37.015l.561 1.004a.344.344 0 0 0 .539.124l.877-.877c.124-.011.246-.026.369-.041l.723.889a.344.344 0 0 0 .551.031l.731-1.003c.114-.02.231-.044.347-.071l.867.748a.344.344 0 0 0 .544-.064l.559-1.102c.109-.034.221-.071.332-.112l.986.58a.344.344 0 0 0 .52-.158l.367-1.164c.103-.047.205-.098.307-.148l1.078.396a.344.344 0 0 0 .481-.243l.161-1.193c.091-.057.181-.117.27-.178l1.14.206a.344.344 0 0 0 .43-.317l-.055-1.183c.079-.07.157-.141.234-.213l1.17.011a.344.344 0 0 0 .366-.382l-.274-1.138c.065-.08.128-.161.19-.244l1.17-.185a.344.344 0 0 0 .293-.437l-.485-1.058c.049-.088.095-.177.14-.268l1.142-.368a.344.344 0 0 0 .208-.483l-.682-.944c.031-.093.06-.187.086-.282l1.084-.535a.344.344 0 0 0 .114-.521l-.855-.797c.012-.096.02-.193.028-.29l.995-.616a.344.344 0 0 0 .013-.548zM12.044 18.373c-3.52 0-6.373-2.854-6.373-6.373s2.854-6.373 6.373-6.373c3.52 0 6.373 2.854 6.373 6.373s-2.854 6.373-6.373 6.373z"/>
      </svg>
    ),
    command: 'cargo install strata-cli',
  },
  {
    id: 'brew',
    label: 'Homebrew',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6.058 16.272c-.485-.166-.714-.553-.573-1.04.157-.541.571-.666 1.112-.48.541.186.666.6.509 1.141-.157.542-.562.544-1.048.379zm.98-7.37c.167.485.553.714 1.04.573.541-.157.666-.571.48-1.112-.186-.541-.6-.666-1.141-.509-.542.157-.545.562-.379 1.048zm8.853-3.08c-.167-.485-.553-.714-1.04-.573-.541.157-.666.571-.48 1.112.186.541.6.666 1.141.509.542-.157.545-.562.379-1.048zm-4.09 7.39c.167.485.553.714 1.04.573.541-.157.666-.571.48-1.112-.186-.541-.6-.666-1.141-.509-.542.157-.545.562-.379 1.048zm-.762 3.35a.757.757 0 0 0-.928.536.757.757 0 0 0 .536.928.757.757 0 0 0 .928-.536.757.757 0 0 0-.536-.928zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22.5C6.21 22.5 1.5 17.79 1.5 12S6.21 1.5 12 1.5 22.5 6.21 22.5 12 17.79 22.5 12 22.5z"/>
      </svg>
    ),
    command: 'brew install stratalab/tap/strata',
  },
  {
    id: 'binary',
    label: 'Script',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    command: 'curl -fsSL https://stratadb.org/install.sh | sh',
  },
];

export default function InstallTabs() {
  const [activeTab, setActiveTab] = useState('pip');
  const [copied, setCopied] = useState(false);

  const activeMethod = installMethods.find(m => m.id === activeTab);

  const handleCopy = async () => {
    if (activeMethod) {
      await navigator.clipboard.writeText(activeMethod.command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="flex justify-center border-b border-white/5">
        {installMethods.map((method) => (
          <button
            key={method.id}
            onClick={() => setActiveTab(method.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === method.id
                ? 'border-terracotta text-terracotta'
                : 'border-transparent text-text-muted hover:text-text-secondary'
            }`}
          >
            <span className={activeTab === method.id ? 'text-terracotta' : 'text-text-muted'}>
              {method.icon}
            </span>
            {method.label}
          </button>
        ))}
      </div>

      {/* Command display */}
      <div className="mt-6 relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-terracotta/20 to-strata-vector/20 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-opacity" />
        <div className="relative bg-background-subtle border border-white/5 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
              <span className="ml-2 text-text-muted text-sm font-mono">terminal</span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors text-sm px-3 py-1 rounded-lg hover:bg-white/5"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="px-5 py-5">
            <code className="text-text-primary font-mono text-base">
              <span className="text-terracotta">$ </span>
              {activeMethod?.command}
            </code>
          </div>
        </div>
      </div>

      {/* Version info */}
      <p className="mt-6 text-center text-sm text-text-muted">
        Current version: <span className="font-mono text-text-secondary">0.12.5</span> •{' '}
        <a href="/changelog" className="text-terracotta hover:text-terracotta-light transition-colors">
          View changelog
        </a>
      </p>
    </div>
  );
}
