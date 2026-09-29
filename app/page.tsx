"use client";

import JsBarcode from "jsbarcode";
import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "bibliotheque.nom";
const LABELS_PER_PAGE = 48;
const BARCODE_OPTIONS = {
  format: "CODE128",
  displayValue: false,
  width: 1.7,
  height: 52,
  margin: 0,
} as const;

type LabelItem = {
  id: number;
  libraryName: string;
  code: string;
};

function renderBarcode(svg: SVGSVGElement, code: string) {
  svg.replaceChildren();
  if (!code.trim()) return false;

  try {
    JsBarcode(svg, code, BARCODE_OPTIONS);
    return true;
  } catch {
    svg.replaceChildren();
    return false;
  }
}

function Label({ libraryName, code }: { libraryName: string; code: string }) {
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (barcodeRef.current) renderBarcode(barcodeRef.current, code);
  }, [code]);

  return (
    <div className="label-paper" aria-label={`Étiquette ${code}`}>
      <div className="label-name">{libraryName}</div>
      <svg ref={barcodeRef} role="img" aria-label={`Code-barres ${code}`} />
      <div className="label-code">{code}</div>
    </div>
  );
}

export default function Home() {
  const [libraryName, setLibraryName] = useState("");
  const [bookCode, setBookCode] = useState("");
  const [storageReady, setStorageReady] = useState(false);
  const [barcodeValid, setBarcodeValid] = useState(false);
  const [labels, setLabels] = useState<LabelItem[]>([]);
  const nextLabelId = useRef(0);
  const libraryInputRef = useRef<HTMLInputElement>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);
  const previewBarcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    try {
      setLibraryName(libraryInputRef.current?.value || localStorage.getItem(STORAGE_KEY) || "");
    } catch {
      // L'application reste utilisable si le stockage du navigateur est bloqué.
    }
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    try {
      localStorage.setItem(STORAGE_KEY, libraryName);
    } catch {
      // L'impression reste possible même sans stockage local.
    }
  }, [libraryName, storageReady]);

  useEffect(() => {
    if (previewBarcodeRef.current) {
      setBarcodeValid(renderBarcode(previewBarcodeRef.current, bookCode));
    }
  }, [bookCode]);

  const canAdd = libraryName.trim().length > 0 && barcodeValid;
  const pages = Array.from({ length: Math.ceil(labels.length / LABELS_PER_PAGE) }, (_, index) =>
    labels.slice(index * LABELS_PER_PAGE, (index + 1) * LABELS_PER_PAGE),
  );

  function addLabel() {
    if (!libraryName.trim() || !bookCode.trim()) return;

    // Vérification immédiate : un lecteur de codes peut envoyer Entrée très vite.
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    if (!renderBarcode(svg, bookCode)) return;

    const id = ++nextLabelId.current;
    const name = libraryName.trim();
    const code = bookCode;
    setLabels((current) => [
      ...current,
      { id, libraryName: name, code },
    ]);
    setBookCode("");
    codeInputRef.current?.focus();
  }

  return (
    <main className="page-layout mx-auto flex min-h-screen max-w-5xl flex-col items-center gap-10 px-5 py-10 md:gap-14 md:py-16">
      <header className="screen-only w-full text-center">
        <h1 className="text-4xl font-bold tracking-tight text-green-950 md:text-5xl">
          Étiquettes de bibliothèque
        </h1>
        <p className="mt-4 text-xl text-slate-700 md:text-2xl">
          Ajoutez vos livres, puis imprimez la planche entière.
        </p>
      </header>

      <section className="screen-only w-full max-w-2xl space-y-8" aria-label="Préparer une étiquette">
        <div>
          <label htmlFor="library-name" className="mb-3 block text-2xl font-bold">
            Nom de la bibliothèque
          </label>
          <input
            ref={libraryInputRef}
            id="library-name"
            type="text"
            value={libraryName}
            onChange={(event) => setLibraryName(event.target.value)}
            onInput={(event) => setLibraryName(event.currentTarget.value)}
            onBlur={(event) => setLibraryName(event.currentTarget.value)}
            placeholder="Ex. Bibliothèque municipale"
            autoComplete="off"
            className="w-full rounded-2xl border-2 border-slate-400 bg-white px-5 py-4 text-2xl shadow-sm outline-none focus:border-green-700 focus:ring-4 focus:ring-green-200"
          />
          <p className="mt-2 text-lg text-slate-600">Ce nom est mémorisé sur cet appareil.</p>
        </div>

        <div>
          <label htmlFor="book-code" className="mb-3 block text-2xl font-bold">
            Code ou numéro du livre
          </label>
          <input
            ref={codeInputRef}
            id="book-code"
            type="text"
            value={bookCode}
            onChange={(event) => setBookCode(event.target.value)}
            onFocus={() => {
              if (libraryInputRef.current) setLibraryName(libraryInputRef.current.value);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addLabel();
              }
            }}
            autoFocus
            autoComplete="off"
            spellCheck={false}
            placeholder="Scannez ou saisissez le code"
            className="w-full rounded-2xl border-2 border-slate-400 bg-white px-5 py-5 text-2xl shadow-sm outline-none focus:border-green-700 focus:ring-4 focus:ring-green-200 md:text-3xl"
          />
          {bookCode && !barcodeValid && (
            <p role="alert" className="mt-2 text-lg font-semibold text-red-700">
              Ce code contient un caractère incompatible avec CODE128.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={addLabel}
          disabled={!canAdd}
          className="min-h-20 w-full rounded-2xl bg-green-700 px-6 py-5 text-2xl font-bold text-white shadow-lg transition-colors hover:bg-green-800 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-green-700 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none md:text-3xl"
        >
          Ajouter à la planche
        </button>
        {!libraryName.trim() && (
          <p className="text-center text-lg text-slate-700">Saisissez d’abord le nom de la bibliothèque.</p>
        )}
      </section>

      <section className="screen-only flex w-full flex-col items-center gap-4" aria-label="Aperçu de la prochaine étiquette">
        <h2 className="text-2xl font-bold">Aperçu de la prochaine étiquette</h2>
        <div className="label-paper border border-slate-300 shadow-md">
          <div className="label-name">{libraryName || "Nom de la bibliothèque"}</div>
          <svg ref={previewBarcodeRef} role="img" aria-label={bookCode ? `Code-barres ${bookCode}` : "Code-barres"} />
          <div className="label-code">{bookCode || "Code du livre"}</div>
        </div>
      </section>

      <section className="sheet-section w-full" aria-label="Planche d’étiquettes">
        <div className="screen-only mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-3xl font-bold">Planche d’étiquettes ({labels.length})</h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => window.print()}
              disabled={labels.length === 0}
              className="min-h-16 rounded-2xl bg-green-700 px-6 py-3 text-xl font-bold text-white hover:bg-green-800 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-green-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              Imprimer la planche
            </button>
            <button
              type="button"
              onClick={() => {
                setLabels([]);
                codeInputRef.current?.focus();
              }}
              disabled={labels.length === 0}
              className="min-h-16 rounded-2xl border-2 border-slate-500 bg-white px-6 py-3 text-xl font-bold text-slate-800 hover:bg-slate-100 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Tout effacer
            </button>
          </div>
        </div>

        {labels.length === 0 && (
          <p className="screen-only rounded-2xl border-2 border-dashed border-slate-300 bg-white px-6 py-10 text-center text-xl text-slate-700">
            La planche est vide. Saisissez un code et appuyez sur Entrée.
          </p>
        )}

        <div className="sheet-pages space-y-8">
          {pages.map((page, pageIndex) => (
            <div className="sheet-page" key={page[0].id} aria-label={`Page ${pageIndex + 1}`}>
              {page.map((label) => (
                <Label key={label.id} libraryName={label.libraryName} code={label.code} />
              ))}
            </div>
          ))}
        </div>
        {labels.length > 0 && (
          <p className="screen-only mt-4 text-center text-lg text-slate-600">
            {pages.length} page{pages.length > 1 ? "s" : ""} A4 · {LABELS_PER_PAGE} étiquettes maximum par page
          </p>
        )}
      </section>
    </main>
  );
}
