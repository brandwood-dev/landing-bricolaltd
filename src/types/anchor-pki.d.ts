declare module 'anchor-pki/auto-cert/sni-callback' {
  export type SNICallback = (
    servername: string,
    cb: (err: Error | null, ctx: any) => void
  ) => void

  export interface SNICallbackOptions {
    name?: string
    cacheDir?: string
    allowIdentifiers?: string[] // ["host1.example.com", ...]
    directoryUrl?: string // ACME directory URL
    contact?: string // "mailto:you@domain"
    tosAcceptors?: any // Anchor’s tos acceptor object
    eabKid?: string // External Account Binding (if required)
    eabHmacKey?: string
  }

  export function createSNICallback(options: SNICallbackOptions): SNICallback
}

declare module 'anchor-pki/auto-cert/terms-of-service-acceptor' {
  export class TermsOfServiceAcceptor {
    static createAny(): any
    static createManual(
      // return true if user accepts TOS shown at this URL
      onTosUrl: (tosUrl: string) => boolean | Promise<boolean>
    ): any
  }
}
