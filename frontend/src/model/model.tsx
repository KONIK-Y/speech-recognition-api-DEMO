// Ref: https://developer.mozilla.org/ja/docs/Web/API/SpeechRecognition
interface ISpeechRecognitionEvent {
    isTrusted?: boolean;
    resultIndex: number;
    results: {
      isFinal: boolean;
      [key: number]:
        | undefined
        | {
            transcript: string;
          };
    }[];
  }
  
  interface ISpeechRecognition extends EventTarget {
    // properties
    grammars: string;
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    maxAlternatives: number;
    serviceURI: string;
  
    // event handlers
    onaudiostart: () => void;
    onaudioend: () => void;
    onend: () => void;
    onerror: () => void;
    onnomatch: () => void;
    onresult: (event: ISpeechRecognitionEvent) => void;
    onsoundstart: () => void;
    onsoundend: () => void;
    onspeechstart: () => void;
    onspeechend: () => void;
    onstart: () => void;
  
    // methods
    abort(): void;
    start(): void;
    stop(): void;
  }

  export interface ISpeechRecognitionConstructor {
    new (): ISpeechRecognition;
  }
  
  // Window インターフェースを拡張
  interface IWindow extends Window {
    SpeechRecognition: ISpeechRecognitionConstructor;
    webkitSpeechRecognition: ISpeechRecognitionConstructor;
    AudioContext : typeof AudioContext;
  }

export default IWindow 