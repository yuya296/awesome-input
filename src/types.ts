namespace AwesomeInput {
  export type EditableElement =
    | HTMLTextAreaElement
    | HTMLInputElement
    | HTMLElement;

  export interface AppState {
    overlay: HTMLDivElement | null;
    list: HTMLDivElement | null;
    queueRunning: boolean;
    queueCanceled: boolean;
  }
}
