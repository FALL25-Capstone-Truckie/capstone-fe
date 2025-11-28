declare module "html2pdf.js" {
  interface Html2PdfOptions {
    margin?: number | [number, number] | [number, number, number, number];
    filename?: string;
    image?: {
      type?: "jpeg" | "png" | "webp";
      quality?: number;
    };
    enableLinks?: boolean;
    html2canvas?: {
      scale?: number;
      useCORS?: boolean;
      allowTaint?: boolean;
      backgroundColor?: string;
      logging?: boolean;
      letterRendering?: boolean;
      scrollX?: number;
      scrollY?: number;
      windowWidth?: number;
      windowHeight?: number;
    };
    jsPDF?: {
      unit?: "pt" | "mm" | "cm" | "in";
      format?: "a0" | "a1" | "a2" | "a3" | "a4" | "a5" | "a6" | "letter" | "legal" | [number, number];
      orientation?: "portrait" | "landscape";
      compress?: boolean;
    };
    pagebreak?: {
      mode?: string | string[];
      before?: string | string[];
      after?: string | string[];
      avoid?: string | string[];
    };
  }

  interface Html2PdfWorker {
    set(options: Html2PdfOptions): Html2PdfWorker;
    from(element: HTMLElement | string): Html2PdfWorker;
    save(): Promise<void>;
    output(type: "blob"): Promise<Blob>;
    output(type: "datauristring"): Promise<string>;
    output(type: "arraybuffer"): Promise<ArrayBuffer>;
    outputPdf(type: "blob"): Promise<Blob>;
    outputPdf(type: "datauristring"): Promise<string>;
    outputPdf(type: "arraybuffer"): Promise<ArrayBuffer>;
    then<T>(callback: (worker: Html2PdfWorker) => T): Promise<T>;
  }

  function html2pdf(): Html2PdfWorker;
  function html2pdf(element: HTMLElement, options?: Html2PdfOptions): Promise<void>;

  export = html2pdf;
}
