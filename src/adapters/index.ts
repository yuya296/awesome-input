namespace AwesomeInput {
  const registeredAdapters: SiteAdapter[] = [chatgptAdapter, geminiAdapter];

  export function getRegisteredAdapters(): SiteAdapter[] {
    return registeredAdapters.slice();
  }

  export function isRegisteredSite(hostname: string = currentHostname()): boolean {
    return registeredAdapters.some((adapter) => adapter.matches(hostname));
  }

  export function resolveSiteAdapter(hostname: string = currentHostname()): SiteAdapter {
    return registeredAdapters.find((adapter) => adapter.matches(hostname)) || baseAdapter;
  }
}
