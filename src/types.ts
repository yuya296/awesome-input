namespace AwesomeInput {
  export type EditableElement =
    | HTMLTextAreaElement
    | HTMLInputElement
    | HTMLElement;

  export interface SiteAdapter {
    id: string;
    matches(hostname: string): boolean;
    findComposer(): EditableElement | null;
    findSendButton(composer: EditableElement | null): HTMLButtonElement | null;
    insertNewline(composer: EditableElement): boolean;
  }
}
