declare namespace chrome {
  namespace tabs {
    function query(
      queryInfo: { active: boolean; currentWindow: boolean },
      callback: (tabs: chrome.tabs.Tab[]) => void
    ): void;

    function sendMessage(
      tabId: number,
      message: any,
      callback?: (response: any) => void
    ): void;

    interface Tab {
      id?: number;
      url?: string;
      title?: string;
      active: boolean;
      windowId: number;
    }
  }

  namespace runtime {
    function sendMessage(
      message: any,
      callback?: (response: any) => void
    ): void;

    const onMessage: {
      addListener(
        callback: (
          message: any,
          sender: any,
          sendResponse: (response?: any) => void
        ) => void | boolean
      ): void;
    };
  }
}
